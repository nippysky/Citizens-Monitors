import type {
  ActiveElectionApiItem,
  ElectionApiStatus,
} from "@/lib/api/elections.api";

export type ElectionStatus = "live" | "upcoming" | "concluded";
export type ElectionStatusFilter = ElectionStatus | "all";

export type ElectionScopeTab = "all-elections" | "polling-unit";

export type ElectionType =
  | "national"
  | "presidential"
  | "senatorial"
  | "house-of-representatives"
  | "house-of-assembly"
  | "gubernatorial"
  | "governorship"
  | "LGA"
  | "lga"
  | "local-government"
  | "Presidential"
  | "Senatorial"
  | "House of Reps"
  | "State House of Assembly"
  | "Governorship"
  | "Gubernatorial"
  | "Local Government"
  | "Other";

export type ElectionDateParts = {
  day: string;
  monthShort: string;
  year: string;
};

export type ElectionItem = {
  id: string;
  activeElectionId: string;
  title: string;
  type: ElectionType;
  rawType: string;
  location: string;
  status: ElectionStatus;
  date: ElectionDateParts;
  startDate: string;
  endDate: string;
  startDateKey: string;
  endDateKey: string;
  dateRangeLabel: string;
  mockElection: boolean;
  partiesCount: number;
};

export type ElectionFilterState = {
  status: ElectionStatusFilter;
  electionTypes: ElectionType[];
  fromDate: string;
  toDate: string;
};

export const electionStatusPills: ElectionStatusFilter[] = [
  "all",
  "live",
  "upcoming",
  "concluded",
];

export const electionTypeOptions: ElectionType[] = [
  "national",
  "senatorial",
  "house-of-representatives",
  "house-of-assembly",
  "gubernatorial",
  "LGA",
  "local-government",
];

export const defaultElectionFilters: ElectionFilterState = {
  status: "all",
  electionTypes: [],
  fromDate: "",
  toDate: "",
};

const WAT_TIME_ZONE = "Africa/Lagos";

function getDatePartsInWAT(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: WAT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";

  return { day, month, year };
}

function getDateTime(value: string): number {
  const date = new Date(value);
  const time = date.getTime();

  return Number.isNaN(time) ? 0 : time;
}

function getPrimaryStatusRank(status: ElectionStatus): number {
  /**
   * Product requirement:
   * - live elections must always remain at the top
   * - every other election follows by latest date descending
   */
  return status === "live" ? 0 : 1;
}

function getSecondaryStatusRank(status: ElectionStatus): number {
  if (status === "upcoming") return 0;
  if (status === "concluded") return 1;

  return 2;
}

export function sortElectionsForDisplay<T extends ElectionItem>(
  elections: T[]
): T[] {
  return [...elections].sort((a, b) => {
    const primaryStatusDiff =
      getPrimaryStatusRank(a.status) - getPrimaryStatusRank(b.status);

    if (primaryStatusDiff !== 0) {
      return primaryStatusDiff;
    }

    const startDateDiff = getDateTime(b.startDate) - getDateTime(a.startDate);

    if (startDateDiff !== 0) {
      return startDateDiff;
    }

    const endDateDiff = getDateTime(b.endDate) - getDateTime(a.endDate);

    if (endDateDiff !== 0) {
      return endDateDiff;
    }

    const secondaryStatusDiff =
      getSecondaryStatusRank(a.status) - getSecondaryStatusRank(b.status);

    if (secondaryStatusDiff !== 0) {
      return secondaryStatusDiff;
    }

    return a.title.localeCompare(b.title);
  });
}

export function toDateKeyLocal(date: Date): string {
  const { day, month, year } = getDatePartsInWAT(date);
  return `${year}-${month}-${day}`;
}

