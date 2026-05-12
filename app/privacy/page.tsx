export const metadata = {
  title: "Конфиденциальность",
  description: "Как мы используем ваши данные.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Конфиденциальность</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Мы используем данные только для оформления и выполнения заказа: ФИО, телефон,
          адрес, индекс и состав корзины.
        </p>
        <p>
          Мы не продаём персональные данные. Доступ к ним нужен только для связи по
          заказу и передачи информации для отправки.
        </p>
        <p>
          Если хотите удалить данные — напишите нам и укажите номер заказа и телефон.
        </p>
      </div>
    </div>
  )
}

