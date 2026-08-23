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
import CommencementBottomSheet from "@/components/reporting/CommencementBottomSheet";
import LocationPermissionModal from "@/components/reporting/LocationPermissionModal";
import { Paths } from "@/constants/paths";
import { useMyProfileQuery } from "@/hooks/api/useMyProfileQuery";
import { useSubmissionGate } from "@/hooks/useSubmissionGate";
import {
  asProfileLike,
  buildProfileCommencementContext,
  type ProfileLike,
} from "@/lib/profileCommencement";
import {
  buildCommencementContext,
  buildInitialIncidentDraft,
  buildInitialResultDraft,
  CommencementContext,
  saveIncidentDraft,
  saveResultDraft,
} from "@/lib/reporting";
import { useActiveElectionsQuery } from "@/hooks/api/useElectionQueries";

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
};

type LiveElectionLike = {
  id?: string;
  electionName?: string;
  electionType?: string;
  electionLocation?: string | null;
  startDate?: string;
  endDate?: string;
  status?: string;
};

const LiveNoticeContext = createContext<LiveNoticeContextValue | null>(null);

function normalizeRole(profile: ProfileLike | null): string {
  const source =
    profile?.role ??
    profile?.userType ??
    profile?.user?.role ??
    profile?.user?.userType ??
    "";
  return String(source).trim().toLowerCase();
}