export function parseDateKeyLocal(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function toMonthTitle(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDisplayDate(dateKey: string): string {
  const date = parseDateKeyLocal(dateKey);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatCompactDate(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: WAT_TIME_ZONE,
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatElectionDateRange(startDate: string, endDate: string) {
  const start = formatCompactDate(startDate);
  const end = formatCompactDate(endDate);

  if (start === "—" && end === "—") return "Date unavailable";
  if (start === end) return `${start} · WAT`;

  return `${start} - ${end} · WAT`;
}

export function getElectionLocationLabel(
  electionLocation: string | null | undefined
): string {
  const normalized = electionLocation?.trim();

  if (!normalized) return "Nationwide";

  return normalized;
}

export function normalizeElectionType(type: string): ElectionType {
  const raw = type.trim();

  switch (raw.toLowerCase()) {
    case "national":
    case "presidential":
      return "national";
    case "senatorial":
    case "senate":
      return "senatorial";
    case "house-of-representatives":
    case "house of representatives":
    case "house-of-reps":
    case "house of reps":
      return "house-of-representatives";
    case "house-of-assembly":
    case "state-house-of-assembly":
    case "state house of assembly":
      return "house-of-assembly";
    case "gubernatorial":
    case "governorship":
      return "gubernatorial";
    case "lga":
    case "local-government":
    case "local government":
      return "LGA";
    default:
      return "Other";
  }
}

export function getElectionTypeLabel(type: ElectionType | string): string {
  switch (String(type).toLowerCase()) {
    case "national":
    case "presidential":
      return "Presidential";
    case "senatorial":
    case "senate":
      return "Senatorial";
    case "house-of-representatives":
      return "House of Representatives";
    case "house-of-assembly":
      return "State House of Assembly";
    case "gubernatorial":
    case "governorship":
      return "Gubernatorial";
    case "lga":
    case "local-government":
      return "Local Government";
    default:
      return String(type || "Election");
  }
}

export function mapApiElectionToItem(
  election: ActiveElectionApiItem
): ElectionItem {
  const start = new Date(election.startDate);
  const startDay =
    Number.isNaN(start.getTime()) === false
      ? new Intl.DateTimeFormat("en-US", {
          timeZone: WAT_TIME_ZONE,
          day: "2-digit",
        }).format(start)
      : "—";

  const startMonth =
    Number.isNaN(start.getTime()) === false
      ? new Intl.DateTimeFormat("en-US", {
          timeZone: WAT_TIME_ZONE,
          month: "short",
        }).format(start)
      : "—";

  const startYear =
    Number.isNaN(start.getTime()) === false
      ? new Intl.DateTimeFormat("en-US", {
          timeZone: WAT_TIME_ZONE,
          year: "numeric",
        }).format(start)
      : "—";

  const normalizedType = normalizeElectionType(election.electionType);

  return {
    id: election.id,
    activeElectionId: election.id,
    title: election.electionName || getElectionTypeLabel(normalizedType),
    type: normalizedType,
    rawType: election.electionType,
    location: getElectionLocationLabel(election.electionLocation),
    status: election.status,
    date: {
      day: startDay,
      monthShort: startMonth,
      year: startYear,
    },
    startDate: election.startDate,
    endDate: election.endDate,
    startDateKey: toDateKeyLocal(new Date(election.startDate)),
    endDateKey: toDateKeyLocal(new Date(election.endDate)),
    dateRangeLabel: formatElectionDateRange(election.startDate, election.endDate),
    mockElection: election.mockElection,
    partiesCount: election.partiesCount,
  };
}

function parseDateInputToKey(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    return trimmed;
  }

  const slashMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (slashMatch) {
    const [, dayRaw, monthRaw, yearRaw] = slashMatch;
    const day = dayRaw.padStart(2, "0");
    const month = monthRaw.padStart(2, "0");

    return `${yearRaw}-${month}-${day}`;
  }

  return null;
}

function rangeIntersects(
  electionStartKey: string,
  electionEndKey: string,
  filterFromKey: string | null,
  filterToKey: string | null
): boolean {
  if (filterFromKey && electionEndKey < filterFromKey) return false;
  if (filterToKey && electionStartKey > filterToKey) return false;

  return true;
}

export function isElectionActiveOnDate(
  election: ElectionItem,
  dateKey: string
): boolean {
  return election.startDateKey <= dateKey && election.endDateKey >= dateKey;
}

export function filterElections(
  elections: ElectionItem[],
  _scope: ElectionScopeTab | "polling-unit",
  filters: ElectionFilterState,
  selectedCalendarDateKey: string | null
): ElectionItem[] {
  const fromKey = parseDateInputToKey(filters.fromDate);
  const toKey = parseDateInputToKey(filters.toDate);
  const selectedTypes = new Set(filters.electionTypes.map(String));

  const filtered = elections.filter((election) => {
    if (filters.status !== "all" && election.status !== filters.status) {
      return false;
    }

    if (
      selectedTypes.size > 0 &&
      !selectedTypes.has(election.type) &&
      !selectedTypes.has(election.rawType)
    ) {
      return false;
    }

    if (
      !rangeIntersects(
        election.startDateKey,
        election.endDateKey,
        fromKey,
        toKey
      )
    ) {
      return false;
    }

    if (
      selectedCalendarDateKey &&
      !isElectionActiveOnDate(election, selectedCalendarDateKey)
    ) {
      return false;
    }

    return true;
  });

  return sortElectionsForDisplay(filtered);
}

export function getElectionRangeLabel(elections: ElectionItem[]): string {
  if (!elections.length) return "No active election schedule yet";

  const sortedByStart = [...elections].sort((a, b) =>
    a.startDateKey.localeCompare(b.startDateKey)
  );

  const sortedByEnd = [...elections].sort((a, b) =>
    b.endDateKey.localeCompare(a.endDateKey)
  );

  const first = sortedByStart[0];
  const last = sortedByEnd[0];

  return `${formatCompactDate(first.startDate)} - ${formatCompactDate(
    last.endDate
  )}`;
}

export function coerceStatusForApi(
  value: ElectionStatusFilter
): ElectionApiStatus {
  return value;
}

export function buildMonthMatrix(visibleMonth: Date) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index
    );

    return {
      key: toDateKeyLocal(date),
      label: String(date.getDate()),
      date,
      muted: date.getMonth() !== month,
    };
  });
}