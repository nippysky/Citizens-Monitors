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

async function persistQueue(items: QueuedAction[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // best effort
  }
}

/**
 * Replace this with your real backend sync implementation.
 * Important: payload should contain staged file URIs only, not file blobs/base64.
 */
async function syncQueuedAction(item: QueuedAction): Promise<boolean> {
  try {
    // simulate real async work (network call later)
    await new Promise((resolve) => setTimeout(resolve, 300));

    switch (item.type) {
      case "submit-election-report":
      case "submit-incident-report":
      case "submit-incident-feedback":
      case "flag-report":
      case "comment":
      case "opinion":
      case "like":
      case "confirm-report":
        // TODO: plug real API here
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.log("Sync failed:", error);
    return false;
  }
}

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
    []
  );

  useEffect(() => {
    if (!isOnline || syncingRef.current) return;

    const pending = queue.filter((item) => !item.synced);
    if (!pending.length) return;

    syncingRef.current = true;

    const run = async () => {
      let currentQueue = [...queue];

      for (const item of pending) {
        const ok = await syncQueuedAction(item);

        if (!ok) {
          continue;
        }

        currentQueue = currentQueue.map((entry) =>
          entry.id === item.id ? { ...entry, synced: true } : entry
        );

        setQueue(currentQueue);
        await persistQueue(currentQueue);
      }

      syncingRef.current = false;
    };

    void run();
  }, [isOnline, queue]);

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