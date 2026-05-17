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
import { reportingQueryKeys } from "@/hooks/api/useReportingMutations";
import {
  mapDraftToElectionResultPayload,
  mapDraftToIncidentReportPayload,
  submitElectionResult,
  submitIncidentReport,
} from "@/lib/api/reporting.api";
import {
  createPulseComment,
  createPulsePost,
  likePulseComment,
  likePulsePost,
  PulseVisibilityScope,
} from "@/lib/api/pulse.api";
import { ElectionResultDraft, IncidentDraft } from "@/lib/reporting";

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
  enqueue: (action: Omit<QueuedAction, "id" | "createdAt" | "synced">) => void;
  isOnline: boolean;
  pendingCount: number;
};

type SyncResult = {
  ok: boolean;
  invalidatePulse?: boolean;
  invalidateReportingElectionId?: string;
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
  key: string,
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
  payload: Record<string, unknown>,
): PulseVisibilityScope {
  return payload.visibilityScope === "lga" ? "lga" : "ward";
}

function getElectionId(payload: Record<string, unknown>): string {
  return getString(payload, "electionId") || getString(payload, "election");
}

function getElectionFeedback(payload: Record<string, unknown>) {
  return {
    rating: getString(payload, "rating") as "good" | "manageable" | "poor" | "",
    intimidationToday: getString(payload, "intimidationToday") as
      | "yes"
      | "no"
      | "",
    voteBuyingToday: getString(payload, "voteBuyingToday") as "yes" | "no" | "",
  };
}

async function syncQueuedAction(item: QueuedAction): Promise<SyncResult> {
  try {
    switch (item.type) {
      case "pulse-create-post": {
        const body = getString(item.payload, "body");

        if (!body) {
          return { ok: true };
        }

        await createPulsePost({
          body,
          visibilityScope: getVisibilityScope(item.payload),
          useAnonymousDisplay: getBoolean(item.payload, "useAnonymousDisplay"),
          imageUri: getNullableString(item.payload, "imageUri"),
        });

        return { ok: true, invalidatePulse: true };
      }

      case "pulse-like-post": {
        const postId = getString(item.payload, "postId");

        if (!postId) {
          return { ok: true };
        }

        await likePulsePost(postId);

        return { ok: true, invalidatePulse: true };
      }

      case "pulse-create-comment": {
        const postId = getString(item.payload, "postId");
        const body = getString(item.payload, "body");

        if (!postId || !body) {
          return { ok: true };
        }

        await createPulseComment({
          postId,
          payload: {
            body,
            useAnonymousDisplay: getBoolean(
              item.payload,
              "useAnonymousDisplay",
            ),
          },
        });

        return { ok: true, invalidatePulse: true };
      }

      case "pulse-like-comment": {
        const postId = getString(item.payload, "postId");
        const commentId = getString(item.payload, "commentId");

        if (!postId || !commentId) {
          return { ok: true };
        }

        await likePulseComment({
          postId,
          commentId,
        });

        return { ok: true, invalidatePulse: true };
      }

      case "submit-election-report": {
        const electionId = getElectionId(item.payload);

        if (!electionId) {
          return { ok: true };
        }

        await submitElectionResult(
          mapDraftToElectionResultPayload({
            draft: item.payload as unknown as ElectionResultDraft,
            feedback: getElectionFeedback(item.payload),
          }),
        );

        return { ok: true, invalidateReportingElectionId: electionId };
      }

      case "submit-incident-report": {
        const electionId = getElectionId(item.payload);

        if (!electionId) {
          return { ok: true };
        }

        await submitIncidentReport(
          mapDraftToIncidentReportPayload(
            item.payload as unknown as IncidentDraft,
          ),
        );

        return { ok: true, invalidateReportingElectionId: electionId };
      }

      case "submit-incident-feedback":
      case "flag-report":
      case "comment":
      case "opinion":
      case "like":
      case "confirm-report":
        return { ok: false };

      default:
        return { ok: false };
    }
  } catch (error) {
    console.log("Sync failed:", error);
    return { ok: false };
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
        Boolean(state.isConnected) && state.isInternetReachable !== false,
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
    [],
  );

  useEffect(() => {
    if (!isOnline || syncingRef.current) return;

    const pending = queue.filter((item) => !item.synced);
    if (!pending.length) return;

    syncingRef.current = true;

    const run = async () => {
      let currentQueue = [...queue];
      let shouldInvalidatePulse = false;
      const reportingElectionIds = new Set<string>();

      for (const item of pending) {
        const result = await syncQueuedAction(item);

        if (!result.ok) {
          continue;
        }

        if (result.invalidatePulse) {
          shouldInvalidatePulse = true;
        }

        if (result.invalidateReportingElectionId) {
          reportingElectionIds.add(result.invalidateReportingElectionId);
        }

        currentQueue = currentQueue.map((entry) =>
          entry.id === item.id ? { ...entry, synced: true } : entry,
        );

        setQueue(currentQueue);
        await persistQueue(currentQueue);
      }

      const compacted = currentQueue.filter((item) => !item.synced);

      setQueue(compacted);
      await persistQueue(compacted);

      if (shouldInvalidatePulse) {
        void queryClient.invalidateQueries({
          queryKey: pulseQueryKeys.posts,
        });
      }

      if (reportingElectionIds.size > 0) {
        void queryClient.invalidateQueries({
          queryKey: reportingQueryKeys.dashboard,
        });
        void queryClient.invalidateQueries({
          queryKey: reportingQueryKeys.electionVault,
        });
        void queryClient.invalidateQueries({
          queryKey: reportingQueryKeys.collation,
        });

        reportingElectionIds.forEach((electionId) => {
          void queryClient.invalidateQueries({
            queryKey: reportingQueryKeys.electionCollation(electionId),
          });
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
    [queue, enqueue, isOnline, pendingCount],
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
