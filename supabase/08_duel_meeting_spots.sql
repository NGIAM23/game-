-- Au lieu d'utiliser le point milieu exact (sensible aux imprécisions de
-- géolocalisation, ex: positionnement Wi-Fi/IP sur PC vs GPS sur mobile),
-- on propose plusieurs lieux publics connus et sûrs autour du milieu, et les
-- participants choisissent ensemble lequel leur convient.

alter table duels add column if not exists meeting_candidates jsonb;
alter table duels add column if not exists chosen_lat double precision;
alter table duels add column if not exists chosen_lng double precision;
alter table duels add column if not exists chosen_label text;

-- Premier à écrire gagne : évite les écritures concurrentes entre les deux participants.
create or replace function set_duel_meeting_candidates(p_duel_id uuid, p_candidates jsonb)
returns void as $$
declare
  v_duel duels;
begin
  select * into v_duel from duels where id = p_duel_id and status = 'meeting';
  if v_duel.id is null then
    raise exception 'Duel not found or not in meeting phase';
  end if;
  if auth.uid() <> v_duel.challenger_id and auth.uid() <> v_duel.opponent_id then
    raise exception 'Not a participant';
  end if;

  update duels
  set meeting_candidates = p_candidates
  where id = p_duel_id and meeting_candidates is null;
end;
$$ language plpgsql security definer;

-- Premier choix accepté fait office de point de rendez-vous définitif.
create or replace function choose_duel_meeting_spot(p_duel_id uuid, p_lat double precision, p_lng double precision, p_label text)
returns void as $$
declare
  v_duel duels;
begin
  select * into v_duel from duels where id = p_duel_id and status = 'meeting';
  if v_duel.id is null then
    raise exception 'Duel not found or not in meeting phase';
  end if;
  if auth.uid() <> v_duel.challenger_id and auth.uid() <> v_duel.opponent_id then
    raise exception 'Not a participant';
  end if;

  update duels
  set chosen_lat = p_lat, chosen_lng = p_lng, chosen_label = p_label
  where id = p_duel_id and chosen_lat is null;
end;
$$ language plpgsql security definer;

-- L'arrivée se vérifie désormais contre le lieu choisi, pas le milieu brut.
create or replace function confirm_duel_arrival(p_duel_id uuid, p_lat double precision, p_lng double precision)
returns void as $$
declare
  v_duel duels;
  v_distance double precision;
begin
  select * into v_duel from duels where id = p_duel_id and status = 'meeting';
  if v_duel.id is null or v_duel.chosen_lat is null then
    raise exception 'Duel not ready for arrival check';
  end if;

  v_distance := duel_distance_meters(p_lat, p_lng, v_duel.chosen_lat, v_duel.chosen_lng);
  if v_distance > 150 then
    raise exception 'Too far from meeting point (% m)', round(v_distance);
  end if;

  if auth.uid() = v_duel.challenger_id then
    update duels set challenger_ready = true where id = p_duel_id;
  elsif auth.uid() = v_duel.opponent_id then
    update duels set opponent_ready = true where id = p_duel_id;
  else
    raise exception 'Not a participant';
  end if;

  select * into v_duel from duels where id = p_duel_id;
  if v_duel.challenger_ready and v_duel.opponent_ready then
    update duels
    set status = 'active', started_at = now(), ends_at = now() + (v_duel.duration_minutes || ' minutes')::interval
    where id = p_duel_id;
  end if;
end;
$$ language plpgsql security definer;
