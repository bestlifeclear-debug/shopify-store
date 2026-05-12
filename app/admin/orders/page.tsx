import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { tryCreateSupabaseServiceClient } from "@/lib/supabase"
import { formatPrice } from "@/lib/format-price"
import type { Database } from "@/lib/database.types"

type OrderSummary = Pick<
  Database["public"]["Tables"]["orders"]["Row"],
  "id" | "customer_name" | "phone" | "total" | "status" | "created_at"
>

type Search = { secret?: string }

const STATUS_RU: Record<string, string> = {
  pending: "Новый",
  pending_payment: "Ожидает оплату",
  paid: "Оплачен",
  shipped: "Отправлен",
  completed: "Завершён",
  cancelled: "Отменён",
}

export const metadata = {
  title: "Заказы | Админ",
  robots: { index: false, follow: false },
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const { secret } = await searchParams
  const adminSecret = process.env.ADMIN_DASHBOARD_SECRET?.trim()
  const provided = typeof secret === "string" ? secret.trim() : ""

  if (!adminSecret || provided !== adminSecret) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground">Доступ ограничен.</p>
        <p className="mt-4 text-sm text-muted-foreground">
          Откройте страницу с параметром <code className="rounded bg-secondary px-1">?secret=…</code>{" "}
          (значение <code className="rounded bg-secondary px-1">ADMIN_DASHBOARD_SECRET</code>).
        </p>
        <Link href="/" className="mt-8 inline-block text-sm underline">
          На главную
        </Link>
      </div>
    )
  }

  const svc = tryCreateSupabaseServiceClient()
  if (!svc) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-muted-foreground">
        Задайте <code className="rounded bg-secondary px-1">SUPABASE_SERVICE_ROLE_KEY</code> для
        чтения заказов.
      </div>
    )
  }

  const { data: ordersRaw, error } = await svc
    .from("orders")
    .select("id, customer_name, phone, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200)

  const orders = ordersRaw as OrderSummary[] | null

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-destructive">
        Ошибка загрузки: {error.message}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Заказы</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Последние 200 заказов (только для администратора).
      </p>

      <div className="mt-8 rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Номер</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(orders ?? []).map((o) => {
              const total =
                typeof o.total === "string" ? Number.parseFloat(o.total) : o.total
              const date = new Date(o.created_at).toLocaleString("ru-RU")
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}…</TableCell>
                  <TableCell>{o.customer_name}</TableCell>
                  <TableCell>{o.phone}</TableCell>
                  <TableCell className="text-right">{formatPrice(total)}</TableCell>
                  <TableCell>{STATUS_RU[o.status] ?? o.status}</TableCell>
                  <TableCell className="text-muted-foreground">{date}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {(orders ?? []).length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">Заказов пока нет.</p>
        )}
      </div>
    </div>
  )
}
