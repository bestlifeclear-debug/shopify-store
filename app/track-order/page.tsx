import { Suspense } from "react"
import { TrackOrderPage } from "@/components/store/track-order-page"

export const metadata = {
  title: "Отслеживание заказа",
  description: "Проверьте статус заказа по номеру и телефону.",
}

export default function TrackOrder() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground sm:px-6 lg:px-8">
          Загрузка…
        </div>
      }
    >
      <TrackOrderPage />
    </Suspense>
  )
}

