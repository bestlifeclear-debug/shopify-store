"use client"

import dynamic from "next/dynamic"

const Analytics = dynamic(
  () =>
    import("@vercel/analytics/next").then((m) => m.Analytics),
  { ssr: false },
)

export function ClientAnalytics() {
  if (process.env.NODE_ENV !== "production") return null
  return <Analytics />
}
