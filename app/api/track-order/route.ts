import { NextResponse } from "next/server"
import { z } from "zod"
import { tryCreateSupabaseClient, tryCreateSupabaseServiceClient } from "@/lib/supabase"
import { normalizeRuPhoneE164 } from "@/lib/phone-ru"
import type { Database } from "@/lib/database.types"

const bodySchema = z.object({
  orderId: z.string().uuid(),
  phoneDisplay: z.string().min(1),
})

type OrderRow = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  "id" | "created_at" | "status" | "total" | "phone"
>

type OrderItemRow = Pick<
  Database["public"]["Tables"]["order_items"]["Row"],
  "quantity" | "price"
> & {
  products: Pick<Database["public"]["Tables"]["products"]["Row"], "title"> | null
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные данные", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const phone = normalizeRuPhoneE164(parsed.data.phoneDisplay)
  if (!phone) {
    return NextResponse.json({ error: "Некорректный телефон" }, { status: 400 })
  }

  const anon = tryCreateSupabaseClient()
  if (!anon) {
    return NextResponse.json(
      { error: "База данных не настроена (NEXT_PUBLIC_SUPABASE_*)" },
      { status: 503 },
    )
  }

  // Предпочитаем service role: обычно SELECT на orders/order_items закрыт RLS.
  // Без service key трекинг будет работать только если вы настроили SELECT policies.
  const supabase = tryCreateSupabaseServiceClient() ?? anon

  const { data: orderRaw, error: oErr } = await supabase
    .from("orders")
    .select("id, created_at, status, total, phone")
    .eq("id", parsed.data.orderId)
    .maybeSingle()

  const order = orderRaw as OrderRow | null

  if (oErr || !order) {
    if (oErr) console.error("track-order: orders select failed", oErr)
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
  }

  // Не раскрываем, существует ли заказ: при несовпадении телефона тоже "не найден".
  if (order.phone !== phone) {
    return NextResponse.json({ error: "Заказ не найден" }, { status: 404 })
  }

  const { data: itemsRaw, error: iErr } = await supabase
    .from("order_items")
    .select("quantity, price, products(title)")
    .eq("order_id", order.id)
    .order("id", { ascending: true })

  const items = (itemsRaw as OrderItemRow[] | null) ?? []

  if (iErr) {
    console.error("track-order: order_items select failed", iErr)
    return NextResponse.json({ error: "Не удалось загрузить состав заказа" }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      createdAt: order.created_at,
      status: order.status,
      total: order.total,
    },
    items: items.map((i) => ({
      title: i.products?.title ?? "Товар",
      quantity: i.quantity,
      price: i.price,
    })),
  })
}

