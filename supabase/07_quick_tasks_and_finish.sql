-- Tâches courtes et très faciles (style "ramasser une poubelle"), pour
-- raccourcir le temps nécessaire à finir la liste du jour.
-- À exécuter après 06_payments_cosmetics_social.sql, dans Supabase → SQL Editor.

insert into tasks (id, category, label, base_xp, location, frequency) values
  ('jeter-papier-poubelle', 'altruisme', 'Jeter un papier qui traîne à la poubelle', 10, 'any', 'daily'),
  ('faire-son-lit', 'productivite', 'Faire son lit', 10, 'home', 'daily'),
  ('sortir-poubelles', 'productivite', 'Sortir les poubelles', 10, 'home', 'daily'),
  ('ranger-3-objets', 'productivite', 'Ranger 3 objets qui traînent', 10, 'home', 'daily'),
  ('arroser-plante', 'altruisme', 'Arroser une plante', 10, 'home', 'daily'),
  ('boire-verre-eau', 'corps', 'Boire un verre d''eau', 10, 'any', 'daily'),
  ('aerer-piece', 'corps', 'Aérer une pièce 5 min', 10, 'home', 'daily'),
  ('dire-merci', 'social', 'Dire merci sincèrement à quelqu''un', 10, 'any', 'daily'),
  ('ranger-chaussures', 'productivite', 'Ranger ses chaussures à l''entrée', 10, 'home', 'daily'),
  ('vider-poches', 'productivite', 'Vider ses poches / son sac', 10, 'any', 'daily')
on conflict (id) do nothing;
