import type { Json } from "@/lib/database.types"
import { tryCreateSupabaseClient } from "@/lib/supabase"
import type { Product } from "@/types"

function num(value: number | string | null | undefined): number {
  if (value == null) return 0
  if (typeof value === "number") return value
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function imagesFromJson(raw: Json): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === "string")
}

export function mapRowToProduct(row: {
  id: string
  title: string
  slug: string
  description: string | null
  price: number | string
  original_price: number | string | null
  images: Json
  category: string
  stock: number
  featured: boolean | null
  badge: string | null
  created_at: string
}): Product {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? "",
    price: num(row.price),
    originalPrice:
      row.original_price != null ? num(row.original_price) : undefined,
    images: imagesFromJson(row.images),
    category: row.category,
    stock: row.stock,
    featured: row.featured ?? false,
    badge: row.badge ?? undefined,
    createdAt: row.created_at,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const supabase = tryCreateSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[fetchProducts]", error.message)
    return []
  }

  return (data ?? []).map(mapRowToProduct)
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = tryCreateSupabaseClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    console.error("[fetchProductById]", error.message)
    return null
  }
  if (!data) return null
  return mapRowToProduct(data)
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const supabase = tryCreateSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[fetchFeaturedProducts]", error.message)
    return []
  }

  return (data ?? []).map(mapRowToProduct)
}

export async function fetchRelatedProducts(
  category: string,
  excludeId: string,
  limit = 4,
): Promise<Product[]> {
  const supabase = tryCreateSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(limit)

  if (error) {
    console.error("[fetchRelatedProducts]", error.message)
    return []
  }

  return (data ?? []).map(mapRowToProduct)
}

export function uniqueCategories(products: Product[]): string[] {
  const set = new Set(products.map((p) => p.category).filter(Boolean))
  return ["Все", ...Array.from(set).sort((a, b) => a.localeCompare(b, "ru"))]
}

/**
 * Главная: избранные товары; если ни одного с featured=true — показываем до 8 позиций из каталога.
 */
export async function fetchHomeFeaturedSection(): Promise<{
  products: Product[]
  source: "featured" | "catalog_fallback" | "empty"
}> {
  const featured = await fetchFeaturedProducts()
  if (featured.length > 0) {
    return { products: featured.slice(0, 8), source: "featured" }
  }
  const all = await fetchProducts()
  const slice = all.slice(0, 8)
  if (slice.length > 0) {
    return { products: slice, source: "catalog_fallback" }
  }
  return { products: [], source: "empty" }
}
