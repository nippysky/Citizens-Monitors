import { SetPasswordFormValues, setPasswordSchema } from "@/lib/auth/schema/set-password.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";


export function useSetPasswordForm() {
  return useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
}