-- Maidan core schema
-- Run with: supabase db push  (or paste into the Supabase SQL editor)

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('user', 'moderator', 'admin');
create type squad_member_role as enum ('captain', 'member');
create type invite_status as enum ('pending', 'accepted', 'declined', 'revoked');
create type challenge_status as enum ('open', 'accepted', 'in_progress', 'evidence_submitted', 'voting', 'completed', 'disputed', 'cancelled');
create type participant_role as enum ('challenger', 'opponent');
create type evidence_media_type as enum ('video', 'photo');
create type dispute_status as enum ('open', 'reviewing', 'resolved_upheld', 'resolved_overturned', 'dismissed');
create type notification_type as enum (
  'squad_invite', 'invite_accepted', 'challenge_received', 'challenge_accepted',
  'evidence_submitted', 'voting_started', 'challenge_completed', 'dispute_raised',
  'dispute_resolved', 'badge_awarded'
);

-- ============================================================
-- COLLEGES
-- ============================================================
create table colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text,
  email_domain text, -- e.g. "iitb.ac.in" — matching signup email auto-verifies membership
  created_at timestamptz not null default now()
);
create unique index colleges_name_city_idx on colleges (lower(name), lower(city));

-- ============================================================
-- PROFILES (1:1 with auth.users)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  full_name text not null,
  avatar_url text,
  bio text,
  college_id uuid references colleges (id) on delete set null,
  college_verified boolean not null default false,
  city text,
  role user_role not null default 'user',
  points integer not null default 0,
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

-- ============================================================
-- SQUADS
-- ============================================================
create table squads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  bio text,
  avatar_url text,
  college_id uuid references colleges (id) on delete set null,
  captain_id uuid not null references profiles (id) on delete cascade,
  wins integer not null default 0,
  losses integer not null default 0,
  points integer not null default 0,
  created_at timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[a-z0-9-]{3,40}$')
);

create table squad_members (
  squad_id uuid not null references squads (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role squad_member_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (squad_id, user_id)
);

create table squad_invites (
  id uuid primary key default gen_random_uuid(),
  squad_id uuid not null references squads (id) on delete cascade,
  invited_user_id uuid not null references profiles (id) on delete cascade,
  invited_by uuid not null references profiles (id) on delete cascade,
  status invite_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (squad_id, invited_user_id)
);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text not null default 'trophy',
  description text
);

-- ============================================================
-- CHALLENGES
-- ============================================================
create table challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  rules text,
  category_id uuid not null references categories (id),
  created_by_squad uuid not null references squads (id) on delete cascade,
  opponent_squad uuid references squads (id) on delete cascade,
  status challenge_status not null default 'open',
  deadline timestamptz not null,
  voting_ends_at timestamptz,
  winner_squad uuid references squads (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint different_squads check (opponent_squad is null or opponent_squad <> created_by_squad)
);
create index challenges_status_idx on challenges (status);
create index challenges_category_idx on challenges (category_id);

-- ============================================================
-- EVIDENCE
-- ============================================================
create table evidence (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges (id) on delete cascade,
  squad_id uuid not null references squads (id) on delete cascade,
  uploaded_by uuid not null references profiles (id) on delete cascade,
  media_url text not null,
  media_type evidence_media_type not null,
  caption text,
  created_at timestamptz not null default now()
);
create index evidence_challenge_idx on evidence (challenge_id);

-- ============================================================
-- VOTES (one vote per user per challenge)
-- ============================================================
create table votes (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges (id) on delete cascade,
  voter_id uuid not null references profiles (id) on delete cascade,
  voted_squad uuid not null references squads (id),
  created_at timestamptz not null default now(),
  unique (challenge_id, voter_id)
);
create index votes_challenge_idx on votes (challenge_id);

