-- Permet au créateur du clan de le configurer (nom, objectif, récompenses) ou de le supprimer.

create or replace function get_my_clan()
returns table(
  clan_id uuid, name text, weekly_target integer, reward_xp integer, reward_sparks integer,
  progress integer, claimed boolean, member_count integer, owner_id uuid
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
    (select count(*)::integer from clan_members cm2 where cm2.clan_id = c.id) as member_count,
    c.owner_id
  from clans c
  where c.id = v_clan_id;
end;
$$ language plpgsql security definer;

create or replace function update_clan_settings(p_name text, p_weekly_target integer, p_reward_xp integer, p_reward_sparks integer)
returns void as $$
declare
  v_clan_id uuid;
begin
  select id into v_clan_id from clans where owner_id = auth.uid();
  if v_clan_id is null then
    raise exception 'Not a clan owner';
  end if;

  if trim(p_name) = '' or p_weekly_target < 1 or p_reward_xp < 0 or p_reward_sparks < 0 then
    raise exception 'Invalid clan settings';
  end if;

  update clans
  set name = trim(p_name), weekly_target = p_weekly_target, reward_xp = p_reward_xp, reward_sparks = p_reward_sparks
  where id = v_clan_id;
end;
$$ language plpgsql security definer;

create or replace function delete_clan()
returns void as $$
declare
  v_clan_id uuid;
begin
  select id into v_clan_id from clans where owner_id = auth.uid();
  if v_clan_id is null then
    raise exception 'Not a clan owner';
  end if;

  delete from clans where id = v_clan_id;
end;
$$ language plpgsql security definer;
