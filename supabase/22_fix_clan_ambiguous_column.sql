-- Corrige une ambiguïté de colonne : "clan_id" est à la fois une colonne de
-- clan_members et le nom du paramètre de sortie des fonctions, ce qui fait
-- échouer (ou se comporter de façon imprévisible selon le rôle) la requête
-- interne "select clan_id from clan_members ...". On qualifie la colonne.

create or replace function get_my_clan()
returns table(
  clan_id uuid, name text, weekly_target integer, reward_xp integer, reward_sparks integer,
  progress integer, claimed boolean, member_count integer, owner_id uuid
) as $$
declare
  v_clan_id uuid;
  v_period date;
begin
  select cm.clan_id into v_clan_id from clan_members cm where cm.user_id = auth.uid();
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
    (select count(*)::integer from clan_members cm2 where cm2.clan_id = c.id) as member_count,
    c.owner_id
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
  select cm.clan_id into v_clan_id from clan_members cm where cm.user_id = auth.uid();
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
  select cm.clan_id into v_clan_id from clan_members cm where cm.user_id = auth.uid();
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
