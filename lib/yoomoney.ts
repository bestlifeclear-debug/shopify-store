import { createHmac, timingSafeEqual } from "crypto"

const QUICKPAY_ACTION = "https://yoomoney.ru/quickpay/confirm"

export type YooMoneyPaymentType = "PC" | "AC"

export function getYooMoneyWallet(): string {
  const w = process.env.YOOMONEY_WALLET?.trim()
  if (!w) {
    throw new Error("ЮMoney: не задан YOOMONEY_WALLET (номер кошелька получателя)")
  }
  return w
}

export function getYooMoneyNotificationSecret(): string {
  const s = process.env.YOOMONEY_NOTIFICATION_SECRET?.trim()
  if (!s) {
    throw new Error("ЮMoney: не задан YOOMONEY_NOTIFICATION_SECRET (секрет HTTP-уведомлений)")
  }
  return s
}

/**
 * Способ оплаты в форме быстрого перевода: кошелёк ЮMoney или банковская карта.
 */
export function quickPayTypeForPaymentMethod(
  paymentMethod: string | null | undefined,
): YooMoneyPaymentType {
  if (paymentMethod === "yoomoney") return "PC"
  return "AC"
}

export function formatQuickPaySum(amountRub: number): string {
  return (Math.round(amountRub * 100) / 100).toFixed(2)
}

export function buildYooMoneyBridgeUrl(origin: string, orderId: string): string {
  const u = new URL("/api/payment/yoomoney/redirect", origin)
  u.searchParams.set("orderId", orderId)
  return u.toString()
}

export type YooMoneyQuickPayFields = {
  receiver: string
  quickpayForm: "button"
  sum: string
  paymentType: YooMoneyPaymentType
  targets: string
  label: string
  successURL: string
}

export function buildQuickPayFormFields(params: {
  wallet: string
  orderId: string
  amountRub: number
  description: string
  successUrl: string
  paymentType: YooMoneyPaymentType
}): YooMoneyQuickPayFields {
  return {
    receiver: params.wallet,
    quickpayForm: "button",
    sum: formatQuickPaySum(params.amountRub),
    paymentType: params.paymentType,
    targets: params.description,
    label: params.orderId,
    successURL: params.successUrl,
  }
}

export function quickPayFormHtml(fields: YooMoneyQuickPayFields): string {
  const esc = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

  const hidden = (name: string, value: string) =>
    `<input type="hidden" name="${esc(name)}" value="${esc(value)}"/>`

  return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/><title>Оплата</title></head><body>
<form id="yoomoney-pay" method="POST" action="${QUICKPAY_ACTION}">
${hidden("receiver", fields.receiver)}
${hidden("quickpay-form", fields.quickpayForm)}
${hidden("sum", fields.sum)}
${hidden("paymentType", fields.paymentType)}
${hidden("targets", fields.targets)}
${hidden("label", fields.label)}
${hidden("successURL", fields.successURL)}
</form>
<script>document.getElementById("yoomoney-pay").submit();</script>
<noscript><p>Нажмите «Продолжить» для оплаты.</p><button type="submit" form="yoomoney-pay">Продолжить</button></noscript>
</body></html>`
}

/**
 * Проверка подписи HTTP-уведомления ЮMoney (параметр sign, HMAC-SHA256).
 * @see https://yoomoney.ru/docs/payment-buttons/using-api/notifications
 */
export function verifyYooMoneyNotificationSign(
  params: Record<string, string>,
  secret: string,
): boolean {
  const sign = params.sign?.trim()
  if (!sign || !secret) return false

  const keys = Object.keys(params)
    .filter((k) => k !== "sign")
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))

  const body = keys
    .map((k) => {
      const v = params[k] ?? ""
      return `${k}=${encodeURIComponent(v)}`
    })
    .join("&")

  const expected = createHmac("sha256", secret).update(body).digest("hex")
  if (expected.length !== sign.length) return false
  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(sign, "utf8"))
  } catch {
    return false
  }
}

export function amountsMatchOrderTotal(
  withdrawAmountStr: string,
  orderTotal: number,
  tolerance = 0.02,
): boolean {
  const w = Number.parseFloat(withdrawAmountStr.replace(",", "."))
  if (!Number.isFinite(w)) return false
  return Math.abs(w - orderTotal) <= tolerance
}
