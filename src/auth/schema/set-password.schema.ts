import { ValidationMessages } from "@/lib/validation/messages";
import { ValidationPatterns } from "@/lib/validation/patterns";
import { z } from "zod";

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, { error: ValidationMessages.passwordRequired })
      .min(8, { error: ValidationMessages.passwordMin })
      .regex(ValidationPatterns.uppercase, {
        error: ValidationMessages.passwordUpper,
      })
      .regex(ValidationPatterns.lowercase, {
        error: ValidationMessages.passwordLower,
      })
      .regex(ValidationPatterns.number, {
        error: ValidationMessages.passwordNumber,
      }),

    confirmPassword: z
      .string()
      .min(1, { error: ValidationMessages.confirmPasswordRequired }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    error: ValidationMessages.passwordsDoNotMatch,
  });

export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;