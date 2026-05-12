import { Suspense } from "react"
import { HeroSection } from "@/components/store/hero-section"
import { FeaturedProducts } from "@/components/store/featured-products"
import { BenefitsSection } from "@/components/store/benefits-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Suspense
        fallback={
          <div className="py-24 text-center text-sm text-muted-foreground">
            Загрузка подборки…
          </div>
        }
      >
        <FeaturedProducts />
      </Suspense>
      <BenefitsSection />
    </>
  )
}
