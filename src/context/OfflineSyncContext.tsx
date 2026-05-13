import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
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

import { pulseQueryKeys } from "@/hooks/api/usePulseQueries";
import {
  createPulseComment,
  createPulsePost,
  likePulseComment,
  likePulsePost,
  PulseVisibilityScope,
} from "@/lib/api/pulse.api";

export type QueuedActionType =
  | "flag-report"
  | "comment"
  | "opinion"
  | "like"
  | "confirm-report"
  | "submit-election-report"
  | "submit-incident-report"
  | "submit-incident-feedback"
  | "pulse-create-post"
  | "pulse-like-post"
  | "pulse-create-comment"
  | "pulse-like-comment";

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
    // Best effort only.
  }
}

function getString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value.trim() : "";
}

function getNullableString(
  payload: Record<string, unknown>,
  key: string
): string | null {
  const value = payload[key];

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getBoolean(payload: Record<string, unknown>, key: string): boolean {
  return payload[key] === true;
}

function getVisibilityScope(
  payload: Record<string, unknown>
): PulseVisibilityScope {
  return payload.visibilityScope === "lga" ? "lga" : "ward";
}

async function syncQueuedAction(item: QueuedAction): Promise<boolean> {
  try {
    switch (item.type) {
      case "pulse-create-post": {
        const body = getString(item.payload, "body");

        if (!body) {
          return true;
        }

        await createPulsePost({
          body,
          visibilityScope: getVisibilityScope(item.payload),
          useAnonymousDisplay: getBoolean(item.payload, "useAnonymousDisplay"),
          imageUri: getNullableString(item.payload, "imageUri"),
        });

        return true;
      }

      case "pulse-like-post": {
        const postId = getString(item.payload, "postId");

        if (!postId) {
          return true;
        }

        await likePulsePost(postId);

        return true;
      }

      case "pulse-create-comment": {
        const postId = getString(item.payload, "postId");
        const body = getString(item.payload, "body");

        if (!postId || !body) {
          return true;
        }

        await createPulseComment({
          postId,
          payload: {
            body,
            useAnonymousDisplay: getBoolean(
              item.payload,
              "useAnonymousDisplay"
            ),
          },
        });

        return true;
      }

      case "pulse-like-comment": {
        const postId = getString(item.payload, "postId");
        const commentId = getString(item.payload, "commentId");

        if (!postId || !commentId) {
          return true;
        }

        await likePulseComment({
          postId,
          commentId,
        });

        return true;
      }

      case "submit-election-report":
      case "submit-incident-report":
      case "submit-incident-feedback":
      case "flag-report":
      case "comment":
      case "opinion":
      case "like":
      case "confirm-report":
        return false;

      default:
        return false;
    }
  } catch (error) {
    console.log("Sync failed:", error);
    return false;
  }
}

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

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
        // Ignore corrupted queue.
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(
        Boolean(state.isConnected) && state.isInternetReachable !== false
      );
    });

    return unsubscribe;
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
      let didSyncPulse = false;

      for (const item of pending) {
        const ok = await syncQueuedAction(item);

        if (!ok) {
          continue;
        }

        if (item.type.startsWith("pulse-")) {
          didSyncPulse = true;
        }

        currentQueue = currentQueue.map((entry) =>
          entry.id === item.id ? { ...entry, synced: true } : entry
        );

        setQueue(currentQueue);
        await persistQueue(currentQueue);
      }

      const compacted = currentQueue.filter((item) => !item.synced);

      setQueue(compacted);
      await persistQueue(compacted);

      if (didSyncPulse) {
        void queryClient.invalidateQueries({
          queryKey: pulseQueryKeys.posts,
        });
      }

      syncingRef.current = false;
    };

    void run();
  }, [isOnline, queue, queryClient]);

  const pendingCount = useMemo(() => {
    return queue.filter((item) => !item.synced).length;
  }, [queue]);

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
  const context = useContext(OfflineSyncContext);

  if (!context) {
    throw new Error("useOfflineSync must be used within OfflineSyncProvider");
  }

  return context;
}