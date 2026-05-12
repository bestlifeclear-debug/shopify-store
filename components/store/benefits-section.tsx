import { Truck, Shield, Award, Headphones } from "lucide-react"

const benefits = [
  {
    icon: Truck,
    title: "Доставка по России",
    description: "Бесплатная доставка — бережно упакуем и привезём вовремя",
  },
  {
    icon: Shield,
    title: "Безопасная оплата",
    description: "ЮMoney / ЮKassa — надёжная оплата и защита данных",
  },
  {
    icon: Award,
    title: "Курируем качество",
    description: "Подбираем товары для дома и умного быта с понятными характеристиками",
  },
  {
    icon: Headphones,
    title: "Поддержка",
    description: "Поможем подобрать решение под ваш сценарий использования",
  },
]

export function BenefitsSection() {
  return (
    <section className="border-y bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                <benefit.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
