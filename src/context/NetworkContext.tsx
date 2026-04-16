import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ToastData, ToastType } from "@/types/home";
import { registerToast } from "@/lib/toast";

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
  maxAgeMs = 1000 * 60 * 30
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
    if (cacheKeys.length) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // silently fail
  }
}

// ─── Toast priority helpers ──────────────────────────────────────────────────

const TOAST_PRIORITY: Record<ToastType, number> = {
  "network-offline": 6,
  "network-online": 5,
  error: 4,
  "live-election": 3,
  success: 2,
  info: 1,
};

const MAX_VISIBLE_TOASTS = 3;

function getToastDuration(type: ToastType): number | null {
  switch (type) {
    case "network-offline":
      return null;
    case "network-online":
      return 4000;
    case "error":
      return 5000;
    case "live-election":
      return 6000;
    case "success":
      return 3500;
    case "info":
    default:
      return 4500;
  }
}

function sortToastsByPriority(items: ToastData[]): ToastData[] {
  return [...items].sort((a, b) => {
    const diff = TOAST_PRIORITY[b.type] - TOAST_PRIORITY[a.type];
    if (diff !== 0) return diff;

    const aTs = Number(a.id.split("-")[1] ?? 0);
    const bTs = Number(b.id.split("-")[1] ?? 0);
    return bTs - aTs;
  });
}

// ─── Context ─────────────────────────────────────────────────────────────────

type NetworkContextValue = {
  isConnected: boolean;
  isInternetReachable: boolean;
  showToast: (toast: Omit<ToastData, "id">) => void;
  dismissToast: (id?: string) => void;
  activeToast: ToastData | null;
  activeToasts: ToastData[];
};

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  isInternetReachable: true,
  showToast: () => {},
  dismissToast: () => {},
  activeToast: null,
  activeToasts: [],
});

export function useNetwork() {
  return useContext(NetworkContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────

type Props = { children: ReactNode };

export function NetworkProvider({ children }: Props) {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [toastQueue, setToastQueue] = useState<ToastData[]>([]);

  const wasConnectedRef = useRef(true);
  const toastTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  const dismissToast = useCallback((id?: string) => {
    if (!id) {
      setToastQueue((prev) => {
        if (!prev.length) return prev;

        const first = prev[0];
        const timer = toastTimersRef.current[first.id];
        if (timer) {
          clearTimeout(timer);
          delete toastTimersRef.current[first.id];
        }

        return prev.slice(1);
      });

      return;
    }

    const timer = toastTimersRef.current[id];
    if (timer) {
      clearTimeout(timer);
      delete toastTimersRef.current[id];
    }

    setToastQueue((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastData, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const nextToast: ToastData = {
      ...toast,
      id,
    };

    setToastQueue((prev) => {
      const duplicateIndex = prev.findIndex(
        (item) =>
          item.type === toast.type &&
          item.title === toast.title &&
          item.subtitle === toast.subtitle &&
          item.actionLabel === toast.actionLabel &&
          item.actionRoute === toast.actionRoute
      );

      const merged =
        duplicateIndex >= 0
          ? [
              ...prev.slice(0, duplicateIndex),
              nextToast,
              ...prev.slice(duplicateIndex + 1),
            ]
          : [...prev, nextToast];

      return sortToastsByPriority(merged);
    });
  }, []);

  useEffect(() => {
    registerToast(showToast);
  }, [showToast]);

  useEffect(() => {
    const visibleToasts = toastQueue.slice(0, MAX_VISIBLE_TOASTS);

    visibleToasts.forEach((toast) => {
      const alreadyHasTimer = Boolean(toastTimersRef.current[toast.id]);
      const duration = getToastDuration(toast.type);

      if (!alreadyHasTimer && duration !== null) {
        toastTimersRef.current[toast.id] = setTimeout(() => {
          dismissToast(toast.id);
        }, duration);
      }
    });

    Object.keys(toastTimersRef.current).forEach((toastId) => {
      const stillVisible = visibleToasts.some((toast) => toast.id === toastId);
      if (!stillVisible) {
        clearTimeout(toastTimersRef.current[toastId]);
        delete toastTimersRef.current[toastId];
      }
    });
  }, [toastQueue, dismissToast]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;
      const reachable = state.isInternetReachable ?? connected;

      setIsConnected(connected);
      setIsInternetReachable(reachable);

      if (!wasConnectedRef.current && connected && reachable) {
        showToast({
          type: "network-online",
          title: "You're back online!",
          subtitle: "Syncing latest data...",
        });
      }

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
      Object.values(toastTimersRef.current).forEach(clearTimeout);
      toastTimersRef.current = {};
    };
  }, [showToast]);

  const activeToasts = useMemo(
    () => toastQueue.slice(0, MAX_VISIBLE_TOASTS),
    [toastQueue]
  );

  const activeToast = activeToasts[0] ?? null;

  const value = useMemo(
    () => ({
      isConnected,
      isInternetReachable,
      showToast,
      dismissToast,
      activeToast,
      activeToasts,
    }),
    [
      isConnected,
      isInternetReachable,
      showToast,
      dismissToast,
      activeToast,
      activeToasts,
    ]
  );

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}