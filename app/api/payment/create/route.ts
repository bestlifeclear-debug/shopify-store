import { NextResponse } from "next/server"
import { z } from "zod"
import { tryCreateSupabaseServiceClient } from "@/lib/supabase"
import { buildYooMoneyBridgeUrl } from "@/lib/yoomoney"
import { trustedSiteOrigin } from "@/lib/site-origin"

const bodySchema = z.object({
  orderId: z.string().uuid(),
})

/** Повторная ссылка на оплату ЮMoney для заказа в статусе pending_payment. */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный orderId" }, { status: 400 })
  }

  const svc = tryCreateSupabaseServiceClient()
  if (!svc) {
    return NextResponse.json(
      { error: "Нужен SUPABASE_SERVICE_ROLE_KEY" },
      { status: 503 },
    )
  }

  const { orderId } = parsed.data
  const { data: order, error } = await svc
    .from("orders")
    .select("id, total, status")
    .eq("id", orderId)
    .maybeSingle()

  if (error || !order) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
  }

  if (order.status !== "pending_payment") {
    return NextResponse.json({ error: "Заказ не ожидает оплату" }, { status: 400 })
  }

  const total =
    typeof order.total === "string" ? Number.parseFloat(order.total) : order.total

  const origin = trustedSiteOrigin(req)
  let confirmationUrl: string
  try {
    confirmationUrl = buildYooMoneyBridgeUrl(origin, orderId)
  } catch (e) {
    console.error(e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка настроек ЮMoney" },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true, confirmationUrl })
}
