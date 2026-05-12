import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Отсутствует переменная окружения: ${name}`)
  }
  return value
}

/** Публичный клиент для браузера и Route Handlers с anon key */
export function createSupabaseClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const key = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  return createClient(url, key)
}

/**
 * Клиент с service role для webhook и админских операций на сервере.
 * Не вызывать из браузера.
 */
export function createSupabaseServiceClient(): SupabaseClient {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL")
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!key) {
    throw new Error("Для этой операции нужен SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient(url, key)
}

/** Безопасно: null если переменные не заданы (локальная вёрстка без БД) */
export function tryCreateSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export function tryCreateSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) return null
  return createClient(url, key)
}

/** Для сообщений об ошибках: что именно не задано в окружении. */
export function supabaseServiceEnvHint(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url && !key) {
    return "не заданы NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY"
  }
  if (!url) return "не задан NEXT_PUBLIC_SUPABASE_URL"
  if (!key) return "не задан SUPABASE_SERVICE_ROLE_KEY (или пустая строка после =)"
  return ""
}
