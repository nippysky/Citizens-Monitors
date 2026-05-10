import { useMutation } from "@tanstack/react-query";

import { forgotPassword, ForgotPasswordPayload } from "@/lib/api/auth.api";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPassword(payload),
  });
}