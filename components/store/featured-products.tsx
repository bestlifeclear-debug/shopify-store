import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { fetchHomeFeaturedSection } from "@/lib/product-data"
import { isSupabaseAnonConfigured } from "@/lib/supabase"
import { ProductCard } from "./product-card"

export async function FeaturedProducts() {
  const configured = isSupabaseAnonConfigured()
  const { products, source } = await fetchHomeFeaturedSection()

  if (products.length === 0) {
    return (
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <p className="text-center text-muted-foreground">
            {!configured ? (
              <>
                Каталог не подключён на сервере. В{" "}
                <strong className="text-foreground">Vercel</strong> → Project →{" "}
                <strong className="text-foreground">Settings → Environment Variables</strong>{" "}
                добавьте для <strong className="text-foreground">Production</strong> те же
                значения, что в <code className="rounded bg-secondary px-1">.env.local</code>:{" "}
                <code className="rounded bg-secondary px-1">NEXT_PUBLIC_SUPABASE_URL</code> и{" "}
                <code className="rounded bg-secondary px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
                Затем сделайте <strong className="text-foreground">Redeploy</strong>.
              </>
            ) : (
              <>
                В таблице <code className="rounded bg-secondary px-1">products</code> нет строк
                или для роли <code className="rounded bg-secondary px-1">anon</code> нет политики
                SELECT (RLS). Выполните в Supabase SQL из{" "}
                <code className="rounded bg-secondary px-1">supabase/one-click-catalog.sql</code>{" "}
                или <code className="rounded bg-secondary px-1">supabase/schema.sql</code>.
              </>
            )}
          </p>
        </div>
      </section>
    )
  }

  const isFallback = source === "catalog_fallback"

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {isFallback ? "Свежие позиции" : "Избранное в каталоге"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isFallback
                ? "Пока нет отмеченных «избранным» — показываем последние товары из каталога"
                : "Популярные позиции, которые чаще всего выбирают покупатели"}
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
          {products.map((product) => (
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
