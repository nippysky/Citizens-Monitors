export type ElectionScopeTab = "polling-unit" | "all-elections";
export type ElectionStatus = "live" | "upcoming" | "concluded";
export type ElectionType =
  | "Presidential"
  | "Governorship"
  | "Senatorial"
  | "House of Reps"
  | "Local Government"
  | "State House of Assembly"
  | "Gubernatorial";

export type ElectionItem = {
  id: string;
  title: string;
  status: ElectionStatus;
  type: ElectionType;
  date: {
    monthShort: string;
    day: string;
    year: string;
  };
  location: string;
  partiesCount?: number;
  ctaLabel: string;
  state: string;
  scope: ElectionScopeTab;
  startDate: string; // YYYY-MM-DD
};

export type ElectionFilterState = {
  status: ElectionStatus | "all";
  fromDate: string;
  toDate: string;
  electionTypes: ElectionType[];
  state: string;
};

export const electionStatusPills: (ElectionStatus | "all")[] = [
  "all",
  "concluded",
  "upcoming",
  "live",
];

export const electionTypeOptions: ElectionType[] = [
  "Presidential",
  "Governorship",
  "Senatorial",
  "House of Reps",
  "Local Government",
  "State House of Assembly",
  "Gubernatorial",
];

export const stateOptions = [
  "All states",
  "Lagos",
  "Abuja",
  "Kano",
  "Rivers",
  "Oyo",
  "Kaduna",
];

export const defaultElectionFilters: ElectionFilterState = {
  status: "all",
  fromDate: "",
  toDate: "",
  electionTypes: [],
  state: "All states",
};

