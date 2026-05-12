import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/format-price"
import { tryCreateSupabaseServiceClient } from "@/lib/supabase"

type Props = {
  searchParams: Promise<{ orderId?: string; total?: string }>
}

export const metadata = {
  title: "Спасибо за заказ",
  description: "Заказ оформлен. Сохраните номер заказа для отслеживания.",
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { orderId, total } = await searchParams

  let totalRub: number | null = null
  if (typeof total === "string" && total.trim()) {
    const n = Number(total)
    if (Number.isFinite(n)) totalRub = n
  }

  // Если доступен service role key — подтянем сумму из БД (не требуем телефон на success-странице).
  if (orderId && totalRub == null) {
    const svc = tryCreateSupabaseServiceClient()
    if (svc) {
      const { data } = await svc
        .from("orders")
        .select("total")
        .eq("id", orderId)
        .maybeSingle()
      const raw = (data as { total?: number | string } | null)?.total
      const n = typeof raw === "string" ? Number(raw) : raw
      if (typeof n === "number" && Number.isFinite(n)) totalRub = n
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">Спасибо за заказ</h1>
        <p className="mt-2 text-muted-foreground">
          Заказ оформлен. Сохраните номер — он нужен для отслеживания.
        </p>

        <div className="mt-6 w-full rounded-2xl border bg-secondary/20 p-6 text-left">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Номер заказа</p>
              <p className="mt-1 font-mono text-sm">{orderId ?? "—"}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-sm text-muted-foreground">Итоговая сумма</p>
              <p className="mt-1 text-sm font-semibold">
                {totalRub != null ? formatPrice(totalRub) : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={
              orderId ? `/track-order?orderId=${encodeURIComponent(orderId)}` : "/track-order"
            }
            className="w-full sm:w-auto"
          >
            <Button size="lg" className="w-full gap-2 sm:w-auto">
              Отследить заказ
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/products" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              В каталог
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

