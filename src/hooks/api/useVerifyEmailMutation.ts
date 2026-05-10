import { useMutation } from "@tanstack/react-query";

import {
  verifyEmail,
  VerifyEmailPayload,
} from "@/lib/api/auth.api";

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) => verifyEmail(payload),
  });
}