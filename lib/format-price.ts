const rubFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
})

/** Форматирует целое число рублей как «12 490 ₽» */
export function formatPrice(amountRub: number): string {
  return rubFormatter.format(Math.round(amountRub))
}
