-- Boutique cosmétique élargie : plus de fonds/badges, des titres, et un mécanisme d'équipement.

alter table cosmetics drop constraint if exists cosmetics_kind_check;
alter table cosmetics add constraint cosmetics_kind_check check (kind in ('avatar_bg', 'badge', 'title'));

insert into cosmetics (id, name, kind, value, price_sparks) values
  ('bg-sunset', 'Fond Coucher de soleil', 'avatar_bg', '#FF8C42', 45),
  ('bg-ocean', 'Fond Océan', 'avatar_bg', '#1E6091', 45),
  ('bg-rose', 'Fond Rose', 'avatar_bg', '#F783AC', 45),
  ('bg-forest', 'Fond Forêt', 'avatar_bg', '#2B8A3E', 50),
  ('bg-midnight', 'Fond Minuit', 'avatar_bg', '#1A1A2E', 55),
  ('bg-rainbow', 'Fond Arc-en-ciel', 'avatar_bg', 'linear-gradient(135deg,#FF6B6B,#FFD43B,#51CF66,#4DABF7,#9775FA)', 120),
  ('badge-clan', 'Badge Clan', 'badge', '🛡️', 50),
  ('badge-coach', 'Badge Discipline', 'badge', '🧭', 50),
  ('badge-champion', 'Badge Champion', 'badge', '🏆', 90),
  ('badge-coeur', 'Badge Altruiste', 'badge', '🤝', 60),
  ('title-debutant', 'Titre : Apprenti', 'title', 'Apprenti', 20),
  ('title-discipline', 'Titre : Discipliné', 'title', 'Discipliné', 50),
  ('title-legende', 'Titre : Légende', 'title', 'Légende', 150)
on conflict (id) do nothing;

alter table profiles add column if not exists equipped_title text references cosmetics (id);

create or replace function equip_cosmetic(p_cosmetic_id text)
returns void as $$
declare
  v_kind text;
  v_owned boolean;
begin
  select kind into v_kind from cosmetics where id = p_cosmetic_id;
  if v_kind is null then
    raise exception 'Unknown cosmetic %', p_cosmetic_id;
  end if;

  select exists(
    select 1 from profile_cosmetics where user_id = auth.uid() and cosmetic_id = p_cosmetic_id
  ) into v_owned;
  if not v_owned then
    raise exception 'Cosmetic not owned';
  end if;

  if v_kind = 'avatar_bg' then
    update profiles set equipped_avatar_bg = p_cosmetic_id where id = auth.uid();
  elsif v_kind = 'badge' then
    update profiles set equipped_badge = p_cosmetic_id where id = auth.uid();
  elsif v_kind = 'title' then
    update profiles set equipped_title = p_cosmetic_id where id = auth.uid();
  end if;
end;
$$ language plpgsql security definer;

create or replace function unequip_cosmetic(p_kind text)
returns void as $$
begin
  if p_kind = 'avatar_bg' then
    update profiles set equipped_avatar_bg = null where id = auth.uid();
  elsif p_kind = 'badge' then
    update profiles set equipped_badge = null where id = auth.uid();
  elsif p_kind = 'title' then
    update profiles set equipped_title = null where id = auth.uid();
  end if;
end;
$$ language plpgsql security definer;
