import { useMutation } from "@tanstack/react-query";

import {
  selectRole,
  SelectRolePayload,
} from "@/lib/api/auth.api";

export function useSelectRoleMutation() {
  return useMutation({
    mutationFn: (payload: SelectRolePayload) => selectRole(payload),
  });
}