import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { fetchFeaturedProducts } from "@/lib/product-data"
import { ProductCard } from "./product-card"

export async function FeaturedProducts() {
  const featuredProducts = await fetchFeaturedProducts()

  if (featuredProducts.length === 0) {
    return (
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-center text-muted-foreground">
            Подборка пуста. Подключите Supabase и импортируйте товары (файл{" "}
            <code className="rounded bg-secondary px-1">supabase/schema.sql</code>).
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Избранное в каталоге
            </h2>
            <p className="mt-2 text-muted-foreground">
              Популярные позиции, которые чаще всего выбирают покупатели
            </p>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-1 text-sm font-medium transition-colors hover:text-foreground/80 sm:flex"
          >
            Смотреть все
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:hidden">
          <Link href="/products" className="flex items-center gap-1 text-sm font-medium">
            Весь каталог
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
