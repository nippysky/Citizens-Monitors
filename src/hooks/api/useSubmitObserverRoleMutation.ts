import { useMutation } from "@tanstack/react-query";

import {
  submitObserverRole,
  SubmitObserverRolePayload,
} from "@/lib/api/auth.api";

export function useSubmitObserverRoleMutation() {
  return useMutation({
    mutationFn: (payload: SubmitObserverRolePayload) =>
      submitObserverRole(payload),
  });
}