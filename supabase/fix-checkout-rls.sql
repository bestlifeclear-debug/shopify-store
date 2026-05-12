-- ============================================================================
-- Выполнить ОДИН РАЗ в Supabase:
-- Supabase Dashboard → SQL Editor → вставить файл целиком → Run
--
-- Цель: разрешить вашему сайту (anon key) создавать заказы через /api/checkout.
-- По умолчанию при включённом RLS INSERT в orders/order_items будет блокироваться,
-- из-за чего API отвечает 500 и заказ не сохраняется.
-- ============================================================================

-- 1) Включаем RLS (если уже включено — ок)
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- 2) Права на схему и таблицы для PostgREST (anon/authenticated)
grant usage on schema public to anon, authenticated;
grant insert, select, update on public.orders to anon, authenticated;
grant insert, select on public.order_items to anon, authenticated;

-- 3) Политики (разрешаем только то, что нужно для оформления заказа)
drop policy if exists "orders_insert_anon" on public.orders;
create policy "orders_insert_anon"
  on public.orders
  as permissive
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "order_items_insert_anon" on public.order_items;
create policy "order_items_insert_anon"
  on public.order_items
  as permissive
  for insert
  to anon, authenticated
  with check (true);

-- Если ваш webhook оплаты обновляет статус заказа через anon — добавьте update policy.
-- Рекомендуется выполнять update статус/платёж только через service_role (как сейчас в коде),
-- поэтому отдельную update policy здесь НЕ добавляем умышленно.

