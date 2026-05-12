"use client"

import { useMemo, useState } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "./product-card"
import type { Product } from "@/types"
import { formatPrice } from "@/lib/format-price"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface ProductGridProps {
  products: Product[]
  categories: string[]
  initialCategory?: string
  maxPrice: number
}

type CatalogFiltersProps = {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (c: string) => void
  priceRange: [number, number]
  onPriceRangeChange: (r: [number, number]) => void
  maxCatalogPrice: number
  onReset: () => void
}

function ProductCatalogFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  maxCatalogPrice,
  onReset,
}: CatalogFiltersProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold">Категории</h3>
        <div className="mt-4 space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`block w-full text-left text-sm transition-colors ${
                selectedCategory === category
                  ? "font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold">Цена, ₽</h3>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="От"
              value={priceRange[0] || ""}
              onChange={(e) =>
                onPriceRangeChange([Number(e.target.value) || 0, priceRange[1]])
              }
              className="h-9"
            />
            <span className="text-muted-foreground">—</span>
            <Input
              type="number"
              placeholder="До"
              value={priceRange[1] || ""}
              onChange={(e) =>
                onPriceRangeChange([
                  priceRange[0],
                  Number(e.target.value) || maxCatalogPrice,
                ])
              }
              className="h-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              [0, 10_000],
              [10_000, 25_000],
              [25_000, maxCatalogPrice],
            ].map(([min, max]) => (
              <button
                key={`${min}-${max}`}
                type="button"
                onClick={() => onPriceRangeChange([min, max])}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  priceRange[0] === min && priceRange[1] === max
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                }`}
              >
                {formatPrice(min)} — {formatPrice(max)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button variant="outline" size="sm" type="button" onClick={onReset} className="w-full">
        Сбросить фильтры
      </Button>
    </div>
  )
}

export function ProductGrid({
  products,
  categories,
  initialCategory = "Все",
  maxPrice,
}: ProductGridProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const maxCatalogPrice = Math.max(maxPrice, 1000)
  const [priceRange, setPriceRange] = useState<[number, number]>(() => [0, maxCatalogPrice])
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        product.title.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
      const matchesCategory =
        selectedCategory === "Все" || product.category === selectedCategory
      const matchesPrice =
        product.price >= priceRange[0] && product.price <= priceRange[1]

      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [searchQuery, selectedCategory, priceRange, products])

  const resetFilters = () => {
    setSelectedCategory("Все")
    setPriceRange([0, maxCatalogPrice])
    setSearchQuery("")
  }

  const filterProps: CatalogFiltersProps = {
    categories,
    selectedCategory,
    onSelectCategory: setSelectedCategory,
    priceRange,
    onPriceRangeChange: setPriceRange,
    maxCatalogPrice,
    onReset: resetFilters,
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Каталог</h1>
        <p className="mt-4 text-muted-foreground">
          Товары не загружены. Укажите{" "}
          <code className="rounded bg-secondary px-1">NEXT_PUBLIC_SUPABASE_URL</code> и{" "}
          <code className="rounded bg-secondary px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, затем
          выполните SQL из <code className="rounded bg-secondary px-1">supabase/schema.sql</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {selectedCategory === "Все" ? "Все товары" : selectedCategory}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "товар"
              : filteredProducts.length < 5
                ? "товара"
                : "товаров"}
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск по каталогу…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Фильтры</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Фильтры</SheetTitle>
              </SheetHeader>
              <div className="mt-8">
                <ProductCatalogFilters {...filterProps} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {(selectedCategory !== "Все" || searchQuery) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {selectedCategory !== "Все" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
              {selectedCategory}
              <button
                type="button"
                onClick={() => setSelectedCategory("Все")}
                className="ml-1 text-muted-foreground hover:text-foreground"
                aria-label="Сбросить категорию"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm">
              «{searchQuery}»
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="ml-1 text-muted-foreground hover:text-foreground"
                aria-label="Сбросить поиск"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <div className="mt-8 flex gap-12">
        <aside className="hidden w-56 shrink-0 lg:block">
          <ProductCatalogFilters {...filterProps} />
        </aside>

        <div className="flex-1">
          {filteredProducts.length > 0 ? (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg font-medium">Ничего не найдено</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Измените фильтры или запрос поиска
              </p>
              <Button variant="outline" className="mt-4" type="button" onClick={resetFilters}>
                Сбросить всё
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
