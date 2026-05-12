import { z } from "zod"
import { normalizeRuPhoneE164 } from "@/lib/phone-ru"

export const deliveryMethodSchema = z.enum([
  "cdek",
  "boxberry",
  "russian_post",
  "courier",
])

export const paymentMethodSchema = z.literal("yoomoney")

export const checkoutFormSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Укажите ФИО полностью")
      .max(200, "Слишком длинное значение"),
    phoneDisplay: z.string().min(1, "Укажите телефон"),
    email: z.string().max(200).optional(),
    city: z.string().min(1, "Укажите город"),
    address: z.string().min(5, "Укажите адрес доставки"),
    apartment: z.string().min(1, "Укажите квартиру / офис"),
    postalCode: z.string().min(1, "Укажите индекс"),
    comment: z.string().optional(),
    paymentMethod: paymentMethodSchema,
  })
  .superRefine((data, ctx) => {
    const e164 = normalizeRuPhoneE164(data.phoneDisplay)
    if (!e164) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Введите корректный российский номер",
        path: ["phoneDisplay"],
      })
    }
    const em = data.email?.trim()
    if (em) {
      const ok = z.string().email().safeParse(em).success
      if (!ok) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Некорректный email",
          path: ["email"],
        })
      }
    }
  })

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>
