import { NextResponse } from "next/server"
import { tryCreateSupabaseServiceClient } from "@/lib/supabase"
import {
  cancelStalePendingPaymentOrders,
  stalePendingPaymentHoursFromEnv,
} from "@/lib/cancel-stale-pending-orders"

export const dynamic = "force-dynamic"

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) return false
  const auth = req.headers.get("authorization")?.trim()
  if (auth === `Bearer ${secret}`) return true
  const url = new URL(req.url)
  return url.searchParams.get("secret") === secret
}

async function run() {
  const svc = tryCreateSupabaseServiceClient()
  if (!svc) {
    return NextResponse.json(
      { error: "Нужен SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 },
    )
  }
  const hours = stalePendingPaymentHoursFromEnv()
  const { cancelled, error } = await cancelStalePendingPaymentOrders(svc, {
    olderThanHours: hours,
  })
  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
  return NextResponse.json({ ok: true, cancelled, olderThanHours: hours })
}

/**
 * Периодическая отмена неоплаченных заказов (pending_payment старше STALE_PENDING_PAYMENT_HOURS).
 * Защита: заголовок Authorization: Bearer CRON_SECRET или ?secret= (как в админке).
 */
export async function POST(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return run()
}

export async function GET(req: Request) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return run()
}
