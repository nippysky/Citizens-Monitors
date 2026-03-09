import { ValidationMessages } from "@/lib/validation/messages";
import { ValidationPatterns } from "@/lib/validation/patterns";
import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .email({ error: ValidationMessages.emailInvalid })
    .min(1, { error: ValidationMessages.emailRequired })
    .trim(),

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
});

export type SignInFormValues = z.infer<typeof signInSchema>;