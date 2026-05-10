import { useMutation } from "@tanstack/react-query";

import { resetPassword, ResetPasswordPayload } from "@/lib/api/auth.api";

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) => resetPassword(payload),
  });
}