function canReceiveReportingNotice(profile: ProfileLike | null): boolean {
  const role = normalizeRole(profile);
  return role === "observer" || role === "volunteer";
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getElectionTitle(election: LiveElectionLike): string {
  const name = clean(election.electionName);
  const location = clean(election.electionLocation);

  if (!name && !location) return "Live Election";
  if (!location) return name;

  const normalizedLocation = location.toLowerCase();
  if (name.toLowerCase().includes(normalizedLocation)) return name;

  return `${location} ${name}`;
}

function buildContextFromLiveElection(params: {
  election: LiveElectionLike;
  profile: ProfileLike | null;
}): CommencementContext | null {
  const electionId = clean(params.election.id);
  if (!electionId) return null;

  // Shared builder — the polling unit always comes from the user's profile
  // so it is identical across every reporting entry point.
  return buildProfileCommencementContext({
    electionId,
    electionTitle: getElectionTitle(params.election),
    profile: params.profile,
  });
}

function getPrimaryLiveElection(
  elections: LiveElectionLike[],
): LiveElectionLike | null {
  const live = elections.filter((item) => clean(item.id));
  if (!live.length) return null;

  return [...live].sort((a, b) => {
    const aStart = Date.parse(clean(a.startDate)) || 0;
    const bStart = Date.parse(clean(b.startDate)) || 0;
    return bStart - aStart;
  })[0];
}

function buildNoticeMessage(context: CommencementContext): string {
  return `${context.electionTitle} is Live! Submit results & incident reports.`;
}

function buildReportRoute(
  pathname: string,
  ctx: CommencementContext,
  extra?: Record<string, string>,
) {
  return {
    pathname: pathname as never,
    params: {
      electionId: ctx.electionId,
      electionTitle: ctx.electionTitle,
      pollingUnitName: ctx.pollingUnitName,
      pollingUnitCode: ctx.pollingUnitCode,
      ward: ctx.ward,
      lga: ctx.lga,
      state: ctx.state,
      ...extra,
    },
  };
}

export function LiveNoticeProvider({ children }: { children: ReactNode }) {
  const commencementRef = useRef<BottomSheetModal>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownElectionIdsRef = useRef<Set<string>>(new Set());

  const liveElectionsQuery = useActiveElectionsQuery("live");
  const profileQuery = useMyProfileQuery();

  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [message, setMessage] = useState("");
  const [actionLabel, setActionLabel] = useState<string | undefined>();
  // Starts empty — populated from the live election + the user's profile.
  // Never seeded with fixture data.
  const [noticeContext, setNoticeContext] = useState<CommencementContext>(() =>
    buildCommencementContext()
  );
  const [customOnPress, setCustomOnPress] = useState<(() => void) | null>(null);

  const [locationVisible, setLocationVisible] = useState(false);
  const [locationSuccessHandler, setLocationSuccessHandler] = useState<
    ((geoLabel: string) => void) | null
  >(null);

  const profile = useMemo(
    () => asProfileLike(profileQuery.data),
    [profileQuery.data],
  );

  const primaryProdNoticeContext = useMemo(() => {
    if (!canReceiveReportingNotice(profile)) return null;

    const elections = (liveElectionsQuery.data?.elections ??
      []) as LiveElectionLike[];
    const primaryElection = getPrimaryLiveElection(elections);

    if (!primaryElection) return null;

    return buildContextFromLiveElection({
      election: primaryElection,
      profile,
    });
  }, [liveElectionsQuery.data, profile]);

  const clearTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const hideNotice = useCallback(() => {
    clearTimer();
    setVisible(false);
  }, [clearTimer]);

  const showNotice = useCallback(
    ({ message, actionLabel, contextData, onPress }: ShowNoticeArgs) => {
      clearTimer();

      const nextContext = buildCommencementContext(contextData);

      setMessage(message);
      setActionLabel(actionLabel);
      setNoticeContext(nextContext);
      setCustomOnPress(() => onPress ?? null);
      setRendered(true);

      requestAnimationFrame(() => {
        setVisible(true);
      });

      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, 30000);
    },
    [clearTimer],
  );

  const { checkAndProceed } = useSubmissionGate();

  const openCommencement = useCallback(
    (contextData?: CommencementContext) => {
      const ctx = buildCommencementContext(contextData);
      const electionId = ctx.electionId;

      if (!electionId) {
        setNoticeContext(ctx);
        requestAnimationFrame(() => {
          commencementRef.current?.present();
        });
        return;
      }

      void checkAndProceed(electionId, () => {
        setNoticeContext(ctx);
        requestAnimationFrame(() => {
          commencementRef.current?.present();
        });
      });
    },
    [checkAndProceed]
  );

  const requestLocationForAction = useCallback(
    (onGranted: (geoLabel: string) => void) => {
      setLocationSuccessHandler(() => onGranted);
      setLocationVisible(true);
    },
    [],
  );

  const handleLocationGranted = useCallback(
    (geoLabel: string) => {
      setLocationVisible(false);
      locationSuccessHandler?.(geoLabel);
    },
    [locationSuccessHandler],
  );

  const handleProceedResult = useCallback(
    async (time: string) => {
      const draft = buildInitialResultDraft(noticeContext, time);
      await saveResultDraft(draft);

      router.push(
        buildReportRoute(Paths.submitElectionReport, noticeContext, {
          votingStartTime: time,
        }),
      );
    },
    [noticeContext],
  );

  const handleProceedIncident = useCallback(async (time: string) => {
    const draft = buildInitialIncidentDraft(noticeContext);
    await saveIncidentDraft({ ...draft, incidentTime: time });

    router.push(
      buildReportRoute(Paths.reportIncident, noticeContext, {
        incidentTime: time,
      })
    );
  }, [noticeContext]);

  useEffect(() => {
    if (!primaryProdNoticeContext) return;

    const id = primaryProdNoticeContext.electionId;
    if (shownElectionIdsRef.current.has(id)) return;

    shownElectionIdsRef.current.add(id);

    showNotice({
      message: buildNoticeMessage(primaryProdNoticeContext),
      actionLabel: "Submit Election Report",
      contextData: primaryProdNoticeContext,
    });
  }, [primaryProdNoticeContext, showNotice]);

  useEffect(() => clearTimer, [clearTimer]);

  const value = useMemo(
    () => ({
      showNotice,
      hideNotice,
      openCommencement,
      requestLocationForAction,
    }),
    [
      showNotice,
      hideNotice,
      openCommencement,
      requestLocationForAction,
    ],
  );

  return (
    <LiveNoticeContext.Provider value={value}>
      {children}

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
          onClose={hideNotice}
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
