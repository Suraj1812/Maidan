-- Maidan RPC functions: transactional logic that must be atomic and trusted.
-- All are security definer with search_path locked, and re-check permissions internally
-- because they run with elevated privilege regardless of caller's RLS.

-- ============================================================
-- Accept a squad invite (creates membership + closes invite atomically)
-- ============================================================
create or replace function accept_squad_invite(p_invite_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_invite squad_invites%rowtype;
begin
  select * into v_invite from squad_invites where id = p_invite_id for update;
  if not found then
    raise exception 'Invite not found';
  end if;
  if v_invite.invited_user_id <> auth.uid() then
    raise exception 'Not your invite';
  end if;
  if v_invite.status <> 'pending' then
    raise exception 'Invite already resolved';
  end if;

  update squad_invites set status = 'accepted', responded_at = now() where id = p_invite_id;
  insert into squad_members (squad_id, user_id, role)
  values (v_invite.squad_id, v_invite.invited_user_id, 'member')
  on conflict do nothing;

  insert into notifications (user_id, type, title, body, link)
  select captain_id, 'invite_accepted', 'Invite accepted',
         (select full_name from profiles where id = auth.uid()) || ' joined ' || name,
         '/squads/' || slug
  from squads where id = v_invite.squad_id;
end;
$$;

-- ============================================================
-- Accept an open challenge as opponent squad
-- ============================================================
create or replace function accept_challenge(p_challenge_id uuid, p_opponent_squad uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_challenge challenges%rowtype;
begin
  select * into v_challenge from challenges where id = p_challenge_id for update;
  if not found then
    raise exception 'Challenge not found';
  end if;
  if v_challenge.status <> 'open' then
    raise exception 'Challenge is not open';
  end if;
  if not is_squad_captain(p_opponent_squad, auth.uid()) then
    raise exception 'Only the captain of the accepting squad can do this';
  end if;
  if p_opponent_squad = v_challenge.created_by_squad then
    raise exception 'A squad cannot accept its own challenge';
  end if;

  update challenges
  set opponent_squad = p_opponent_squad, status = 'accepted', updated_at = now()
  where id = p_challenge_id;

  insert into notifications (user_id, type, title, body, link)
  select captain_id, 'challenge_accepted', 'Your challenge was accepted',
         v_challenge.title || ' now has an opponent',
         '/challenges/' || p_challenge_id
  from squads where id = v_challenge.created_by_squad;
end;
$$;

-- ============================================================
-- Move challenge into voting once both squads have submitted evidence,
-- or a captain manually opens voting after their own evidence is in.
-- ============================================================
create or replace function open_voting(p_challenge_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_challenge challenges%rowtype;
begin
  select * into v_challenge from challenges where id = p_challenge_id for update;
  if not found then raise exception 'Challenge not found'; end if;
  if not (is_squad_captain(v_challenge.created_by_squad, auth.uid())
          or is_squad_captain(v_challenge.opponent_squad, auth.uid())) then
    raise exception 'Only participating captains can open voting';
  end if;
  if v_challenge.status not in ('accepted', 'in_progress', 'evidence_submitted') then
    raise exception 'Challenge is not ready for voting';
  end if;

  update challenges
  set status = 'voting', voting_ends_at = now() + interval '72 hours', updated_at = now()
  where id = p_challenge_id;

  insert into notifications (user_id, type, title, body, link)
  select user_id, 'voting_started', 'Voting is open', v_challenge.title || ' is now open for public voting', '/challenges/' || p_challenge_id
  from squad_members where squad_id in (v_challenge.created_by_squad, v_challenge.opponent_squad);
end;
$$;

-- ============================================================
-- Finalize a challenge: tally votes, set winner, update squad records,
-- award points + badges, notify everyone. Safe to call idempotently;
-- only acts once and only after voting has actually ended.
-- ============================================================
create or replace function finalize_challenge(p_challenge_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_challenge challenges%rowtype;
  v_votes_a integer;
  v_votes_b integer;
  v_winner uuid;
  v_loser uuid;
  v_win_count integer;
begin
  select * into v_challenge from challenges where id = p_challenge_id for update;
  if not found then raise exception 'Challenge not found'; end if;
  if v_challenge.status <> 'voting' then
    return; -- nothing to finalize
  end if;
  if v_challenge.voting_ends_at is null or v_challenge.voting_ends_at > now() then
    return; -- voting still active
  end if;

  select count(*) filter (where voted_squad = v_challenge.created_by_squad),
         count(*) filter (where voted_squad = v_challenge.opponent_squad)
    into v_votes_a, v_votes_b
  from votes where challenge_id = p_challenge_id;

  if v_votes_a = v_votes_b then
    -- tie: no winner declared, flagged for moderator review
    update challenges set status = 'disputed', updated_at = now() where id = p_challenge_id;
    insert into disputes (challenge_id, raised_by, reason, status)
    values (p_challenge_id, v_challenge.created_by_squad, 'Automatic: tied vote, needs moderator tie-break', 'open');
    return;
  end if;

  if v_votes_a > v_votes_b then
    v_winner := v_challenge.created_by_squad;
    v_loser := v_challenge.opponent_squad;
  else
    v_winner := v_challenge.opponent_squad;
    v_loser := v_challenge.created_by_squad;
  end if;

  update challenges set status = 'completed', winner_squad = v_winner, updated_at = now() where id = p_challenge_id;
  update squads set wins = wins + 1, points = points + 50 where id = v_winner;
  update squads set losses = losses + 1, points = points + 10 where id = v_loser;
  update profiles set points = points + 25 where id in (select user_id from squad_members where squad_id = v_winner);
  update profiles set points = points + 5 where id in (select user_id from squad_members where squad_id = v_loser);

  insert into notifications (user_id, type, title, body, link)
  select user_id, 'challenge_completed',
         case when squad_id = v_winner then 'Victory! 🏆' else 'Challenge complete' end,
         v_challenge.title,
         '/challenges/' || p_challenge_id
  from squad_members where squad_id in (v_winner, v_loser);

  -- badge: squad-founder handled at squad creation; win-based badges here
  select wins into v_win_count from squads where id = v_winner;
  if v_win_count = 1 then
    insert into user_badges (user_id, badge_id)
    select user_id, (select id from badges where slug = 'first-blood')
    from squad_members where squad_id = v_winner
    on conflict do nothing;
  elsif v_win_count = 3 then
    insert into user_badges (user_id, badge_id)
    select user_id, (select id from badges where slug = 'hat-trick')
    from squad_members where squad_id = v_winner
    on conflict do nothing;
  elsif v_win_count = 10 then
    insert into user_badges (user_id, badge_id)
    select user_id, (select id from badges where slug = 'unstoppable')
    from squad_members where squad_id = v_winner
    on conflict do nothing;
  end if;
end;
$$;

-- ============================================================
-- Resolve a dispute (moderator/admin only)
-- ============================================================
create or replace function resolve_dispute(p_dispute_id uuid, p_action text, p_notes text, p_overturn boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_dispute disputes%rowtype;
  v_challenge challenges%rowtype;
  v_new_winner uuid;
begin
  if not is_moderator_or_admin() then
    raise exception 'Moderator access required';
  end if;

  select * into v_dispute from disputes where id = p_dispute_id for update;
  if not found then raise exception 'Dispute not found'; end if;

  select * into v_challenge from challenges where id = v_dispute.challenge_id for update;

  if p_overturn and v_challenge.winner_squad is not null then
    v_new_winner := case when v_challenge.winner_squad = v_challenge.created_by_squad
                          then v_challenge.opponent_squad else v_challenge.created_by_squad end;
    update squads set wins = wins - 1, losses = losses + 1 where id = v_challenge.winner_squad;
    update squads set losses = losses - 1, wins = wins + 1 where id = v_new_winner;
    update challenges set winner_squad = v_new_winner, status = 'completed' where id = v_challenge.id;
  else
    update challenges set status = coalesce(challenges.status, 'completed') where id = v_challenge.id;
    if v_challenge.status = 'disputed' and v_challenge.winner_squad is null then
      update challenges set status = 'completed' where id = v_challenge.id;
    end if;
  end if;

  update disputes
  set status = case when p_overturn then 'resolved_overturned' else 'resolved_upheld' end,
      resolved_at = now()
  where id = p_dispute_id;

  insert into moderation_actions (dispute_id, moderator_id, action, notes)
  values (p_dispute_id, auth.uid(), p_action, p_notes);

  insert into notifications (user_id, type, title, body, link)
  select user_id, 'dispute_resolved', 'Dispute resolved', p_notes, '/challenges/' || v_challenge.id
  from squad_members where squad_id in (v_challenge.created_by_squad, v_challenge.opponent_squad);
end;
$$;

-- ============================================================
-- Auto-award squad-founder badge on squad creation
-- ============================================================
create or replace function handle_squad_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into squad_members (squad_id, user_id, role) values (new.id, new.captain_id, 'captain')
  on conflict do nothing;
  insert into user_badges (user_id, badge_id)
  values (new.captain_id, (select id from badges where slug = 'squad-founder'))
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_squad_created
  after insert on squads
  for each row execute function handle_squad_created();

-- ============================================================
-- Keep challenges.updated_at fresh
-- ============================================================
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger challenges_touch_updated_at
  before update on challenges
  for each row execute function touch_updated_at();
