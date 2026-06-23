-- Missions de duel plus courtes et faciles à réaliser n'importe où (ex: ramasser
-- un déchet) plutôt que des efforts physiques ou des durées longues.
update duel_missions set label = 'Ramasser et jeter un déchet', target = 1 where id = 'duel-pompes';
update duel_missions set label = 'Faire 10 jumping jacks', target = 1 where id = 'duel-squats';
update duel_missions set label = 'Boire un verre d''eau', target = 1 where id = 'duel-eau';
update duel_missions set label = 'Marcher jusqu''au bout de la rue', target = 1 where id = 'duel-marche';
update duel_missions set label = 'Lire 1 page d''un livre', target = 1 where id = 'duel-lecture';
update duel_missions set label = 'Ranger un objet qui traîne', target = 1 where id = 'duel-rangement';
update duel_missions set label = 'Faire 10 respirations profondes', target = 1 where id = 'duel-respiration';
update duel_missions set label = 'Penser à une chose positive du jour', target = 1 where id = 'duel-gratitude';
update duel_missions set label = 'Faire 30 secondes d''étirements', target = 1 where id = 'duel-etirement';
update duel_missions set label = 'Prendre une photo du ciel', target = 1 where id = 'duel-photo-nature';
update duel_missions set label = 'Faire un compliment à quelqu''un', target = 1 where id = 'duel-appel';
update duel_missions set label = 'Tenir une planche 15 secondes', target = 1 where id = 'duel-planche';

insert into duel_missions (id, label, target) values
  ('duel-poubelle', 'Vider une petite corbeille', 1),
  ('duel-pliage', 'Plier ou ranger un vêtement', 1),
  ('duel-sourire', 'Sourire à quelqu''un', 1),
  ('duel-eau-plante', 'Arroser une plante', 1),
  ('duel-vaisselle', 'Laver un objet de vaisselle', 1)
on conflict (id) do nothing;

-- Duels plus courts par défaut.
alter table duels alter column duration_minutes set default 8;

create or replace function create_duel(p_opponent_id uuid, p_mode text, p_duration_minutes integer default 8)
returns uuid as $$
declare
  v_duel_id uuid;
begin
  if p_opponent_id = auth.uid() then
    raise exception 'Cannot duel yourself';
  end if;

  if not exists (
    select 1 from friends
    where status = 'accepted'
      and ((requester = auth.uid() and addressee = p_opponent_id) or (requester = p_opponent_id and addressee = auth.uid()))
  ) then
    raise exception 'Not friends';
  end if;

  insert into duels (mode, challenger_id, opponent_id, duration_minutes)
  values (p_mode, auth.uid(), p_opponent_id, p_duration_minutes)
  returning id into v_duel_id;

  insert into duel_assignments (duel_id, mission_id)
  select v_duel_id, id from duel_missions order by random() limit 5;

  insert into notifications (user_id, type, message, link)
  values (
    p_opponent_id,
    'duel_invite',
    case when p_mode = 'reel' then 'Tu as un défi en duel réel !' else 'Tu as un défi en duel à distance !' end,
    '/duel/' || v_duel_id
  );

  return v_duel_id;
end;
$$ language plpgsql security definer;

-- Logique de fin de duel extraite pour être appelable soit par le chrono,
-- soit immédiatement si les deux ont terminé toutes leurs missions.
create or replace function finish_duel_now(p_duel_id uuid)
returns void as $$
declare
  v_duel duels;
  v_challenger_score integer;
  v_opponent_score integer;
  v_winner uuid;
begin
  select * into v_duel from duels where id = p_duel_id and status = 'active';
  if v_duel.id is null then
    return;
  end if;

  select count(*) into v_challenger_score from duel_progress where duel_id = p_duel_id and user_id = v_duel.challenger_id;
  select count(*) into v_opponent_score from duel_progress where duel_id = p_duel_id and user_id = v_duel.opponent_id;

  if v_challenger_score > v_opponent_score then
    v_winner := v_duel.challenger_id;
  elsif v_opponent_score > v_challenger_score then
    v_winner := v_duel.opponent_id;
  else
    v_winner := null;
  end if;

  update duels set status = 'finished', winner_id = v_winner where id = p_duel_id;

  if v_winner is not null then
    update profiles
    set xp_boost_until = greatest(coalesce(xp_boost_until, now()), now()) + (v_duel.xp_boost_minutes || ' minutes')::interval
    where id = v_winner;
  end if;

  insert into notifications (user_id, type, message, link)
  values
    (v_duel.challenger_id, 'duel_finished',
      case
        when v_winner = v_duel.challenger_id then 'Tu as gagné ton duel ! Boost XP activé.'
        when v_winner is null then 'Ton duel s''est terminé sur une égalité.'
        else 'Tu as perdu ton duel, retente ta chance !'
      end,
      '/duel/' || p_duel_id),
    (v_duel.opponent_id, 'duel_finished',
      case
        when v_winner = v_duel.opponent_id then 'Tu as gagné ton duel ! Boost XP activé.'
        when v_winner is null then 'Ton duel s''est terminé sur une égalité.'
        else 'Tu as perdu ton duel, retente ta chance !'
      end,
      '/duel/' || p_duel_id);
end;
$$ language plpgsql security definer;

create or replace function finish_duel(p_duel_id uuid)
returns void as $$
declare
  v_duel duels;
begin
  select * into v_duel from duels where id = p_duel_id and status = 'active';
  if v_duel.id is null then
    raise exception 'Duel not active';
  end if;
  if v_duel.ends_at > now() then
    raise exception 'Duel not finished yet';
  end if;

  perform finish_duel_now(p_duel_id);
end;
$$ language plpgsql security definer;

-- Si les deux participants ont complété toutes leurs missions, le duel se
-- termine immédiatement sans attendre la fin du chrono.
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

  if v_challenger_done >= v_total and v_opponent_done >= v_total then
    perform finish_duel_now(p_duel_id);
  end if;
end;
$$ language plpgsql security definer;
