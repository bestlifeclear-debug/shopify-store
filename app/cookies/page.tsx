export const metadata = {
  title: "Cookies",
  description: "Информация о cookies.",
}

export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Cookies</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          Мы используем cookies и local storage для работы сайта (например, чтобы
          сохранялась корзина и настройки темы).
        </p>
        <p>
          Вы можете отключить cookies в браузере — сайт продолжит работать, но часть
          функций может быть ограничена.
        </p>
      </div>
    </div>
  )
}

