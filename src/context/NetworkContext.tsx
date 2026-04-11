import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { ToastData} from "@/types/home";

// ─── Cache helpers ───────────────────────────────────────────────────────────

const CACHE_PREFIX = "@cm_cache_";

export async function cacheSet(key: string, data: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ data, ts: Date.now() })
    );
  } catch {
    // silently fail — cache is best-effort
  }
}

export async function cacheGet<T>(
  key: string,
  maxAgeMs = 1000 * 60 * 30 // 30 min default
): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: T; ts: number };
    if (Date.now() - parsed.ts > maxAgeMs) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export async function cacheClear(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
  } catch {
    // silently fail
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

type NetworkContextValue = {
  isConnected: boolean;
  isInternetReachable: boolean;
  /** Show a toast notification from anywhere */
  showToast: (toast: Omit<ToastData, "id">) => void;
  /** Dismiss current toast */
  dismissToast: () => void;
  /** Currently visible toast (null = hidden) */
  activeToast: ToastData | null;
};

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  isInternetReachable: true,
  showToast: () => {},
  dismissToast: () => {},
  activeToast: null,
});

export function useNetwork() {
  return useContext(NetworkContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────

type Props = { children: ReactNode };

export function NetworkProvider({ children }: Props) {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);

  const wasConnectedRef = useRef(true);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Show / dismiss toast ──

  const dismissToast = useCallback(() => {
    setActiveToast(null);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastData, "id">) => {
      // clear any pending auto-dismiss
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

      const id = `toast-${Date.now()}`;
      setActiveToast({ ...toast, id });

      // auto-dismiss after 5s for non-offline toasts
      if (toast.type !== "network-offline") {
        toastTimerRef.current = setTimeout(() => {
          dismissToast();
        }, 5000);
      }
    },
    [dismissToast]
  );

  // ── Network monitoring ──

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;
      const reachable = state.isInternetReachable ?? connected;

      setIsConnected(connected);
      setIsInternetReachable(reachable);

      // Was offline, now back online
      if (!wasConnectedRef.current && connected && reachable) {
        showToast({
          type: "network-online",
          title: "You're back online!",
          subtitle: "Syncing latest data...",
        });
      }

      // Was online, now offline
      if (wasConnectedRef.current && !connected) {
        showToast({
          type: "network-offline",
          title: "No internet connection",
          subtitle: "Don't worry — you can still browse cached data.",
        });
      }

      wasConnectedRef.current = connected;
    });

    return () => {
      unsubscribe();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [showToast]);

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        showToast,
        dismissToast,
        activeToast,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}