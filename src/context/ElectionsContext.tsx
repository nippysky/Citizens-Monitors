import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

import {
  defaultElectionFilters,
  ElectionFilterState,
  ElectionScopeTab,
  startOfMonth,
  toDateKeyLocal,
} from "@/data/elections";

type ElectionsContextValue = {
  scope: ElectionScopeTab;
  setScope: (value: ElectionScopeTab) => void;

  filters: ElectionFilterState;
  setFilters: (value: ElectionFilterState) => void;
  resetFilters: () => void;

  selectedCalendarDateKey: string | null;
  setSelectedCalendarDateKey: (value: string | null) => void;
  clearSelectedCalendarDateKey: () => void;

  visibleCalendarMonth: Date;
  setVisibleCalendarMonth: (value: Date) => void;

  todayKey: string;
};

const ElectionsContext = createContext<ElectionsContextValue | null>(null);

type Props = {
  children: ReactNode;
};

export function ElectionsProvider({ children }: Props) {
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKeyLocal(today), [today]);

  const [scope, setScope] = useState<ElectionScopeTab>("all-elections");
  const [filters, setFilters] = useState<ElectionFilterState>(
    defaultElectionFilters
  );
  const [selectedCalendarDateKey, setSelectedCalendarDateKey] = useState<string | null>(null);
  const [visibleCalendarMonth, setVisibleCalendarMonth] = useState<Date>(
    startOfMonth(today)
  );

  const value = useMemo<ElectionsContextValue>(
    () => ({
      scope,
      setScope,

      filters,
      setFilters,
      resetFilters: () => setFilters(defaultElectionFilters),

      selectedCalendarDateKey,
      setSelectedCalendarDateKey,
      clearSelectedCalendarDateKey: () => setSelectedCalendarDateKey(null),

      visibleCalendarMonth,
      setVisibleCalendarMonth,

      todayKey,
    }),
    [filters, scope, selectedCalendarDateKey, visibleCalendarMonth, todayKey]
  );

  return (
    <ElectionsContext.Provider value={value}>
      {children}
    </ElectionsContext.Provider>
  );
}

export function useElections() {
  const context = useContext(ElectionsContext);

  if (!context) {
    throw new Error("useElections must be used within ElectionsProvider");
  }

  return context;
}