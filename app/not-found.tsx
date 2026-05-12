import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Страница не найдена</h1>
      <p className="mt-2 text-muted-foreground">
        Проверьте адрес или вернитесь в каталог.
      </p>
      <Button asChild className="mt-8">
        <Link href="/products">В каталог</Link>
      </Button>
    </div>
  )
}
