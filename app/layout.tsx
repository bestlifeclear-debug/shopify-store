import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/store/header"
import { Footer } from "@/components/store/footer"
import { ClientAnalytics } from "@/components/client-analytics"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
})

const siteName = "FutureNest"
const description =
  "Товары для дома и умного быта. Практичные решения, аккуратный дизайн и технологии, которые помогают."

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: `${siteName} — магазин для дома и умного быта`,
    template: `%s | ${siteName}`,
  },
  description,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName,
    title: `${siteName} — магазин для дома и умного быта`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <ClientAnalytics />
      </body>
    </html>
  )
}
