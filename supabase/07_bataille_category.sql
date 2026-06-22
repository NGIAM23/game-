-- Nouvelle catégorie "Bataille" : défis personnels intenses, pas de PvP entre joueurs.
-- À exécuter après 06_payments_cosmetics_social.sql, dans Supabase → SQL Editor.

insert into tasks (id, category, label, base_xp, location, frequency) values
  ('bataille-pompes-50', 'bataille', 'Faire 50 pompes (en plusieurs séries si besoin)', 35, 'any', 'daily'),
  ('bataille-froid', 'bataille', 'Prendre une douche froide', 30, 'home', 'daily'),
  ('bataille-jeune', 'bataille', 'Jeûner jusqu''à midi', 30, 'any', 'daily'),
  ('bataille-reveil-tot', 'bataille', 'Se lever avant 6h30', 35, 'home', 'daily'),
  ('bataille-no-sucre', 'bataille', 'Une journée sans sucre ajouté', 30, 'any', 'daily'),
  ('bataille-marathon-travail', 'bataille', '2h de travail/étude sans interruption', 40, 'any', 'daily'),
  ('bataille-semaine-sport', 'bataille', 'S''entraîner 5 fois cette semaine', 90, 'any', 'weekly'),
  ('bataille-semaine-discipline', 'bataille', 'Tenir un défi personnel toute la semaine', 100, 'any', 'weekly')
on conflict (id) do nothing;
