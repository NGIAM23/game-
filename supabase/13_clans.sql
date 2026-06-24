-- Clans : petites équipes d'amis (max 6) avec un objectif hebdomadaire commun.

create table if not exists clans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  owner_id uuid not null references auth.users (id) on delete cascade,
  weekly_target integer not null default 40,
  reward_xp integer not null default 30,
  reward_sparks integer not null default 15,
  created_at timestamptz not null default now()
);

alter table clans enable row level security;

create policy "Clans are viewable by everyone"
  on clans for select
  using (true);

create table if not exists clan_members (
  clan_id uuid not null references clans (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (clan_id, user_id)
);

alter table clan_members enable row level security;

create policy "Clan members are viewable by everyone"
  on clan_members for select
  using (true);

create table if not exists clan_progress (
  clan_id uuid not null references clans (id) on delete cascade,
  period_start date not null,
  claimed boolean not null default false,
  primary key (clan_id, period_start)
);

alter table clan_progress enable row level security;

create policy "Clan progress is viewable by everyone"
  on clan_progress for select
  using (true);

create or replace function create_clan(p_name text)
returns uuid as $$
declare
  v_clan_id uuid;
begin
  if exists (select 1 from clan_members where user_id = auth.uid()) then
    raise exception 'Already in a clan';
  end if;

  insert into clans (name, owner_id) values (trim(p_name), auth.uid()) returning id into v_clan_id;
  insert into clan_members (clan_id, user_id) values (v_clan_id, auth.uid());

  return v_clan_id;
end;
$$ language plpgsql security definer;

create or replace function join_clan(p_clan_id uuid)
returns void as $$
declare
  v_count integer;
begin
  if exists (select 1 from clan_members where user_id = auth.uid()) then
    raise exception 'Already in a clan';
  end if;

  select count(*) into v_count from clan_members where clan_id = p_clan_id;
  if v_count >= 6 then
    raise exception 'Clan is full';
  end if;

  insert into clan_members (clan_id, user_id) values (p_clan_id, auth.uid());
end;
$$ language plpgsql security definer;

create or replace function leave_clan()
returns void as $$
begin
  delete from clan_members where user_id = auth.uid();
end;
$$ language plpgsql security definer;

-- Détails du clan de l'utilisateur courant, avec la progression hebdomadaire cumulée des membres.
create or replace function get_my_clan()
returns table(
  clan_id uuid, name text, weekly_target integer, reward_xp integer, reward_sparks integer,
  progress integer, claimed boolean, member_count integer
) as $$
declare
  v_clan_id uuid;
  v_period date;
begin
  select clan_id into v_clan_id from clan_members where user_id = auth.uid();
  if v_clan_id is null then
    return;
  end if;

  v_period := date_trunc('week', current_date)::date;

  return query
  select
    c.id, c.name, c.weekly_target, c.reward_xp, c.reward_sparks,
    least(c.weekly_target, (
      select count(*)::integer from task_completions tc
      join clan_members cm on cm.user_id = tc.user_id
      where cm.clan_id = c.id and tc.completed_on >= v_period
    )) as progress,
    coalesce((select cp.claimed from clan_progress cp where cp.clan_id = c.id and cp.period_start = v_period), false) as claimed,
    (select count(*)::integer from clan_members cm2 where cm2.clan_id = c.id) as member_count
  from clans c
  where c.id = v_clan_id;
end;
$$ language plpgsql security definer;

create or replace function get_clan_members()
returns table(user_id uuid, pseudo text, avatar_seed text, contributed integer) as $$
declare
  v_clan_id uuid;
  v_period date;
begin
  select clan_id into v_clan_id from clan_members where user_id = auth.uid();
  if v_clan_id is null then
    return;
  end if;

  v_period := date_trunc('week', current_date)::date;

  return query
  select p.id, p.pseudo, p.avatar_seed, (
    select count(*)::integer from task_completions tc where tc.user_id = p.id and tc.completed_on >= v_period
  ) as contributed
  from clan_members cm
  join profiles p on p.id = cm.user_id
  where cm.clan_id = v_clan_id
  order by contributed desc;
end;
$$ language plpgsql security definer;

create or replace function claim_clan_reward()
returns void as $$
declare
  v_clan_id uuid;
  v_target integer;
  v_reward_xp integer;
  v_reward_sparks integer;
  v_period date;
  v_progress integer;
  v_already_claimed boolean;
begin
  select clan_id into v_clan_id from clan_members where user_id = auth.uid();
  if v_clan_id is null then
    raise exception 'Not in a clan';
  end if;

  select weekly_target, reward_xp, reward_sparks into v_target, v_reward_xp, v_reward_sparks from clans where id = v_clan_id;
  v_period := date_trunc('week', current_date)::date;

  select claimed into v_already_claimed from clan_progress where clan_id = v_clan_id and period_start = v_period;
  if v_already_claimed then
    raise exception 'Already claimed this week';
  end if;

  select count(*)::integer into v_progress from task_completions tc
  join clan_members cm on cm.user_id = tc.user_id
  where cm.clan_id = v_clan_id and tc.completed_on >= v_period;

  if v_progress < v_target then
    raise exception 'Goal not reached yet';
  end if;

  insert into clan_progress (clan_id, period_start, claimed) values (v_clan_id, v_period, true)
  on conflict (clan_id, period_start) do update set claimed = true;

  update profiles set total_xp = total_xp + v_reward_xp, sparks = sparks + v_reward_sparks
  where id in (select user_id from clan_members where clan_id = v_clan_id);
end;
$$ language plpgsql security definer;

create or replace function search_clans(p_query text)
returns table(id uuid, name text, member_count integer) as $$
begin
  return query
  select c.id, c.name, (select count(*)::integer from clan_members cm where cm.clan_id = c.id) as member_count
  from clans c
  where p_query = '' or c.name ilike '%' || p_query || '%'
  order by c.created_at desc
  limit 20;
end;
$$ language plpgsql security definer;
