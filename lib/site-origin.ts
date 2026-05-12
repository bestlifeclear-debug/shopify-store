/**
 * Публичный origin для ссылок (редирект после оплаты, мост ЮMoney).
 * В production задайте NEXT_PUBLIC_SITE_URL (https://ваш-домен) — не опирайтесь только на Host.
 */
export function trustedSiteOrigin(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) {
    try {
      const normalized = configured.replace(/\/+$/, "")
      const u = new URL(normalized)
      if (u.protocol === "http:" || u.protocol === "https:") {
        return `${u.protocol}//${u.host}`
      }
    } catch {
      /* fall through */
    }
  }

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "").split("/")[0]
    if (host) return `https://${host}`
  }

  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000"
  const proto = req.headers.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}
