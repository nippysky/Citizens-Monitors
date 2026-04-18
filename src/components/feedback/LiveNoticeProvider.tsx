import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
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

import GlobalLiveNotice from "@/components/feedback/GlobalLiveNotice";
import LiveNoticeDevTrigger from "@/components/feedback/LiveNoticeDevTrigger";
import CommencementBottomSheet from "@/components/reporting/CommencementBottomSheet";
import LocationPermissionModal from "@/components/reporting/LocationPermissionModal";
import { Paths } from "@/constants/paths";
import {
  buildCommencementContext,
  buildInitialIncidentDraft,
  buildInitialResultDraft,
  CommencementContext,
  DEV_COMMENCEMENT_CONTEXT,
  REPORTING_DEV_CONFIG,
  saveIncidentDraft,
  saveResultDraft,
} from "@/lib/reporting";

type ShowNoticeArgs = {
  message: string;
  actionLabel?: string;
  contextData?: CommencementContext;
  onPress?: () => void;
};

type LiveNoticeContextValue = {
  showNotice: (args: ShowNoticeArgs) => void;
  hideNotice: () => void;
  openCommencement: (contextData?: CommencementContext) => void;
  requestLocationForAction: (onGranted: (geoLabel: string) => void) => void;
  triggerDevElectionNotice: () => void;
};

const LiveNoticeContext = createContext<LiveNoticeContextValue | null>(null);

export function LiveNoticeProvider({ children }: { children: ReactNode }) {
  const commencementRef = useRef<BottomSheetModal>(null);

  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [message, setMessage] = useState("");
  const [actionLabel, setActionLabel] = useState<string | undefined>();
  const [noticeContext, setNoticeContext] = useState<CommencementContext>(
    DEV_COMMENCEMENT_CONTEXT
  );
  const [customOnPress, setCustomOnPress] = useState<(() => void) | null>(null);

  const [locationVisible, setLocationVisible] = useState(false);
  const [locationSuccessHandler, setLocationSuccessHandler] =
    useState<((geoLabel: string) => void) | null>(null);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const hideNotice = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, []);

  const showNotice = useCallback(
    ({ message, actionLabel, contextData, onPress }: ShowNoticeArgs) => {
      clearTimer();

      setMessage(message);
      setActionLabel(actionLabel);
      setNoticeContext(buildCommencementContext(contextData));
      setCustomOnPress(() => onPress ?? null);
      setRendered(true);

      requestAnimationFrame(() => {
        setVisible(true);
      });

      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, 30000);
    },
    []
  );

  const openCommencement = useCallback((contextData?: CommencementContext) => {
    setNoticeContext(buildCommencementContext(contextData));

    requestAnimationFrame(() => {
      commencementRef.current?.present();
    });
  }, []);

  const triggerDevElectionNotice = useCallback(() => {
    showNotice({
      message:
        "Alimosho 2026 Election is Live! Submit result & incident reports.",
      actionLabel: "Submit Election Report",
      contextData: DEV_COMMENCEMENT_CONTEXT,
    });
  }, [showNotice]);

  const requestLocationForAction = useCallback(
    (onGranted: (geoLabel: string) => void) => {
      setLocationSuccessHandler(() => onGranted);
      setLocationVisible(true);
    },
    []
  );

  const handleLocationGranted = useCallback(
    (geoLabel: string) => {
      setLocationVisible(false);
      locationSuccessHandler?.(geoLabel);
    },
    [locationSuccessHandler]
  );

  const handleProceedResult = useCallback(
    async (time: string) => {
      const draft = buildInitialResultDraft(noticeContext, time);
      await saveResultDraft(draft);

      router.push(Paths.submitElectionReport);
    },
    [noticeContext]
  );

  const handleProceedIncident = useCallback(async () => {
    const draft = buildInitialIncidentDraft(noticeContext);
    await saveIncidentDraft(draft);

    router.push(Paths.reportIncident);
  }, [noticeContext]);

  useEffect(() => {
    if (!REPORTING_DEV_CONFIG.autoShowDemoLiveNotice) return;

    const timer = setTimeout(() => {
      triggerDevElectionNotice();
    }, 1200);

    return () => clearTimeout(timer);
  }, [triggerDevElectionNotice]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  const value = useMemo(
    () => ({
      showNotice,
      hideNotice,
      openCommencement,
      requestLocationForAction,
      triggerDevElectionNotice,
    }),
    [
      showNotice,
      hideNotice,
      openCommencement,
      requestLocationForAction,
      triggerDevElectionNotice,
    ]
  );

  return (
    <LiveNoticeContext.Provider value={value}>
      {children}

      {REPORTING_DEV_CONFIG.enableGlobalLiveNoticeDevTrigger ? (
        <LiveNoticeDevTrigger onPress={triggerDevElectionNotice} />
      ) : null}

      {rendered ? (
        <GlobalLiveNotice
          visible={visible}
          message={message}
          actionLabel={actionLabel}
          onPressAction={() => {
            if (customOnPress) {
              customOnPress();
            } else {
              openCommencement(noticeContext);
            }

            requestAnimationFrame(() => {
              hideNotice();
            });
          }}
          onHide={() => setRendered(false)}
        />
      ) : null}

      <CommencementBottomSheet
        ref={commencementRef}
        contextData={noticeContext}
        onProceedResult={handleProceedResult}
        onProceedIncident={handleProceedIncident}
      />

      <LocationPermissionModal
        visible={locationVisible}
        onClose={() => setLocationVisible(false)}
        onGranted={handleLocationGranted}
      />
    </LiveNoticeContext.Provider>
  );
}

export function useLiveNotice() {
  const ctx = useContext(LiveNoticeContext);

  if (!ctx) {
    throw new Error("useLiveNotice must be used within LiveNoticeProvider");
  }

  return ctx;
}