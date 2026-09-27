-- =====================================================================
-- Tibu Phase 1 — 0006: category taxonomy (from the prototype + SOW)
-- Top-level chips on Home = parent_id is null. Confirm final list with client.
-- =====================================================================
insert into public.categories (slug, name, icon, sort_order) values
  ('desserts',  'Desserts',  '🍰', 10),
  ('food',      'Home Food', '🍲', 20),
  ('handmade',  'Handmade',  '🧶', 30),
  ('fashion',   'Fashion',   '👗', 40),
  ('jewellery', 'Jewellery', '💍', 50),
  ('gifts',     'Gifts',     '🎁', 60)
on conflict (slug) do nothing;

insert into public.categories (slug, name, icon, sort_order, parent_id)
select v.slug, v.name, v.icon, v.sort_order, p.id
from (values
  ('crochet',        'Crochet',         '🧶', 31, 'handmade'),
  ('embroidery',     'Embroidery',      '🪡', 32, 'handmade'),
  ('resin-art',      'Resin Art',       '💎', 33, 'handmade'),
  ('candles',        'Candles',         '🕯️', 34, 'handmade'),
  ('womens-fashion', 'Women''s Fashion', '👗', 41, 'fashion'),
  ('mens-fashion',   'Men''s Fashion',   '👔', 42, 'fashion')
) as v(slug, name, icon, sort_order, parent_slug)
join public.categories p on p.slug = v.parent_slug
on conflict (slug) do nothing;
