import { useMutation } from "@tanstack/react-query";

import { signInUser, SignInPayload } from "@/lib/api/auth.api";

export function useSignInMutation() {
  return useMutation({
    mutationFn: (payload: SignInPayload) => signInUser(payload),
  });
}