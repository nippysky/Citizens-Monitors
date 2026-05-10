import { useMutation } from "@tanstack/react-query";

import { registerUser, RegisterPayload } from "@/lib/api/auth.api";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
  });
}