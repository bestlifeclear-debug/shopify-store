export const metadata = {
  title: "Условия",
  description: "Коротко о том, как мы работаем.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Условия</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          FutureNest — магазин по модели дропшипинга. Вы оформляете заказ и оплачиваете
          его у нас, после чего мы передаём заказ в обработку и отправку.
        </p>
        <p>
          Сроки и способ доставки зависят от товара и региона. Статус заказа можно
          проверить на странице «Отследить заказ».
        </p>
        <p>
          Если нужен вопрос по заказу — напишите в контакты. Укажите номер заказа и
          телефон.
        </p>
      </div>
    </div>
  )
}

