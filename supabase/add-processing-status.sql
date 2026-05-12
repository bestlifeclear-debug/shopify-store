-- ============================================================================
-- Добавляет статус "processing" в CHECK constraint таблицы public.orders.
-- Нужен, чтобы вы могли вручную ставить status = 'processing' в Supabase UI.
--
-- Выполнить в Supabase SQL Editor (один раз).
-- ============================================================================

do $$
begin
  -- Пересоздаём constraint с новым набором статусов.
  -- Важно: имя constraint в вашей схеме: orders_status_check
  alter table public.orders drop constraint if exists orders_status_check;

  alter table public.orders
    add constraint orders_status_check check (
      status in (
        'pending',
        'pending_payment',
        'paid',
        'processing',
        'shipped',
        'completed',
        'cancelled'
      )
    );
end $$;

