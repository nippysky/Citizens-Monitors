// ─── src/context/OfflineSyncContext.tsx ───────────────────────────────────────
// Offline-first queue: actions are stored locally and auto-synced when online.
// Fixed: enqueue uses queueMicrotask to avoid "setState during render" errors.
// ─────────────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type QueuedAction = {
  id: string;
  type: "flag-report" | "comment" | "opinion" | "like" | "confirm-report";
  payload: Record<string, unknown>;
  createdAt: number;
  synced: boolean;
};

type OfflineSyncContextValue = {
  queue: QueuedAction[];
  enqueue: (
    action: Omit<QueuedAction, "id" | "createdAt" | "synced">
  ) => void;
  isOnline: boolean;
  pendingCount: number;
};

const STORAGE_KEY = "@citizen_monitors/offline_queue";
const OfflineSyncContext = createContext<OfflineSyncContextValue | null>(null);

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const syncingRef = useRef(false);

  // ── Load persisted queue on mount ──
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as QueuedAction[];
          setQueue(parsed.filter((a) => !a.synced));
        } catch {
          // corrupted data — ignore
        }
      }
    });
  }, []);

  // ── Monitor connectivity ──
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected && !!state.isInternetReachable);
    });
    return unsub;
  }, []);

  // ── Persist queue helper ──
  const persistQueue = useCallback(async (items: QueuedAction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage error — queue stays in memory
    }
  }, []);

  // ── Enqueue (safe to call from anywhere, including state updaters) ──
  const enqueue = useCallback(
    (action: Omit<QueuedAction, "id" | "createdAt" | "synced">) => {
      const item: QueuedAction = {
        ...action,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        synced: false,
      };

      // Defer the state update to the next microtask so it never
      // runs inside another component's render or state updater.
      queueMicrotask(() => {
        setQueue((prev) => {
          const next = [...prev, item];
          persistQueue(next);
          return next;
        });
      });
    },
    [persistQueue]
  );

  // ── Auto-sync when online ──
  useEffect(() => {
    if (!isOnline || syncingRef.current) return;

    const pending = queue.filter((a) => !a.synced);
    if (!pending.length) return;

    syncingRef.current = true;

    // In production: replace with actual API calls per action type.
    const timer = setTimeout(() => {
      setQueue((prev) => {
        const next = prev.map((a) => ({ ...a, synced: true }));
        const cleaned = next.slice(-50);
        persistQueue(cleaned);
        return cleaned;
      });
      syncingRef.current = false;
    }, 1200);

    return () => clearTimeout(timer);
  }, [isOnline, queue, persistQueue]);

  const pendingCount = useMemo(
    () => queue.filter((a) => !a.synced).length,
    [queue]
  );

  const value = useMemo(
    () => ({ queue, enqueue, isOnline, pendingCount }),
    [queue, enqueue, isOnline, pendingCount]
  );

  return (
    <OfflineSyncContext.Provider value={value}>
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const ctx = useContext(OfflineSyncContext);
  if (!ctx)
    throw new Error("useOfflineSync must be used within OfflineSyncProvider");
  return ctx;
}