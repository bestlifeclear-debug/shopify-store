import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = { searchParams: Promise<{ order_id?: string }> }

export const metadata = {
  title: "Оплата | FutureNest",
  description: "Статус оплаты заказа.",
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order_id: orderId } = await searchParams

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Оплата принята</h1>
        <p className="mt-2 text-muted-foreground">
          Заказ зарегистрирован. Статус обновится после подтверждения банка (обычно
          несколько минут).
        </p>
        {orderId && (
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            Номер: {orderId}
          </p>
        )}
        <Link href="/products" className="mt-8">
          <Button>В каталог</Button>
        </Link>
      </div>
    </div>
  )
}
