import { SignInFormValues, signInSchema } from "@/auth/schema/sign-in.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";



export function useSignInForm() {
  return useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });
}