import { useMutation } from "@tanstack/react-query";

import {
  resendVerificationToken,
  ResendVerificationTokenPayload,
} from "@/lib/api/auth.api";

export function useResendVerificationTokenMutation() {
  return useMutation({
    mutationFn: (payload: ResendVerificationTokenPayload) =>
      resendVerificationToken(payload),
  });
}