import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">FutureNest</h3>
            <p className="text-sm text-muted-foreground">
              Товары для дома и умного быта. Минимализм, удобство и технологии, которые работают.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Каталог</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="transition-colors hover:text-foreground">
                  Все товары
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=Дом"
                  className="transition-colors hover:text-foreground"
                >
                  Дом и уют
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=Техника"
                  className="transition-colors hover:text-foreground"
                >
                  Техника
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=Аксессуары"
                  className="transition-colors hover:text-foreground"
                >
                  Аксессуары
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Компания</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/track-order"
                  className="transition-colors hover:text-foreground"
                >
                  Отследить заказ
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-foreground">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="transition-colors hover:text-foreground">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FutureNest. Все права защищены.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                Конфиденциальность
              </Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Условия
              </Link>
              <Link href="/cookies" className="transition-colors hover:text-foreground">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
