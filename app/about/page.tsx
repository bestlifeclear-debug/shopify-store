import Link from "next/link"

export const metadata = {
  title: "О нас",
  description: "Коротко о FutureNest.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">О нас</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          FutureNest — магазин товаров для дома и умного быта. Мы подбираем позиции,
          оформляем заказ и запускаем отправку.
        </p>
        <p>
          Статусы заказов обновляются в системе. Проверьте свой заказ на странице{" "}
          <Link href="/track-order" className="underline hover:text-foreground">
            «Отследить заказ»
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

