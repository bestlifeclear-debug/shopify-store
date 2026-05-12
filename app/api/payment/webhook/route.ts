import { NextResponse } from "next/server"
import { tryCreateSupabaseServiceClient } from "@/lib/supabase"
import {
  amountsMatchOrderTotal,
  getYooMoneyNotificationSecret,
  verifyYooMoneyNotificationSign,
} from "@/lib/yoomoney"

export const dynamic = "force-dynamic"

/**
 * HTTP-уведомления ЮMoney (application/x-www-form-urlencoded).
 * Настройка: кошелёк → HTTP-уведомления → URL этого маршрута.
 * @see https://yoomoney.ru/docs/payment-buttons/using-api/notifications
 */
export async function POST(req: Request) {
  let secret: string
  try {
    secret = getYooMoneyNotificationSecret()
  } catch (e) {
    console.error("[yoomoney webhook]", e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  const raw = await req.text()
  const sp = new URLSearchParams(raw)
  const params: Record<string, string> = {}
  for (const [k, v] of sp.entries()) {
    params[k] = v
  }

  if (!verifyYooMoneyNotificationSign(params, secret)) {
    console.error("[yoomoney webhook] неверная подпись sign")
    return new NextResponse("invalid sign", { status: 403 })
  }

  const notificationType = params.notification_type
  if (notificationType !== "p2p-incoming" && notificationType !== "card-incoming") {
    return NextResponse.json({ ok: true })
  }

  const orderId = params.label?.trim()
  if (!orderId) {
    return NextResponse.json({ ok: true })
  }

  const withdrawAmount = params.withdraw_amount
  if (!withdrawAmount) {
    return NextResponse.json({ ok: true })
  }

  const svc = tryCreateSupabaseServiceClient()
  if (!svc) {
    console.error("[yoomoney webhook] нет SUPABASE_SERVICE_ROLE_KEY")
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  const { data: order, error } = await svc
    .from("orders")
    .select("id, total, status")
    .eq("id", orderId)
    .maybeSingle()

  if (error || !order) {
    return NextResponse.json({ ok: true })
  }

  if (order.status !== "pending_payment") {
    return NextResponse.json({ ok: true })
  }

  const total =
    typeof order.total === "string" ? Number.parseFloat(order.total) : order.total
  if (!Number.isFinite(total) || !amountsMatchOrderTotal(withdrawAmount, total)) {
    console.error("[yoomoney webhook] сумма не совпадает с заказом", {
      orderId,
      withdrawAmount,
      total,
    })
    return NextResponse.json({ ok: true })
  }

  const operationId = params.operation_id?.trim() || null

  const { error: upErr } = await svc
    .from("orders")
    .update({
      status: "paid",
      yookassa_payment_id: operationId,
    })
    .eq("id", orderId)
    .eq("status", "pending_payment")

  if (upErr) {
    console.error("[yoomoney webhook] update failed", upErr)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
