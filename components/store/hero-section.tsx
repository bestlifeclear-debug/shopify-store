import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Умный быт, спокойный дизайн
          </span>
          <h1 className="max-w-4xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            FutureNest — дом, где технологии помогают
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Подборка для дома и умного быта: практичные решения, аккуратный дизайн и вещи,
            которые делают повседневность проще.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/products">
              <Button size="lg" className="gap-2 px-8">
                Перейти в каталог
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products?category=Дом">
              <Button variant="outline" size="lg" className="px-8">
                Для дома
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-muted/30 blur-3xl" />
      </div>
    </section>
  )
}
