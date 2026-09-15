-- Centralized rate limiting (works across serverless instances since it lives in Postgres).
create table rate_limit_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);
create index rate_limit_events_lookup_idx on rate_limit_events (user_id, action, created_at desc);

alter table rate_limit_events enable row level security;
create policy "rate_limit_events_select_self" on rate_limit_events for select using (user_id = auth.uid());

-- Returns true if the caller is allowed to perform `p_action` again
-- (fewer than p_limit occurrences in the trailing p_window_minutes).
create or replace function check_rate_limit(p_action text, p_limit integer, p_window_minutes integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select count(*) into v_count
  from rate_limit_events
  where user_id = auth.uid()
    and action = p_action
    and created_at > now() - make_interval(mins => p_window_minutes);

  if v_count >= p_limit then
    return false;
  end if;

  insert into rate_limit_events (user_id, action) values (auth.uid(), p_action);
  return true;
end;
$$;

-- periodic cleanup helper (call from a scheduled job if desired)
create or replace function purge_old_rate_limit_events()
returns void language sql security definer set search_path = public as $$
  delete from rate_limit_events where created_at < now() - interval '7 days';
$$;
