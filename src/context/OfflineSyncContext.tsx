// ─── src/context/OfflineSyncContext.tsx ───────────────────────────────────────
// Offline-first queue: actions are stored locally and auto-synced when online.
// Expanded to support report submission flows app-wide.
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

export type QueuedActionType =
  | "flag-report"
  | "comment"
  | "opinion"
  | "like"
  | "confirm-report"
  | "submit-election-report"
  | "submit-incident-report"
  | "submit-incident-feedback";

export type QueuedAction = {
  id: string;
  type: QueuedActionType;
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

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw) as QueuedAction[];
        setQueue(parsed.filter((item) => !item.synced));
      } catch {
        // ignore corrupted queue
      }
    });
  }, []);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected && !!state.isInternetReachable);
    });

    return unsub;
  }, []);

  const persistQueue = useCallback(async (items: QueuedAction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // best effort
    }
  }, []);

  const enqueue = useCallback(
    (action: Omit<QueuedAction, "id" | "createdAt" | "synced">) => {
      const item: QueuedAction = {
        ...action,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        synced: false,
      };

      queueMicrotask(() => {
        setQueue((prev) => {
          const next = [...prev, item];
          void persistQueue(next);
          return next;
        });
      });
    },
    [persistQueue]
  );

  useEffect(() => {
    if (!isOnline || syncingRef.current) return;

    const pending = queue.filter((item) => !item.synced);
    if (!pending.length) return;

    syncingRef.current = true;

    const timer = setTimeout(() => {
      setQueue((prev) => {
        const next = prev.map((item) => ({ ...item, synced: true }));
        const cleaned = next.slice(-100);
        void persistQueue(cleaned);
        return cleaned;
      });

      syncingRef.current = false;
    }, 1500);

    return () => clearTimeout(timer);
  }, [isOnline, queue, persistQueue]);

  const pendingCount = useMemo(
    () => queue.filter((item) => !item.synced).length,
    [queue]
  );

  const value = useMemo(
    () => ({
      queue,
      enqueue,
      isOnline,
      pendingCount,
    }),
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

  if (!ctx) {
    throw new Error("useOfflineSync must be used within OfflineSyncProvider");
  }

  return ctx;
}