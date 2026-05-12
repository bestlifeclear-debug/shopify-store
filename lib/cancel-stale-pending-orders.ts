import type { SupabaseClient } from "@supabase/supabase-js"

/** Сколько часов ждать оплату, потом считать заказ брошенным и отменять. */
export function stalePendingPaymentHoursFromEnv(): number {
  const raw = process.env.STALE_PENDING_PAYMENT_HOURS
  const n = raw ? Number.parseInt(raw, 10) : 24
  if (!Number.isFinite(n)) return 24
  return Math.min(168, Math.max(1, n))
}

/**
 * Заказы в pending_payment старше `olderThanHours` → cancelled.
 * Не трогает уже оплаченные и черновики без онлайн-оплаты.
 */
export async function cancelStalePendingPaymentOrders(
  svc: SupabaseClient,
  options: { olderThanHours: number },
): Promise<{ cancelled: number; error: string | null }> {
  const ms = options.olderThanHours * 60 * 60 * 1000
  const cutoff = new Date(Date.now() - ms).toISOString()

  const { data, error } = await svc
    .from("orders")
    .update({ status: "cancelled" })
    .eq("status", "pending_payment")
    .lt("created_at", cutoff)
    .select("id")

  if (error) {
    return { cancelled: 0, error: error.message }
  }
  return { cancelled: data?.length ?? 0, error: null }
}
