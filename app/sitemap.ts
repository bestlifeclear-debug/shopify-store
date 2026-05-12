import type { MetadataRoute } from "next"
import { fetchProducts } from "@/lib/product-data"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const base = raw ? raw.replace(/\/+$/, "") : "http://localhost:3000"
  const products = await fetchProducts()

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/product/${p.id}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/cart`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/checkout`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...productUrls,
  ]
}
