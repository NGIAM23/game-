-- Battle pass saisonnier : progression par niveaux avec récompenses gratuites et Plus.

create table if not exists seasons (
  id text primary key,
  name text not null,
  starts_on date not null,
  ends_on date not null
);

alter table seasons enable row level security;

create policy "Seasons are viewable by everyone"
  on seasons for select
  using (true);

insert into seasons (id, name, starts_on, ends_on) values
  ('season-1', 'Saison 1 : Premiers pas', current_date, current_date + 29)
on conflict (id) do nothing;

create table if not exists battle_pass_rewards (
  season_id text not null references seasons (id) on delete cascade,
  level integer not null check (level between 1 and 20),
  track text not null check (track in ('free', 'plus')),
  kind text not null check (kind in ('sparks', 'xp', 'streak_freeze', 'cosmetic')),
  amount integer not null default 0,
  cosmetic_id text references cosmetics (id),
  primary key (season_id, level, track)
);

alter table battle_pass_rewards enable row level security;

create policy "Battle pass rewards are viewable by everyone"
  on battle_pass_rewards for select
  using (true);

insert into battle_pass_rewards (season_id, level, track, kind, amount, cosmetic_id) values
  ('season-1', 1, 'free', 'sparks', 15, null),
  ('season-1', 1, 'plus', 'sparks', 30, null),
  ('season-1', 2, 'free', 'xp', 20, null),
  ('season-1', 2, 'plus', 'xp', 40, null),
  ('season-1', 3, 'free', 'sparks', 20, null),
  ('season-1', 3, 'plus', 'sparks', 45, null),
  ('season-1', 4, 'free', 'streak_freeze', 1, null),
  ('season-1', 4, 'plus', 'streak_freeze', 2, null),
  ('season-1', 5, 'free', 'sparks', 25, null),
  ('season-1', 5, 'plus', 'cosmetic', 0, 'bg-sunset'),
  ('season-1', 6, 'free', 'sparks', 25, null),
  ('season-1', 6, 'plus', 'sparks', 55, null),
  ('season-1', 7, 'free', 'xp', 30, null),
  ('season-1', 7, 'plus', 'xp', 60, null),
  ('season-1', 8, 'free', 'sparks', 30, null),
  ('season-1', 8, 'plus', 'cosmetic', 0, 'badge-coach'),
  ('season-1', 9, 'free', 'sparks', 30, null),
  ('season-1', 9, 'plus', 'sparks', 65, null),
  ('season-1', 10, 'free', 'cosmetic', 0, 'title-debutant'),
  ('season-1', 10, 'plus', 'cosmetic', 0, 'bg-ocean'),
  ('season-1', 11, 'free', 'sparks', 35, null),
  ('season-1', 11, 'plus', 'sparks', 70, null),
  ('season-1', 12, 'free', 'xp', 35, null),
  ('season-1', 12, 'plus', 'xp', 70, null),
  ('season-1', 13, 'free', 'streak_freeze', 1, null),
  ('season-1', 13, 'plus', 'streak_freeze', 2, null),
  ('season-1', 14, 'free', 'sparks', 40, null),
  ('season-1', 14, 'plus', 'cosmetic', 0, 'badge-coeur'),
  ('season-1', 15, 'free', 'sparks', 40, null),
  ('season-1', 15, 'plus', 'sparks', 85, null),
  ('season-1', 16, 'free', 'xp', 45, null),
  ('season-1', 16, 'plus', 'xp', 90, null),
  ('season-1', 17, 'free', 'sparks', 45, null),
  ('season-1', 17, 'plus', 'cosmetic', 0, 'bg-forest'),
  ('season-1', 18, 'free', 'sparks', 50, null),
  ('season-1', 18, 'plus', 'sparks', 100, null),
  ('season-1', 19, 'free', 'xp', 50, null),
  ('season-1', 19, 'plus', 'cosmetic', 0, 'title-discipline'),
  ('season-1', 20, 'free', 'cosmetic', 0, 'badge-champion'),
  ('season-1', 20, 'plus', 'cosmetic', 0, 'bg-rainbow')
on conflict (season_id, level, track) do nothing;

create table if not exists battle_pass_claims (
  user_id uuid not null references auth.users (id) on delete cascade,
  season_id text not null references seasons (id) on delete cascade,
  level integer not null,
  track text not null,
  claimed_at timestamptz not null default now(),
  primary key (user_id, season_id, level, track)
);

