-- Схема для интернет-магазина (Supabase / PostgreSQL)
-- Выполните в SQL Editor проекта Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  price numeric(12,2) not null check (price >= 0),
  original_price numeric(12,2),
  images jsonb not null default '[]'::jsonb,
  category text not null,
  stock integer not null default 0 check (stock >= 0),
  featured boolean not null default false,
  badge text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text,
  apartment text,
  postal_code text,
  comment text,
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'pending',
  delivery_method text,
  payment_method text,
  yookassa_payment_id text,
  created_at timestamptz not null default now(),
  constraint orders_status_check check (
    status in (
      'pending',
      'pending_payment',
      'paid',
      'shipped',
      'completed',
      'cancelled'
    )
  )
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null check (quantity > 0),
  price numeric(12,2) not null check (price >= 0)
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_featured on public.products(featured);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Каталог: чтение для всех
drop policy if exists "products_select_all" on public.products;
create policy "products_select_all" on public.products
  as permissive
  for select
  to anon, authenticated
  using (true);

-- Заказы: создание с клиента (anon) — для production ограничьте по IP / добавьте captcha
drop policy if exists "orders_insert_anon" on public.orders;
create policy "orders_insert_anon" on public.orders
  for insert with check (true);

drop policy if exists "orders_select_service" on public.orders;
-- Чтение заказов только service role (админка / webhook)
create policy "orders_select_service" on public.orders
  for select using (auth.role() = 'service_role');

drop policy if exists "orders_update_service" on public.orders;
create policy "orders_update_service" on public.orders
  for update using (auth.role() = 'service_role');

drop policy if exists "order_items_insert_anon" on public.order_items;
create policy "order_items_insert_anon" on public.order_items
  for insert with check (true);

drop policy if exists "order_items_select_service" on public.order_items;
create policy "order_items_select_service" on public.order_items
  for select using (auth.role() = 'service_role');

-- Сид с демо-товарами (рубли, русские названия)
insert into public.products (id, title, slug, description, price, original_price, images, category, stock, featured, badge)
values
  ('feac0c49-1f48-4510-bdc0-d1064025dee4', 'Минималистичная керамическая ваза', 'minimalist-ceramic-vase',
   'Керамическая ваза ручной работы с матовым покрытием. Подходит для современных интерьеров.', 8990, 11990,
   '["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80","https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&q=80"]'::jsonb,
   'Дом', 24, true, 'Скидка'),
  ('9eddd516-4f6e-4ab6-8d7f-07843d782fc7', 'Кожаный органайзер для стола', 'leather-desk-organizer',
   'Органайзер из натуральной кожи с отделениями и фурнитурой из латуни.', 14500, null,
   '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80"]'::jsonb,
   'Офис', 18, true, null),
  ('dae57a73-89e2-44c9-8725-a2d9ed4dfac7', 'Беспроводная зарядная подставка', 'wireless-charger-stand',
   'Алюминиевая подставка с быстрой зарядкой Qi.', 7990, null,
   '["https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=800&q=80"]'::jsonb,
   'Техника', 40, true, 'Новинка'),
  ('a3f41b86-590a-40a7-82cf-0e5b97dec846', 'Плед из мериносовой шерсти', 'merino-wool-throw',
   'Тёплый плед 100% меринос. Мягкий и лёгкий.', 19990, null,
   '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"]'::jsonb,
   'Дом', 12, true, null),
  ('3839e656-6a35-4d3b-b000-69fb32da69ba', 'Латунная настольная лампа', 'brass-table-lamp',
   'Лампа из латуни с льняным абажуром, диммируемая LED-лампа в комплекте.', 22990, 28990,
   '["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80"]'::jsonb,
   'Освещение', 9, true, 'Скидка'),
  ('128fcbc5-b019-489f-b616-e101d314a6bb', 'Набор подставок из мрамора', 'marble-coaster-set',
   '4 подставки из натурального мрамора с пробковой основой.', 6590, null,
   '["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80"]'::jsonb,
   'Дом', 30, true, null),
  ('0ea3d979-4ae3-4af3-9cd4-b80b30cc6d0d', 'Сумка-тоут из канваса', 'canvas-tote-bag',
   'Плотный органический хлопок, кожаные ручки, внутренний карман.', 8590, null,
   '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"]'::jsonb,
   'Аксессуары', 22, true, null),
  ('e51ce506-5dd2-4603-93c7-9809e3fcbb56', 'Шкатулка для часов из ореха', 'wooden-watch-box',
   'На 6 часов, стеклянная крышка, бархатная подкладка.', 12500, null,
   '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"]'::jsonb,
   'Аксессуары', 7, true, null),
  ('19ce7d19-c666-4d96-92b4-fd850261832f', 'Комплект льняного постельного белья', 'linen-bed-sheets',
   '100% лён, комплект: простыня, пододеяльник, 2 наволочки.', 28990, null,
   '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80"]'::jsonb,
   'Спальня', 11, false, 'Хит'),
  ('17449cce-8d31-423c-a41b-89be07cc26df', 'Кофемашина для эспрессо', 'espresso-machine',
   'Домашняя профессиональная кофемашина, 15 бар, встроенная кофемолка.', 45990, 55990,
   '["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80"]'::jsonb,
   'Кухня', 5, false, 'Скидка'),
  ('19b8a167-b895-4701-8b9d-fa57bfec3064', 'Подушка для медитации', 'meditation-cushion',
   'Наполнитель гречневая лузга, съёмный чехол из хлопка.', 7590, null,
   '["https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80"]'::jsonb,
   'Здоровье', 16, false, null),
  ('5f02a213-6766-4433-b266-04eaac3388a5', 'Набор для пуровера', 'ceramic-pour-over-set',
   'Керамический дриппер и графин, объём графина ~600 мл.', 9590, null,
   '["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"]'::jsonb,
   'Кухня', 14, false, 'Новинка'),
  ('4e2d3a25-67b3-440f-aa77-35511c5219dc', 'Шерстяной ковёр', 'wool-area-rug',
   'Ручная работа, геометрический узор, размер ~150×210 см.', 39990, null,
   '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"]'::jsonb,
   'Дом', 4, false, null),
  ('8297e827-3c17-43cf-abe1-ba74985972d0', 'Беспроводные наушники с шумоподавлением', 'noise-canceling-headphones',
   'Адаптивное шумоподавление, до 30 часов работы, кейс в комплекте.', 34990, 39990,
   '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"]'::jsonb,
   'Техника', 20, false, 'Скидка'),
  ('b5295c01-2357-48e3-bab3-5c885c5ef6a8', 'Набор подставок для растений', 'plant-stand-set',
   '3 подставки из бамбука разной высоты, простая сборка.', 13590, null,
   '["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80"]'::jsonb,
   'Дом', 13, false, null)
on conflict (id) do nothing;
