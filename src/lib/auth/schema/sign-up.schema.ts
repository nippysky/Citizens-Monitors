import { ValidationMessages } from "@/lib/validation/messages";
import { ValidationPatterns } from "@/lib/validation/patterns";
import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, { message: ValidationMessages.emailRequired })
    .email({ message: ValidationMessages.emailInvalid })
    .trim(),

  password: z
    .string()
    .min(1, { message: ValidationMessages.passwordRequired })
    .min(8, { message: ValidationMessages.passwordMin })
    .regex(ValidationPatterns.uppercase, {
      message: ValidationMessages.passwordUpper,
    })
    .regex(ValidationPatterns.lowercase, {
      message: ValidationMessages.passwordLower,
    })
    .regex(ValidationPatterns.number, {
      message: ValidationMessages.passwordNumber,
    }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;