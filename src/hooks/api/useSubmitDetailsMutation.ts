import { useMutation } from "@tanstack/react-query";

import {
  submitDetails,
  SubmitDetailsPayload,
} from "@/lib/api/auth.api";

export function useSubmitDetailsMutation() {
  return useMutation({
    mutationFn: (payload: SubmitDetailsPayload) => submitDetails(payload),
  });
}