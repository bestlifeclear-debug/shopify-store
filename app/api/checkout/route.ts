import { NextResponse } from "next/server"
import { z } from "zod"
import {
  tryCreateSupabaseClient,
  tryCreateSupabaseServiceClient,
} from "@/lib/supabase"
import { buildYooMoneyBridgeUrl } from "@/lib/yoomoney"
import { normalizeRuPhoneE164 } from "@/lib/phone-ru"
import { FLAT_SHIPPING_RUB, FREE_SHIPPING_THRESHOLD_RUB } from "@/lib/constants"
import { paymentMethodSchema } from "@/lib/validation/checkout"
import {
  cancelStalePendingPaymentOrders,
  stalePendingPaymentHoursFromEnv,
} from "@/lib/cancel-stale-pending-orders"
import { trustedSiteOrigin } from "@/lib/site-origin"
import type { Database } from "@/lib/database.types"

type ProductPriceRow = Pick<
  Database["public"]["Tables"]["products"]["Row"],
  "id" | "price"
>
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"]

const lineSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
})

const bodySchema = z.object({
  customer: z.object({
    fullName: z.string().min(3),
    phoneDisplay: z.string().min(1),
    email: z.string().optional(),
    city: z.string().min(1),
    address: z.string().min(5),
    apartment: z.string().min(1),
    postalCode: z.string().min(1),
    comment: z.string().optional(),
  }),
  paymentMethod: paymentMethodSchema,
  items: z.array(lineSchema).min(1),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const phone = normalizeRuPhoneE164(parsed.data.customer.phoneDisplay)
  if (!phone) {
    return NextResponse.json({ error: "Некорректный телефон" }, { status: 400 })
  }

  const supabase = tryCreateSupabaseClient()
  if (!supabase) {
    return NextResponse.json(
      { error: "База данных не настроена (NEXT_PUBLIC_SUPABASE_*)" },
      { status: 503 },
    )
  }

  // Для создания заказов обычно нужен service role key (RLS блокирует insert для anon).
  // Если у вас настроены политики INSERT для anon/authenticated, можно обойтись без service key,
  // но по умолчанию в Supabase безопаснее выполнять server-side insert через service client.
  const svc = tryCreateSupabaseServiceClient()

  if (svc) {
    const staleH = stalePendingPaymentHoursFromEnv()
    void cancelStalePendingPaymentOrders(svc, { olderThanHours: staleH }).then(
      ({ cancelled, error }) => {
        if (error) console.warn("checkout: stale pending_payment cleanup", error)
        else if (cancelled > 0) console.info("checkout: cancelled stale orders", cancelled)
      },
    )
  }

  const { items, customer, paymentMethod } = parsed.data
  const ids = [...new Set(items.map((i) => i.productId))]
  const { data: rowsRaw, error: pErr } = await supabase
    .from("products")
    .select("id, price")
    .in("id", ids)

  const rows = rowsRaw as ProductPriceRow[] | null

  if (pErr || !rows?.length) {
    return NextResponse.json(
      { error: "Не удалось загрузить товары" },
      { status: 400 },
    )
  }

  const priceById = new Map(
    rows.map((r) => [r.id, typeof r.price === "string" ? Number(r.price) : r.price]),
  )

  let subtotal = 0
  const resolvedLines: { productId: string; quantity: number; price: number }[] = []
  for (const line of items) {
    const p = priceById.get(line.productId)
    if (p == null || !Number.isFinite(p)) {
      return NextResponse.json({ error: "Неизвестный товар в корзине" }, { status: 400 })
    }
    subtotal += p * line.quantity
    resolvedLines.push({ productId: line.productId, quantity: line.quantity, price: p })
  }

  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD_RUB ? 0 : FLAT_SHIPPING_RUB
  const total = subtotal + shipping

  const fullAddress = [
    customer.city,
    customer.address,
    customer.apartment ? `кв./оф. ${customer.apartment}` : null,
    customer.postalCode ? `индекс ${customer.postalCode}` : null,
  ]
    .filter(Boolean)
    .join(", ")

  const needsOnlinePayment = paymentMethod === "yoomoney"

  const initialStatus = needsOnlinePayment ? "pending_payment" : "pending"

  const orderPayload: OrderInsert = {
    id: globalThis.crypto.randomUUID(),
    customer_name: customer.fullName,
    phone,
    email: customer.email?.trim() || null,
    address: fullAddress,
    city: customer.city,
    apartment: customer.apartment.trim(),
    postal_code: customer.postalCode.trim(),
    comment: customer.comment?.trim() || null,
    total,
    status: initialStatus,
    delivery_method: null,
    payment_method: paymentMethod,
  }

  const ordersDb = svc ?? supabase

  const { error: oErr } = await ordersDb.from("orders").insert([orderPayload])

  if (oErr) {
    console.error("checkout: orders insert failed", {
      code: oErr.code,
      message: oErr.message,
      details: oErr.details,
      hint: oErr.hint,
    })
    const msg =
      !svc &&
      (oErr?.code === "42501" ||
        /permission denied|policy|RLS|row-level security/i.test(oErr?.message ?? ""))
        ? "Нет прав на создание заказа (RLS). Добавьте INSERT policies или SUPABASE_SERVICE_ROLE_KEY."
        : "Не удалось создать заказ"
    return NextResponse.json(
      {
        error: msg,
        ...(process.env.NODE_ENV !== "production" && oErr
          ? {
              supabase: {
                code: oErr.code,
                message: oErr.message,
                details: oErr.details,
                hint: oErr.hint,
              },
            }
          : null),
      },
      { status: 500 },
    )
  }

  const orderId = orderPayload.id!

  const orderLines: OrderItemInsert[] = resolvedLines.map((l) => ({
    order_id: orderId,
    product_id: l.productId,
    quantity: l.quantity,
    price: l.price,
  }))

  const { error: oiErr } = await ordersDb.from("order_items").insert(orderLines)

  if (oiErr) {
    if (svc) {
      const { error: rollbackErr } = await svc.from("orders").delete().eq("id", orderPayload.id!)
      if (rollbackErr) {
        console.error("checkout: rollback order delete failed", rollbackErr)
      }
    }
    console.error("checkout: order_items insert failed", {
      code: oiErr.code,
      message: oiErr.message,
      details: oiErr.details,
      hint: oiErr.hint,
    })
    const msg =
      !svc &&
      (oiErr?.code === "42501" ||
        /permission denied|policy|RLS|row-level security/i.test(oiErr?.message ?? ""))
        ? "Нет прав на сохранение состава заказа (RLS). Добавьте INSERT policies или SUPABASE_SERVICE_ROLE_KEY."
        : "Не удалось сохранить состав заказа"
    return NextResponse.json(
      {
        error: msg,
        ...(process.env.NODE_ENV !== "production"
          ? {
              supabase: {
                code: oiErr.code,
                message: oiErr.message,
                details: oiErr.details,
                hint: oiErr.hint,
              },
            }
          : null),
      },
      { status: 500 },
    )
  }

  if (!needsOnlinePayment) {
    return NextResponse.json({
      ok: true,
      orderId,
      confirmationUrl: null as string | null,
    })
  }

  const origin = trustedSiteOrigin(req)
  let confirmationUrl: string
  try {
    confirmationUrl = buildYooMoneyBridgeUrl(origin, orderId)
  } catch (e) {
    console.error(e)
    if (svc) {
      await svc.from("orders").update({ status: "cancelled" }).eq("id", orderId)
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Ошибка настроек ЮMoney" },
      { status: 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    orderId,
    confirmationUrl,
  })
}
