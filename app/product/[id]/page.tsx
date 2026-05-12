import { notFound } from "next/navigation"
import { fetchProductById, fetchRelatedProducts } from "@/lib/product-data"
import { ProductDetail } from "@/components/store/product-detail"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 60

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params
  const product = await fetchProductById(id)

  if (!product) {
    return {
      title: "Товар не найден",
      description: "Запрашиваемая позиция отсутствует в каталоге.",
    }
  }

  const description =
    product.description.length > 160
      ? `${product.description.slice(0, 157)}…`
      : product.description

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
      locale: "ru_RU",
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await fetchProductById(id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await fetchRelatedProducts(product.category, product.id)

  return (
    <ProductDetail product={product} relatedProducts={relatedProducts} />
  )
}
