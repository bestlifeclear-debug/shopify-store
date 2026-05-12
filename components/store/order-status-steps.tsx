"use client"

import { Check, Circle, Truck, Package, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type TrackOrderStatus =
  | "pending"
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | string

type Step = {
  id: "pending" | "paid" | "processing" | "shipped" | "completed"
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const STEPS: Step[] = [
  { id: "pending", label: "Ожидает оплаты", icon: Circle },
  { id: "paid", label: "Оплачен", icon: Check },
  { id: "processing", label: "В обработке", icon: Package },
  { id: "shipped", label: "Отправлен", icon: Truck },
  { id: "completed", label: "Завершён", icon: Check },
]

export function statusLabel(status: TrackOrderStatus): string {
  switch (status) {
    case "pending":
    case "pending_payment":
      return "Ожидает оплаты"
    case "paid":
      return "Оплачен"
    case "processing":
      return "В обработке"
    case "shipped":
      return "Отправлен"
    case "completed":
      return "Завершён"
    case "cancelled":
      return "Отменён"
    default:
      return "Статус уточняется"
  }
}

function statusToStepId(status: TrackOrderStatus): Step["id"] | null {
  switch (status) {
    case "pending":
    case "pending_payment":
      return "pending"
    case "paid":
      return "paid"
    case "processing":
      return "processing"
    case "shipped":
      return "shipped"
    case "completed":
      return "completed"
    default:
      return null
  }
}

export function OrderStatusSteps({
  status,
}: {
  status: TrackOrderStatus
}) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-destructive/5 p-4 text-destructive">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10">
          <X className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Заказ отменён</p>
          <p className="text-sm text-destructive/80">
            Если это неожиданно — свяжитесь с поддержкой.
          </p>
        </div>
      </div>
    )
  }

  const current = statusToStepId(status)
  const currentIndex = current ? STEPS.findIndex((s) => s.id === current) : 0

  return (
    <div className="rounded-xl border bg-secondary/20 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">Статус</p>
          <p className="mt-1 text-sm text-muted-foreground">{statusLabel(status)}</p>
        </div>
      </div>

      {/* Desktop */}
      <ol className="mt-6 hidden grid-cols-5 gap-3 sm:grid">
        {STEPS.map((step, idx) => {
          const done = idx < currentIndex
          const active = idx === currentIndex
          const Icon = step.icon
          return (
            <li key={step.id} className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border",
                  done && "bg-foreground text-background",
                  active && "border-foreground bg-background",
                  !done && !active && "bg-background text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p
                className={cn(
                  "mt-2 text-xs font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mt-3 h-0.5 w-full rounded-full",
                    done ? "bg-foreground" : "bg-border",
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile timeline */}
      <ol className="mt-6 space-y-4 sm:hidden">
        {STEPS.map((step, idx) => {
          const done = idx < currentIndex
          const active = idx === currentIndex
          const Icon = step.icon
          return (
            <li key={step.id} className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                  done && "bg-foreground text-background",
                  active && "border-foreground bg-background",
                  !done && !active && "bg-background text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </p>
                {active && <p className="mt-1 text-sm text-muted-foreground">Текущий этап</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

