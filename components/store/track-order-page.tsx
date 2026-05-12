"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Search, PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchParams } from "next/navigation"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { formatRuPhoneInput, normalizeRuPhoneE164 } from "@/lib/phone-ru"
import { formatPrice } from "@/lib/format-price"
import { OrderStatusSteps, statusLabel, type TrackOrderStatus } from "@/components/store/order-status-steps"

const formSchema = z
  .object({
    orderId: z.string().uuid("Введите корректный номер заказа (UUID)"),
    phoneDisplay: z.string().min(1, "Укажите номер телефона"),
  })
  .superRefine((data, ctx) => {
    if (!normalizeRuPhoneE164(data.phoneDisplay)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Введите корректный российский номер",
        path: ["phoneDisplay"],
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

type TrackResult =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "not_found" }
  | {
      state: "found"
      order: { id: string; createdAt: string; status: TrackOrderStatus; total: number | string }
      items: { title: string; quantity: number; price: number | string }[]
    }
  | { state: "error"; message: string }

function formatOrderDate(iso: string): string {
  const d = new Date(iso)
  return new Intl.DateTimeFormat("ru-RU", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(d)
}

export function TrackOrderPage() {
  const [result, setResult] = useState<TrackResult>({ state: "idle" })
  const searchParams = useSearchParams()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { orderId: "", phoneDisplay: "+7" },
  })

  useEffect(() => {
    const fromUrl = searchParams.get("orderId")
    if (fromUrl) {
      form.setValue("orderId", fromUrl, { shouldDirty: false })
    }
  }, [form, searchParams])

  const busy = form.formState.isSubmitting || result.state === "loading"

  async function onSubmit(values: FormValues) {
    setResult({ state: "loading" })
    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const payload = (await res.json().catch(() => ({}))) as any
      if (!res.ok) {
        const msg = typeof payload.error === "string" ? payload.error : "Не удалось найти заказ"
        if (res.status === 404 || msg.toLowerCase().includes("не найден")) {
          setResult({ state: "not_found" })
          return
        }
        setResult({ state: "error", message: msg })
        return
      }

      setResult({
        state: "found",
        order: payload.order,
        items: Array.isArray(payload.items) ? payload.items : [],
      })
    } catch {
      setResult({ state: "error", message: "Сетевая ошибка. Попробуйте ещё раз." })
    }
  }

  const found = result.state === "found" ? result : null

  const totalQty = useMemo(() => {
    if (!found) return 0
    return found.items.reduce((acc, i) => acc + (typeof i.quantity === "number" ? i.quantity : 0), 0)
  }, [found])

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Отслеживание заказа
          </h1>
          <p className="mt-2 text-muted-foreground">
            Введите номер заказа и телефон — покажем актуальный статус из FutureNest.
          </p>
        </div>
        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/40">
          <PackageSearch className="h-6 w-6 text-foreground/80" />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="rounded-2xl border bg-secondary/20 p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="orderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Номер заказа</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Например: 2d7f... (UUID)"
                          autoComplete="off"
                          spellCheck={false}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneDisplay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Номер телефона</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+7 (999) 123-45-67"
                          inputMode="tel"
                          autoComplete="tel"
                          {...field}
                          onChange={(e) => field.onChange(formatRuPhoneInput(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full gap-2" disabled={busy}>
                  <Search className="h-4 w-4" />
                  {busy ? "Поиск…" : "Найти заказ"}
                </Button>
              </form>
            </Form>

            {result.state === "not_found" && (
              <div className="mt-6 rounded-xl border bg-background p-4">
                <p className="text-sm font-medium">Заказ не найден</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Проверьте номер заказа и телефон. Если не получается — попробуйте ещё раз чуть позже.
                </p>
              </div>
            )}

            {result.state === "error" && (
              <div className="mt-6 rounded-xl border bg-destructive/5 p-4 text-destructive">
                <p className="text-sm font-medium">{result.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          {found ? (
            <div className="space-y-6">
              <div className="rounded-2xl border bg-background p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Номер заказа</p>
                    <p className="mt-1 font-mono text-sm">{found.order.id}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-sm text-muted-foreground">Дата</p>
                    <p className="mt-1 text-sm font-medium">{formatOrderDate(found.order.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <OrderStatusSteps status={found.order.status} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border bg-secondary/20 p-4">
                    <p className="text-sm text-muted-foreground">Статус</p>
                    <p className="mt-1 text-sm font-semibold">{statusLabel(found.order.status)}</p>
                  </div>
                  <div className="rounded-xl border bg-secondary/20 p-4">
                    <p className="text-sm text-muted-foreground">Итого</p>
                    <p className="mt-1 text-sm font-semibold">{formatPrice(Number(found.order.total))}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Состав заказа</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {totalQty} {totalQty === 1 ? "товар" : totalQty < 5 ? "товара" : "товаров"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 divide-y">
                  {found.items.map((i, idx) => (
                    <div key={`${i.title}-${idx}`} className="flex items-start justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{i.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Кол-во: {i.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {formatPrice(Number(i.price) * i.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:block rounded-2xl border bg-secondary/20 p-8">
              <p className="text-sm font-medium">Введите данные, чтобы увидеть заказ</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Мы покажем список товаров, сумму и текущий статус.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

