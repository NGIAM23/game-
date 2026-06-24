-- Coffre quotidien gratuit : une récompense aléatoire par jour.

alter table profiles add column if not exists last_lootbox_on date;

create or replace function open_daily_lootbox()
returns table(kind text, amount integer) as $$
declare
  v_last date;
  v_roll numeric;
  v_kind text;
  v_amount integer;
begin
  select last_lootbox_on into v_last from profiles where id = auth.uid();
  if v_last = current_date then
    raise exception 'Already opened today';
  end if;

  v_roll := random();
  if v_roll < 0.55 then
    v_kind := 'sparks';
    v_amount := 5 + floor(random() * 11)::integer; -- 5-15
  elsif v_roll < 0.80 then
    v_kind := 'sparks';
    v_amount := 16 + floor(random() * 15)::integer; -- 16-30
  elsif v_roll < 0.95 then
    v_kind := 'xp';
    v_amount := 10 + floor(random() * 16)::integer; -- 10-25
  else
    v_kind := 'streak_freeze';
    v_amount := 1;
  end if;

  if v_kind = 'sparks' then
    update profiles set sparks = sparks + v_amount, last_lootbox_on = current_date where id = auth.uid();
  elsif v_kind = 'xp' then
    update profiles set total_xp = total_xp + v_amount, last_lootbox_on = current_date where id = auth.uid();
  else
    update profiles set streak_freezes = streak_freezes + v_amount, last_lootbox_on = current_date where id = auth.uid();
  end if;

  return query select v_kind, v_amount;
end;
$$ language plpgsql security definer;
