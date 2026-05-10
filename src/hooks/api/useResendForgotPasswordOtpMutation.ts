import { useMutation } from "@tanstack/react-query";

import {
  resendForgotPasswordOtp,
  ResendForgotPasswordOtpPayload,
} from "@/lib/api/auth.api";

export function useResendForgotPasswordOtpMutation() {
  return useMutation({
    mutationFn: (payload: ResendForgotPasswordOtpPayload) =>
      resendForgotPasswordOtp(payload),
  });
}