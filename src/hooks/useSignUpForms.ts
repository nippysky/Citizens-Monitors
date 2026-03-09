import { SignUpFormValues, signUpSchema } from "@/auth/schema/sign-up.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";


export function useSignUpForm() {
  return useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
    },
  });
}