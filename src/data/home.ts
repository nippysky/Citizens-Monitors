import { Paths } from "@/constants/paths";
import { CalendarDayItem, VoterEssentialItem } from "@/types/home";

function formatLocalDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function weekdayShort(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function startOfLocalDay(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatHomeDateKey(date: Date): string {
  return formatLocalDateKey(date);
}

export function buildCalendarWindow(
  centerDate: Date,
  daysEachSide = 15
): CalendarDayItem[] {
  const items: CalendarDayItem[] = [];

  for (let offset = -daysEachSide; offset <= daysEachSide; offset += 1) {
    const date = new Date(centerDate);
    date.setDate(centerDate.getDate() + offset);

    items.push({
      key: formatLocalDateKey(date),
      date,
      weekdayShort: weekdayShort(date),
      dayNumber: String(date.getDate()),
      monthLabel: monthLabel(date),
    });
  }

  return items;
}

export const allVoterEssentials: VoterEssentialItem[] = [
  {
    id: "ve-1",
    label: "Polling Unit Locator",
    icon: "PollingUnitLocator",
    route: Paths.voterPollingUnitLocator,
  },
  {
    id: "ve-2",
    label: "Citizen Academy",
    icon: "CitizenAcademy",
    route: Paths.voterCitizenAcademy,
  },
  {
    id: "ve-3",
    label: "Digital Election Vault",
    icon: "DigitalElectionVault",
    route: Paths.appDigitalVault,
  },
  {
    id: "ve-4",
    label: "News & Insights",
    icon: "NewsAndInsights",
    route: Paths.voterNewsAndInsights,
  },
  {
    id: "ve-5",
    label: "Press Coverage",
    icon: "PressCoverage",
    route: Paths.voterPressCoverage,
  },
  {
    id: "ve-6",
    label: "Donate to Support",
    icon: "DonateSupport",
    route: Paths.voterDonateSupport,
  },
];

export const featuredVoterEssentials: VoterEssentialItem[] = allVoterEssentials;

export function getRandomVoterEssentials(): VoterEssentialItem[] {
  return featuredVoterEssentials;
}