 
 import { ToastData } from "@/types/home";

let showToastRef: ((toast: Omit<ToastData, "id">) => void) | null = null;

export function registerToast(fn: typeof showToastRef) {
  showToastRef = fn;
}

export function showGlobalToast(toast: Omit<ToastData, "id">) {
  showToastRef?.(toast);
}