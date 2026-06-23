-- Un duel est une course : le premier qui termine toutes ses missions gagne,
-- pas besoin d'attendre que l'adversaire ait aussi tout terminé.
create or replace function complete_duel_mission(p_duel_id uuid, p_mission_id text)
returns void as $$
declare
  v_duel duels;
  v_total integer;
  v_challenger_done integer;
  v_opponent_done integer;
begin
  select * into v_duel from duels where id = p_duel_id and status = 'active';
  if v_duel.id is null then
    raise exception 'Duel not active';
  end if;

  if auth.uid() <> v_duel.challenger_id and auth.uid() <> v_duel.opponent_id then
    raise exception 'Not a participant';
  end if;

  if v_duel.ends_at < now() then
    raise exception 'Duel time is over';
  end if;

  insert into duel_progress (duel_id, user_id, mission_id) values (p_duel_id, auth.uid(), p_mission_id)
  on conflict do nothing;

  select count(*) into v_total from duel_assignments where duel_id = p_duel_id;
  select count(*) into v_challenger_done from duel_progress where duel_id = p_duel_id and user_id = v_duel.challenger_id;
  select count(*) into v_opponent_done from duel_progress where duel_id = p_duel_id and user_id = v_duel.opponent_id;

  if v_challenger_done >= v_total or v_opponent_done >= v_total then
    perform finish_duel_now(p_duel_id);
  end if;
end;
$$ language plpgsql security definer;
