"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useCartStore } from "@/store/cart-store"
import { formatPrice } from "@/lib/format-price"
import { FLAT_SHIPPING_RUB, FREE_SHIPPING_THRESHOLD_RUB } from "@/lib/constants"
import {
  checkoutFormSchema,
  type CheckoutFormValues,
} from "@/lib/validation/checkout"
import { formatRuPhoneInput } from "@/lib/phone-ru"
import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/types"

const PAYMENT: { id: PaymentMethod; label: string }[] = [
  { id: "yoomoney", label: "ЮMoney (кошелёк или карта)" },
]

export function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const subtotal = useMemo(
    () =>
      items.reduce((s, i) => s + i.product.price * i.quantity, 0),
    [items],
  )

  const shipping = 0
    subtotal >= FREE_SHIPPING_THRESHOLD_RUB ? 0 : FLAT_SHIPPING_RUB
  const grandTotal = subtotal + shipping

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      phoneDisplay: "+7",
      email: "",
      city: "",
      address: "",
      apartment: "",
      postalCode: "",
      comment: "",
      paymentMethod: "yoomoney",
    },
  })

  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  })

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart")
    }
  }, [items.length, router])

  async function onSubmit(data: CheckoutFormValues) {
    setSubmitError(null)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: data.fullName,
            phoneDisplay: data.phoneDisplay,
            email: data.email?.trim() || undefined,
            city: data.city,
            address: data.address,
            apartment: data.apartment.trim(),
            postalCode: data.postalCode.trim(),
            comment: data.comment?.trim() || undefined,
          },
          paymentMethod: data.paymentMethod,
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      })

      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(
          typeof payload.error === "string"
            ? payload.error
            : "Не удалось оформить заказ",
        )
        return
      }

      if (payload.confirmationUrl && typeof payload.confirmationUrl === "string") {
        // Редирект на мост оплаты ЮMoney (форма на yoomoney.ru)
        globalThis.location.assign(payload.confirmationUrl)
        return
      }

      if (payload.orderId && typeof payload.orderId === "string") {
        router.replace(
          `/order-success?orderId=${encodeURIComponent(payload.orderId)}&total=${encodeURIComponent(String(grandTotal))}`,
        )
      } else {
        router.replace(`/order-success?total=${encodeURIComponent(String(grandTotal))}`)
      }
      clearCart()
    } catch {
      setSubmitError("Сетевая ошибка. Попробуйте ещё раз.")
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground">
        Переход в корзину…
      </div>
    )
  }

  const busy = form.formState.isSubmitting

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/cart"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад в корзину
      </Link>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Оформление заказа
      </h1>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <div>
                <h2 className="text-lg font-semibold">Получатель</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>ФИО</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Иванов Иван Иванович"
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
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+7 (999) 123-45-67"
                            inputMode="tel"
                            autoComplete="tel"
                            {...field}
                            onChange={(e) =>
                              field.onChange(formatRuPhoneInput(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-8">
                <h2 className="text-lg font-semibold">Доставка</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Город</FormLabel>
                        <FormControl>
                          <Input placeholder="Москва" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Индекс</FormLabel>
                        <FormControl>
                          <Input placeholder="101000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Адрес доставки</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ул. Примерная, д. 1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apartment"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Квартира / офис</FormLabel>
                        <FormControl>
                          <Input placeholder="кв. 12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-8">
                <h2 className="text-lg font-semibold">Оплата</h2>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid gap-3 sm:grid-cols-2"
                        >
                          {PAYMENT.map((p) => (
                            <label
                              key={p.id}
                              className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors",
                                field.value === p.id
                                  ? "border-foreground bg-secondary/40"
                                  : "hover:bg-secondary/20",
                              )}
                            >
                              <RadioGroupItem value={p.id} id={p.id} />
                              <span>{p.label}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Комментарий к заказу (необязательно)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Позвонить за час до доставки"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {submitError && (
                <p className="text-sm text-destructive">{submitError}</p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy
                  ? "Отправка…"
                  : `Перейти к оплате · ${formatPrice(grandTotal)}`}
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-8 lg:col-span-5 lg:mt-0">
          <div className="sticky top-24 rounded-xl border bg-secondary/30 p-6">
            <h2 className="text-lg font-semibold">Ваш заказ</h2>

            <div className="mt-6 max-h-64 space-y-4 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary/50">
                    <Image
                      src={item.product.images[0] ?? "/placeholder.svg"}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-background">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.product.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.product.category}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 border-t pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Товары</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Доставка</span>
                <span>{shipping === 0 ? "Бесплатно" : formatPrice(shipping)}</span>
              </div>
              {subtotal < FREE_SHIPPING_THRESHOLD_RUB && (
                <p className="text-xs text-muted-foreground">
                  Бесплатная доставка
                </p>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Итого</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