alter table battle_pass_claims enable row level security;

create policy "Users can view their own battle pass claims"
  on battle_pass_claims for select
  using (auth.uid() = user_id);

-- 100 XP de saison par niveau, plafonné à 20 niveaux.
create or replace function battle_pass_level(p_season_xp integer)
returns integer as $$
begin
  return least(20, 1 + (p_season_xp / 100));
end;
$$ language plpgsql immutable;

create or replace function get_battle_pass_progress()
returns table(
  season_id text,
  season_name text,
  ends_on date,
  season_xp integer,
  level integer,
  xp_into_level integer,
  xp_for_next_level integer,
  is_plus boolean
) as $$
declare
  v_season seasons;
  v_xp integer;
  v_is_plus boolean;
  v_level integer;
begin
  select * into v_season from seasons where current_date between starts_on and ends_on order by starts_on desc limit 1;
  if v_season.id is null then
    return;
  end if;

  select coalesce(sum(tc.xp_awarded), 0) into v_xp
  from task_completions tc
  where tc.user_id = auth.uid()
    and tc.completed_on between v_season.starts_on and v_season.ends_on;

  select is_plus into v_is_plus from profiles where id = auth.uid();
  v_level := battle_pass_level(v_xp);

  return query select
    v_season.id,
    v_season.name,
    v_season.ends_on,
    v_xp,
    v_level,
    v_xp - ((v_level - 1) * 100),
    case when v_level >= 20 then 0 else 100 end,
    coalesce(v_is_plus, false);
end;
$$ language plpgsql security definer;

create or replace function get_battle_pass_rewards(p_season_id text)
returns table(level integer, track text, kind text, amount integer, cosmetic_id text, claimed boolean) as $$
begin
  return query
  select r.level, r.track, r.kind, r.amount, r.cosmetic_id,
    exists(
      select 1 from battle_pass_claims c
      where c.user_id = auth.uid() and c.season_id = r.season_id and c.level = r.level and c.track = r.track
    ) as claimed
  from battle_pass_rewards r
  where r.season_id = p_season_id
  order by r.level, r.track;
end;
$$ language plpgsql security definer;

create or replace function claim_battle_pass_reward(p_level integer, p_track text)
returns void as $$
declare
  v_season seasons;
  v_xp integer;
  v_level integer;
  v_is_plus boolean;
  v_reward battle_pass_rewards;
begin
  select * into v_season from seasons where current_date between starts_on and ends_on order by starts_on desc limit 1;
  if v_season.id is null then
    raise exception 'No active season';
  end if;

  if p_track = 'plus' then
    select is_plus into v_is_plus from profiles where id = auth.uid();
    if not coalesce(v_is_plus, false) then
      raise exception 'Plus track requires Luavio+';
    end if;
  end if;

  select coalesce(sum(tc.xp_awarded), 0) into v_xp
  from task_completions tc
  where tc.user_id = auth.uid()
    and tc.completed_on between v_season.starts_on and v_season.ends_on;
  v_level := battle_pass_level(v_xp);

  if p_level > v_level then
    raise exception 'Level not reached yet';
  end if;

  select * into v_reward from battle_pass_rewards where season_id = v_season.id and level = p_level and track = p_track;
  if v_reward.season_id is null then
    raise exception 'Unknown reward';
  end if;

  insert into battle_pass_claims (user_id, season_id, level, track) values (auth.uid(), v_season.id, p_level, p_track)
  on conflict (user_id, season_id, level, track) do nothing;
  if not found then
    raise exception 'Already claimed';
  end if;

  if v_reward.kind = 'sparks' then
    update profiles set sparks = sparks + v_reward.amount where id = auth.uid();
  elsif v_reward.kind = 'xp' then
    update profiles set total_xp = total_xp + v_reward.amount where id = auth.uid();
  elsif v_reward.kind = 'streak_freeze' then
    update profiles set streak_freezes = streak_freezes + v_reward.amount where id = auth.uid();
  elsif v_reward.kind = 'cosmetic' then
    insert into profile_cosmetics (user_id, cosmetic_id) values (auth.uid(), v_reward.cosmetic_id)
    on conflict do nothing;
  end if;
end;
$$ language plpgsql security definer;
