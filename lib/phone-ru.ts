/** Оставляет только цифры, нормализует к 10 цифрам после 7/8 */
export function digitsOnly(input: string): string {
  return input.replace(/\D/g, "")
}

/** +7 (999) 123-45-67 */
export function formatRuPhoneInput(raw: string): string {
  let d = digitsOnly(raw)
  if (d.startsWith("8")) d = "7" + d.slice(1)
  if (d.startsWith("9") && d.length <= 10) d = "7" + d
  d = d.replace(/^\+?/, "")
  if (d.startsWith("7")) d = d.slice(1)
  d = d.slice(0, 10)

  const p1 = d.slice(0, 3)
  const p2 = d.slice(3, 6)
  const p3 = d.slice(6, 8)
  const p4 = d.slice(8, 10)

  let out = "+7"
  if (p1.length) out += ` (${p1}`
  if (p1.length === 3) out += ")"
  if (p2.length) out += ` ${p2}`
  if (p3.length) out += `-${p3}`
  if (p4.length) out += `-${p4}`
  return out
}

/** E.164 +7XXXXXXXXXX для API */
export function normalizeRuPhoneE164(formatted: string): string | null {
  let d = digitsOnly(formatted)
  if (d.startsWith("8")) d = "7" + d.slice(1)
  if (d.length === 10 && d.startsWith("9")) d = "7" + d
  if (d.length === 11 && d.startsWith("7")) {
    return `+${d}`
  }
  return null
}
