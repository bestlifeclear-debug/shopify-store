export const metadata = {
  title: "Контакты",
  description: "Свяжитесь с нами по заказу.",
}

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Контакты</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Пишите по вопросам заказа. В сообщении укажите номер заказа и телефон — так
          мы быстрее найдём информацию.
        </p>
        <div className="rounded-xl border bg-secondary/20 p-4">
          <p className="text-sm font-medium text-foreground">Email</p>
          <p className="mt-1">support@futurenest.shop</p>
          <p className="mt-3 text-sm font-medium text-foreground">Время</p>
          <p className="mt-1">Ежедневно 10:00–20:00 (МСК)</p>
        </div>
      </div>
    </div>
  )
}

