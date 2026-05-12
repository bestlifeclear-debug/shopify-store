import { NextResponse } from "next/server"
import { tryCreateSupabaseServiceClient, supabaseServiceEnvHint } from "@/lib/supabase"
import { trustedSiteOrigin } from "@/lib/site-origin"
import {
  buildQuickPayFormFields,
  getYooMoneyWallet,
  quickPayFormHtml,
  quickPayTypeForPaymentMethod,
} from "@/lib/yoomoney"

export const dynamic = "force-dynamic"

function errHtml(message: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/><title>Оплата</title></head><body><p>${esc(
    message,
  )}</p><p><a href="/">На главную</a></p></body></html>`
}

/**
 * HTML-мост: авто-POST на https://yoomoney.ru/quickpay/confirm (форма сбора / быстрый перевод).
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const orderId = url.searchParams.get("orderId")?.trim()
  if (!orderId) {
    return new NextResponse(errHtml("Не указан номер заказа"), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  const svc = tryCreateSupabaseServiceClient()
  if (!svc) {
    const hint = supabaseServiceEnvHint()
    return new NextResponse(
      errHtml(
        `Сервер не видит настройки Supabase (${hint}). ` +
          "Проверьте .env.local в корне этого проекта, сохраните файл (Ctrl+S) и полностью перезапустите dev-сервер (остановите и снова npm run dev). " +
          "Ключ service_role: Supabase → Project Settings → API.",
      ),
      {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    )
  }

  let wallet: string
  try {
    wallet = getYooMoneyWallet()
  } catch (e) {
    return new NextResponse(errHtml(e instanceof Error ? e.message : "Ошибка настроек ЮMoney"), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  const { data: order, error } = await svc
    .from("orders")
    .select("id, total, status, payment_method")
    .eq("id", orderId)
    .maybeSingle()

  if (error || !order) {
    return new NextResponse(errHtml("Заказ не найден"), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  if (order.status !== "pending_payment") {
    return new NextResponse(errHtml("Этот заказ не ожидает оплату"), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  const total =
    typeof order.total === "string" ? Number.parseFloat(order.total) : order.total
  if (!Number.isFinite(total) || total <= 0) {
    return new NextResponse(errHtml("Некорректная сумма заказа"), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }

  const origin = trustedSiteOrigin(req)
  const successUrl = `${origin}/order-success?orderId=${encodeURIComponent(orderId)}`
  const paymentType = quickPayTypeForPaymentMethod(order.payment_method)

  const fields = buildQuickPayFormFields({
    wallet,
    orderId,
    amountRub: total,
    description: `Заказ ${orderId.slice(0, 8)}`,
    successUrl,
    paymentType,
  })

  return new NextResponse(quickPayFormHtml(fields), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}
