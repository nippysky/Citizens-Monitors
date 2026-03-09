import { ValidationMessages } from "@/lib/validation/messages";
import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, { message: ValidationMessages.emailRequired })
    .email({ message: ValidationMessages.emailInvalid })
    .trim(),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;