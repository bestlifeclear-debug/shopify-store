"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import type { Product } from "@/types"
import { formatPrice } from "@/lib/format-price"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addToCart)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const image = product.images[0] ?? "/placeholder.svg"

  return (
    <Link href={`/product/${product.id}`} className="group">
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary/50">
        <Image
          src={image}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground px-2.5 py-1 text-xs font-medium text-background">
            {product.badge}
          </span>
        )}
        <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button onClick={handleAddToCart} className="w-full gap-2" size="sm">
            <ShoppingBag className="h-4 w-4" />
            В корзину
          </Button>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-medium text-foreground/90 transition-colors group-hover:text-foreground">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
          {product.originalPrice != null && product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