export function toDateKeyLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKeyLocal(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKeyLocal(a) === toDateKeyLocal(b);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function buildCalendarGrid(monthDate: Date): Date[] {
  const firstDayOfMonth = startOfMonth(monthDate);
  const jsDay = firstDayOfMonth.getDay(); // Sunday = 0
  const mondayOffset = jsDay === 0 ? 6 : jsDay - 1;

  const gridStart = new Date(firstDayOfMonth);
  gridStart.setDate(firstDayOfMonth.getDate() - mondayOffset);

  return Array.from({ length: 35 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatDisplayDate(dateKey: string): string {
  return parseDateKeyLocal(dateKey).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCardDate(dateKey: string) {
  const date = parseDateKeyLocal(dateKey);

  return {
    monthShort: date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
    year: String(date.getFullYear()),
  };
}

function offsetDateKey(daysFromToday: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return toDateKeyLocal(date);
}

function createElectionItem(
  input: Omit<ElectionItem, "date">
): ElectionItem {
  return {
    ...input,
    date: formatCardDate(input.startDate),
  };
}

export const electionsDummyData: ElectionItem[] = [
  createElectionItem({
    id: "polling-live-today",
    title: "2026 House of Assembly election",
    status: "live",
    type: "State House of Assembly",
    location: "National",
    partiesCount: 46,
    ctaLabel: "Monitor Election",
    state: "Lagos",
    scope: "polling-unit",
    startDate: offsetDateKey(0),
  }),
  createElectionItem({
    id: "polling-upcoming-tomorrow",
    title: "2026 House of Assembly election",
    status: "upcoming",
    type: "State House of Assembly",
    location: "National",
    ctaLabel: "View Details",
    state: "Lagos",
    scope: "polling-unit",
    startDate: offsetDateKey(1),
  }),
  createElectionItem({
    id: "polling-upcoming-next-week",
    title: "2026 House of Assembly election",
    status: "upcoming",
    type: "State House of Assembly",
    location: "National",
    ctaLabel: "View Details",
    state: "Lagos",
    scope: "polling-unit",
    startDate: offsetDateKey(7),
  }),
  createElectionItem({
    id: "all-live-today",
    title: "2026 House of Assembly election",
    status: "live",
    type: "State House of Assembly",
    location: "National",
    partiesCount: 46,
    ctaLabel: "Monitor Election",
    state: "Abuja",
    scope: "all-elections",
    startDate: offsetDateKey(0),
  }),
  createElectionItem({
    id: "all-upcoming-3",
    title: "2026 House of Assembly election",
    status: "upcoming",
    type: "House of Reps",
    location: "National",
    ctaLabel: "View Details",
    state: "Kano",
    scope: "all-elections",
    startDate: offsetDateKey(3),
  }),
  createElectionItem({
    id: "all-upcoming-10",
    title: "2026 House of Assembly election",
    status: "upcoming",
    type: "Governorship",
    location: "National",
    ctaLabel: "View Details",
    state: "Rivers",
    scope: "all-elections",
    startDate: offsetDateKey(10),
  }),
  createElectionItem({
    id: "all-concluded-2",
    title: "2026 House of Assembly election",
    status: "concluded",
    type: "Local Government",
    location: "National",
    partiesCount: 46,
    ctaLabel: "View Reports",
    state: "Oyo",
    scope: "all-elections",
    startDate: offsetDateKey(-2),
  }),
  createElectionItem({
    id: "all-concluded-9",
    title: "2026 House of Assembly election",
    status: "concluded",
    type: "State House of Assembly",
    location: "National",
    partiesCount: 46,
    ctaLabel: "View Reports",
    state: "Kaduna",
    scope: "all-elections",
    startDate: offsetDateKey(-9),
  }),
];

export function getElectionDateRangeLabel(scope: ElectionScopeTab): string {
  if (scope === "polling-unit") {
    return "Dec 2024 - Nov 2025";
  }

  return "Dec 2024 - Nov 2025";
}

export function getElectionHeadline(scope: ElectionScopeTab): string {
  if (scope === "polling-unit") {
    return "Discover your polling unit elections";
  }

  return "Discover all elections in Nigeria";
}

function matchesScope(item: ElectionItem, scope: ElectionScopeTab): boolean {
  return item.scope === scope;
}

function matchesStatus(
  item: ElectionItem,
  status: ElectionFilterState["status"]
): boolean {
  if (status === "all") return true;
  return item.status === status;
}

function matchesType(item: ElectionItem, types: ElectionType[]): boolean {
  if (types.length === 0) return true;
  return types.includes(item.type);
}

function matchesState(item: ElectionItem, state: string): boolean {
  if (!state || state === "All states") return true;
  return item.state === state;
}

function matchesDateRange(
  item: ElectionItem,
  fromDate: string,
  toDate: string
): boolean {
  if (fromDate && item.startDate < fromDate) return false;
  if (toDate && item.startDate > toDate) return false;
  return true;
}

function matchesSelectedDate(
  item: ElectionItem,
  selectedDateKey: string | null
): boolean {
  if (!selectedDateKey) return true;
  return item.startDate === selectedDateKey;
}

export function filterElections(
  elections: ElectionItem[],
  scope: ElectionScopeTab,
  filters: ElectionFilterState,
  selectedDateKey: string | null = null
): ElectionItem[] {
  return elections.filter((item) => {
    return (
      matchesScope(item, scope) &&
      matchesStatus(item, filters.status) &&
      matchesType(item, filters.electionTypes) &&
      matchesState(item, filters.state) &&
      matchesDateRange(item, filters.fromDate, filters.toDate) &&
      matchesSelectedDate(item, selectedDateKey)
    );
  });
}

export function getCalendarFilteredElections(
  elections: ElectionItem[],
  scope: ElectionScopeTab,
  filters: ElectionFilterState,
  dateKey: string
): ElectionItem[] {
  return filterElections(elections, scope, filters, dateKey);
}

export function getHighlightedDateKeysForMonth(
  elections: ElectionItem[],
  scope: ElectionScopeTab,
  filters: ElectionFilterState,
  visibleMonth: Date
): Set<string> {
  const baseItems = filterElections(elections, scope, filters, null);

  return new Set(
    baseItems
      .filter((item) => isSameMonth(parseDateKeyLocal(item.startDate), visibleMonth))
      .map((item) => item.startDate)
  );
}

export function getEmptyCalendarSubtitle(selectedDateKey: string, todayKey: string): string {
  if (selectedDateKey > todayKey) {
    return "Citizen Monitor have not commence operate then.";
  }

  return "No election was held on this day(s)";
}