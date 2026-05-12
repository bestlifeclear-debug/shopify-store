-- Исправление: товары видны в Table Editor, но на сайте productCount = 0
-- Причина: RLS включён, а политики чтения для anon (браузер / NEXT_PUBLIC ключ) нет.
-- Table Editor использует другую роль и обходит ограничения.

alter table public.products enable row level security;

drop policy if exists "products_select_all" on public.products;
create policy "products_select_all"
  on public.products
  as permissive
  for select
  to anon, authenticated
  using (true);

-- После этого снова вставьте товары (SQL Editor → блок INSERT из schema.sql),
-- если таблицу очистили.
