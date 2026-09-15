-- Real, database-derived leaderboards. No fixture data — empty until squads play.

create or replace view squad_leaderboard as
select
  s.id as squad_id,
  s.name,
  s.slug,
  s.avatar_url,
  s.college_id,
  c.name as college_name,
  c.city,
  s.wins,
  s.losses,
  s.points,
  rank() over (order by s.points desc, s.wins desc) as rank
from squads s
left join colleges c on c.id = s.college_id
where s.wins + s.losses > 0
order by s.points desc, s.wins desc;

create or replace view college_leaderboard as
select
  c.id as college_id,
  c.name,
  c.city,
  coalesce(sum(s.wins), 0) as total_wins,
  coalesce(sum(s.losses), 0) as total_losses,
  coalesce(sum(s.points), 0) as total_points,
  count(distinct s.id) filter (where s.wins + s.losses > 0) as active_squads,
  rank() over (order by coalesce(sum(s.points), 0) desc) as rank
from colleges c
left join squads s on s.college_id = c.id
group by c.id, c.name, c.city
having coalesce(sum(s.points), 0) > 0
order by total_points desc;

create or replace view city_leaderboard as
select
  c.city,
  coalesce(sum(s.wins), 0) as total_wins,
  coalesce(sum(s.points), 0) as total_points,
  count(distinct c.id) as college_count,
  count(distinct s.id) filter (where s.wins + s.losses > 0) as active_squads,
  rank() over (order by coalesce(sum(s.points), 0) desc) as rank
from colleges c
left join squads s on s.college_id = c.id
group by c.city
having coalesce(sum(s.points), 0) > 0
order by total_points desc;

create or replace view player_leaderboard as
select
  p.id as user_id,
  p.username,
  p.full_name,
  p.avatar_url,
  p.college_id,
  co.name as college_name,
  p.points,
  rank() over (order by p.points desc) as rank
from profiles p
left join colleges co on co.id = p.college_id
where p.points > 0
order by p.points desc;
