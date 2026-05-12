import { ProductGrid } from "@/components/store/product-grid"
import { fetchProducts, uniqueCategories } from "@/lib/product-data"

export const metadata = {
  title: "Каталог",
  description: "Каталог FutureNest: товары для дома и умного быта.",
}

export const revalidate = 60

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category } = await searchParams
  const products = await fetchProducts()
  const categories = uniqueCategories(products)

  const initialCategory =
    category && categories.includes(category) ? category : "Все"

  const maxPrice = products.length
    ? Math.max(...products.map((p) => p.price))
    : 100_000

  return (
    <ProductGrid
      key={`${initialCategory}-${maxPrice}-${products.length}`}
      products={products}
      categories={categories}
      initialCategory={initialCategory}
      maxPrice={maxPrice}
    />
  )
}
