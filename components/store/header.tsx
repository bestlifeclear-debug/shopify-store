"use client"

import Link from "next/link"
import { ShoppingBag, Menu, Search } from "lucide-react"
import { useState, useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart-store"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

function cartCountSnapshot() {
  return useCartStore.getState().items.reduce((acc, i) => acc + i.quantity, 0)
}

function subscribeCart(callback: () => void) {
  return useCartStore.subscribe(callback)
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const displayCount = useSyncExternalStore(subscribeCart, cartCountSnapshot, () => 0)

  const navLinks = [
    { href: "/", label: "Главная" },
    { href: "/products", label: "Каталог" },
    { href: "/products?category=Дом", label: "Дом и уют" },
    { href: "/products?category=Техника", label: "Техника" },
    { href: "/track-order", label: "Отследить заказ" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Открыть меню</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px]">
            <SheetHeader>
              <SheetTitle className="text-left">Меню</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 flex flex-col gap-4 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight">FutureNest</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
              <span className="sr-only">Поиск в каталоге</span>
            </Button>
          </Link>
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Корзина</span>
            </Button>
            {displayCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
                {displayCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
