// ─── src/hooks/useAppToast.ts ─────────────────────────────────────────────────

import { useToastContext } from "@/components/feedback/ToastProvider";

export function useAppToast() {
  return useToastContext();
}