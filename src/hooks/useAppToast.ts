import { useToastContext } from "@/components/feedback/ToastProvider";

export function useAppToast() {
  return useToastContext();
}