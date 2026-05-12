"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import { formatPrice } from "@/lib/format-price"
import { FLAT_SHIPPING_RUB, FREE_SHIPPING_THRESHOLD_RUB } from "@/lib/constants"

export function CartPage() {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeFromCart = useCartStore((s) => s.removeFromCart)

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD_RUB ? 0 : FLAT_SHIPPING_RUB
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold">Корзина пуста</h1>
          <p className="mt-2 text-muted-foreground">
            Добавьте товары из каталога — они появятся здесь.
          </p>
          <Link href="/products" className="mt-8">
            <Button className="gap-2">
              В каталог
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Корзина</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {items.length}{" "}
        {items.length === 1 ? "позиция" : items.length < 5 ? "позиции" : "позиций"}
      </p>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4 py-6 sm:gap-6">
                <Link
                  href={`/product/${item.product.id}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary/50 sm:h-32 sm:w-32"
                >
                  <Image
                    src={item.product.images[0] ?? "/placeholder.svg"}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </Link>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link
                        href={`/product/${item.product.id}`}
                        className="font-medium hover:underline"
                      >
                        {item.product.title}
                      </Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.product.category}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center rounded-md border">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 rounded-none rounded-l-md"
                        aria-label="Уменьшить количество"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="flex h-8 w-10 items-center justify-center border-x text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="h-8 w-8 rounded-none rounded-r-md"
                        aria-label="Увеличить количество"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 lg:col-span-5 lg:mt-0">
          <div className="rounded-xl border bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold">Итого</h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Товары</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Доставка</span>
                <span>
                  {shipping === 0
                    ? "Бесплатно"
                    : formatPrice(shipping)}
                </span>
              </div>
              {subtotal < FREE_SHIPPING_THRESHOLD_RUB && (
                <p className="text-xs text-muted-foreground">
                  Бесплатная доставка
                </p>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Всего</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <Link href="/checkout" className="mt-6 block">
              <Button className="w-full gap-2" size="lg">
                Оформить заказ
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="mt-6 text-center">
              <Link
                href="/products"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>

          <div className="mt-6 rounded-xl border p-6">
            <h3 className="text-sm font-semibold">Промокод</h3>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Введите код"
                className="h-9 flex-1 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              <Button variant="outline" size="sm" type="button">
                Применить
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