-- ============================================================
-- DISPUTES + MODERATION
-- ============================================================
create table disputes (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references challenges (id) on delete cascade,
  raised_by uuid not null references profiles (id) on delete cascade,
  reason text not null,
  status dispute_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table moderation_actions (
  id uuid primary key default gen_random_uuid(),
  dispute_id uuid not null references disputes (id) on delete cascade,
  moderator_id uuid not null references profiles (id) on delete cascade,
  action text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on notifications (user_id, read, created_at desc);

-- ============================================================
-- BADGES
-- ============================================================
create table badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  icon text not null default 'medal'
);

create table user_badges (
  user_id uuid not null references profiles (id) on delete cascade,
  badge_id uuid not null references badges (id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
create or replace function is_squad_member(p_squad_id uuid, p_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from squad_members where squad_id = p_squad_id and user_id = p_user_id
  );
$$;

create or replace function is_squad_captain(p_squad_id uuid, p_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from squads where id = p_squad_id and captain_id = p_user_id
  );
$$;

create or replace function current_user_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_moderator_or_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('moderator', 'admin') from profiles where id = auth.uid()), false);
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table colleges enable row level security;
alter table profiles enable row level security;
alter table squads enable row level security;
alter table squad_members enable row level security;
alter table squad_invites enable row level security;
alter table categories enable row level security;
alter table challenges enable row level security;
alter table evidence enable row level security;
alter table votes enable row level security;
alter table disputes enable row level security;
alter table moderation_actions enable row level security;
alter table notifications enable row level security;
alter table badges enable row level security;
alter table user_badges enable row level security;

-- colleges: public read, admin write
create policy "colleges_select_all" on colleges for select using (true);
create policy "colleges_insert_admin" on colleges for insert with check (is_moderator_or_admin());
create policy "colleges_update_admin" on colleges for update using (is_moderator_or_admin());

-- categories: public read, admin write
create policy "categories_select_all" on categories for select using (true);
create policy "categories_write_admin" on categories for all using (is_moderator_or_admin()) with check (is_moderator_or_admin());

-- profiles: public read (leaderboards need it), self update
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_insert_self" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on profiles for update using (auth.uid() = id);

-- squads: public read, captain/members manage
create policy "squads_select_all" on squads for select using (true);
create policy "squads_insert_authenticated" on squads for insert with check (auth.uid() = captain_id);
create policy "squads_update_captain" on squads for update using (auth.uid() = captain_id);
create policy "squads_delete_captain" on squads for delete using (auth.uid() = captain_id);

-- squad_members: public read, captain manages membership, users can leave themselves
create policy "squad_members_select_all" on squad_members for select using (true);
create policy "squad_members_insert_captain_or_self" on squad_members for insert
  with check (is_squad_captain(squad_id, auth.uid()) or user_id = auth.uid());
create policy "squad_members_delete_captain_or_self" on squad_members for delete
  using (is_squad_captain(squad_id, auth.uid()) or user_id = auth.uid());

-- squad_invites: visible to invitee + inviting squad members, captain creates, invitee responds
create policy "squad_invites_select_involved" on squad_invites for select
  using (invited_user_id = auth.uid() or is_squad_member(squad_id, auth.uid()));
create policy "squad_invites_insert_captain" on squad_invites for insert
  with check (is_squad_captain(squad_id, auth.uid()));
create policy "squad_invites_update_involved" on squad_invites for update
  using (invited_user_id = auth.uid() or is_squad_captain(squad_id, auth.uid()));

-- challenges: public read, squad captains create/update their own
create policy "challenges_select_all" on challenges for select using (true);
create policy "challenges_insert_captain" on challenges for insert
  with check (is_squad_captain(created_by_squad, auth.uid()));
create policy "challenges_update_participant_or_mod" on challenges for update
  using (
    is_squad_captain(created_by_squad, auth.uid())
    or (opponent_squad is not null and is_squad_captain(opponent_squad, auth.uid()))
    or is_moderator_or_admin()
  );

-- evidence: public read, squad members upload for their own squad
create policy "evidence_select_all" on evidence for select using (true);
create policy "evidence_insert_member" on evidence for insert
  with check (is_squad_member(squad_id, auth.uid()) and uploaded_by = auth.uid());
create policy "evidence_delete_owner_or_mod" on evidence for delete
  using (uploaded_by = auth.uid() or is_moderator_or_admin());

-- votes: public read (transparent tally), any authenticated user votes once, cannot vote for own squad
create policy "votes_select_all" on votes for select using (true);
create policy "votes_insert_self" on votes for insert
  with check (
    voter_id = auth.uid()
    and not is_squad_member(voted_squad, auth.uid())
  );

-- disputes: participants + mods can read, participants raise, mods update
create policy "disputes_select_participant_or_mod" on disputes for select
  using (
    raised_by = auth.uid()
    or is_moderator_or_admin()
    or exists (
      select 1 from challenges c
      where c.id = challenge_id
        and (is_squad_captain(c.created_by_squad, auth.uid()) or is_squad_captain(c.opponent_squad, auth.uid()))
    )
  );
create policy "disputes_insert_participant" on disputes for insert
  with check (
    raised_by = auth.uid()
    and exists (
      select 1 from challenges c
      where c.id = challenge_id
        and (is_squad_captain(c.created_by_squad, auth.uid()) or is_squad_captain(c.opponent_squad, auth.uid()))
    )
  );
create policy "disputes_update_mod" on disputes for update using (is_moderator_or_admin());

-- moderation_actions: mods only
create policy "moderation_actions_select_mod" on moderation_actions for select using (is_moderator_or_admin());
create policy "moderation_actions_insert_mod" on moderation_actions for insert
  with check (is_moderator_or_admin() and moderator_id = auth.uid());

-- notifications: private to the recipient
create policy "notifications_select_self" on notifications for select using (user_id = auth.uid());
create policy "notifications_update_self" on notifications for update using (user_id = auth.uid());
create policy "notifications_insert_system" on notifications for insert with check (true);

-- badges: public read
create policy "badges_select_all" on badges for select using (true);

-- user_badges: public read (profile pages show badges)
create policy "user_badges_select_all" on user_badges for select using (true);

-- ============================================================
-- SEED: categories + badges (safe, idempotent)
-- ============================================================
insert into categories (name, slug, icon, description) values
  ('Dance', 'dance', 'music', 'Solo and crew dance battles'),
  ('Coding', 'coding', 'code', 'Hackathons, DSA duels, build-offs'),
  ('Gaming', 'gaming', 'gamepad-2', 'Esports and casual gaming showdowns'),
  ('Debate', 'debate', 'mic', 'Parliamentary and open debate clashes'),
  ('Sports', 'sports', 'trophy', 'Cricket, football, athletics and more'),
  ('Music', 'music', 'music-2', 'Bands, singing and instrumental battles'),
  ('Design', 'design', 'palette', 'UI/UX, poster and brand design duels'),
  ('Quiz', 'quiz', 'brain', 'General knowledge and subject quizzes')
on conflict (slug) do nothing;

insert into badges (slug, name, description, icon) values
  ('first-blood', 'First Blood', 'Won your first challenge', 'flame'),
  ('hat-trick', 'Hat-Trick', 'Won 3 challenges', 'zap'),
  ('unstoppable', 'Unstoppable', 'Won 10 challenges', 'crown'),
  ('squad-founder', 'Squad Founder', 'Founded a squad', 'flag'),
  ('verified-scholar', 'Verified Scholar', 'Verified college email', 'shield-check')
on conflict (slug) do nothing;
