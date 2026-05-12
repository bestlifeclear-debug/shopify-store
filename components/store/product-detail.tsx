"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingBag, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import type { Product } from "@/types"
import { ProductCard } from "./product-card"
import { formatPrice } from "@/lib/format-price"
import { Star, UserRound } from "lucide-react"

interface ProductDetailProps {
  product: Product
  relatedProducts: Product[]
}

type Review = {
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  text: string
  date: string
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Рейтинг: ${rating} из 5`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const filled = idx < Math.round(rating)
        return (
          <Star
            key={idx}
            className={
              filled
                ? "h-4 w-4 fill-foreground text-foreground"
                : "h-4 w-4 text-muted-foreground"
            }
          />
        )
      })}
    </div>
  )
}

export function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const addToCart = useCartStore((s) => s.addToCart)

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const mainImage = product.images[selectedImage] ?? "/placeholder.svg"

  const reviews: Review[] = [
    {
      name: "Алина",
      rating: 5,
      date: "апр 2026",
      text: "Качество отличное, выглядит аккуратно и вживую даже лучше. В интерьер вписалось идеально, доставка быстрая.",
    },
    {
      name: "Игорь",
      rating: 4,
      date: "мар 2026",
      text: "Добротная вещь. Описание соответствует, упаковка надёжная. Снял звезду только за то, что хотелось бы больше вариантов цвета.",
    },
    {
      name: "Мария",
      rating: 5,
      date: "фев 2026",
      text: "Очень приятные материалы и продуманные детали. Беру тут уже второй раз — всё без сюрпризов.",
    },
    {
      name: "Денис",
      rating: 4,
      date: "янв 2026",
      text: "Понравилось. Собрано хорошо, пользоваться удобно. Для умного быта — то, что надо.",
    },
  ]

  const avgRating =
    Math.round(
      (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) * 10,
    ) / 10

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary/50">
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background">
                {product.badge}
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-20 overflow-hidden rounded-md transition-all ${
                    selectedImage === index
                      ? "ring-2 ring-foreground ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} — фото ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 lg:mt-0">
          <div className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {product.category}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
              {product.originalPrice != null &&
                product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                      Выгода {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <h3 className="text-sm font-semibold">Описание</h3>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          </div>

          <div className="mt-8 border-t pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center">
                <span className="mr-4 text-sm font-medium">Количество</span>
                <div className="flex items-center rounded-md border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-none rounded-l-md"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="flex h-10 w-12 items-center justify-center border-x text-sm font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-10 w-10 rounded-none rounded-r-md"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 gap-2 sm:flex-none sm:px-12"
              >
                {addedToCart ? (
                  <>
                    <Check className="h-4 w-4" />
                    В корзине
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    В корзину
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Check className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Доставка</p>
                  <p className="text-sm text-muted-foreground">
                    Бесплатная доставка
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">Отзывы</h3>
                <div className="mt-2 flex items-center gap-3">
                  <StarRow rating={avgRating} />
                  <span className="text-sm text-muted-foreground">
                    {avgRating} · {reviews.length} {reviews.length === 1 ? "отзыв" : "отзыва"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {reviews.map((r, idx) => (
                <div key={`${r.name}-${idx}`} className="rounded-lg border bg-secondary/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                        <UserRound className="h-4 w-4 text-foreground/80" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.date}</p>
                      </div>
                    </div>
                    <StarRow rating={r.rating} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t pt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Вам также может понравиться</h2>
          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
