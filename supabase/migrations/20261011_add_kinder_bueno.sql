insert into public.products (
  slug,
  name,
  description,
  photo_url,
  price,
  units_total,
  units_adjustment,
  is_active,
  sort_order
)
select
  'kinder-bueno',
  'Crookie Kinder Bueno',
  'Croissant, recheado com cookie tradicional de baunilha, creme Bueno, finalizado com mais creme Bueno e bombom Kinder White (Serve até 2 pessoas).',
  null,
  66.99,
  30,
  0,
  true,
  3
where not exists (
  select 1
  from public.products
  where slug = 'kinder-bueno'
);
