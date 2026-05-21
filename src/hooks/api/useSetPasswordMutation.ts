import { useMutation } from "@tanstack/react-query";

import { setPassword, SetPasswordPayload } from "@/lib/api/auth.api";

export function useSetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: SetPasswordPayload) => setPassword(payload),
  });
}