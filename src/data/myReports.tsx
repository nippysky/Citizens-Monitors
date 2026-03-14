import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";

export type ReportStat = {
  id: string;
  label: string;
  value: number;
  icon: ReactNode;
};

export type ReportElectionItem = {
  id: string;
  electionId: string;
  title: string;
  location: string;
  timeLabel: string;
  reportsCount: number;
};

export const myReportStats: ReportStat[] = [
  {
    id: "submitted",
    label: "SUBMITTED",
    value: 12,
    icon: <Ionicons name="document-text-outline" size={22} color="#F59E0B" />,
  },
  {
    id: "accuracy",
    label: "ACCURACY",
    value: 12,
    icon: <Ionicons name="at-outline" size={22} color="#10B981" />,
  },
  {
    id: "verified",
    label: "VERIFIED",
    value: 12,
    icon: <Ionicons name="checkmark-circle-outline" size={22} color="#22C55E" />,
  },
  {
    id: "flagged",
    label: "FLAGGED",
    value: 12,
    icon: <Ionicons name="alert-circle-outline" size={22} color="#EF4444" />,
  },
];

export const myReportsList: ReportElectionItem[] = [
  {
    id: "report-1",
    electionId: "alimosho-local-government-election-2026",
    title: "Alimosho Local Government Election 2026",
    location: "Lagos State, Alimosho District",
    timeLabel: "8:00 AM - 4:00 PM (GMT+1)",
    reportsCount: 2,
  },
  {
    id: "report-2",
    electionId: "lagos-gubernatorial-election-2025",
    title: "2025 Lagos Gubernatorial",
    location: "Lagos State, Alimosho District",
    timeLabel: "8:00 AM - 4:00 PM (GMT+1)",
    reportsCount: 2,
  },
  {
    id: "report-3",
    electionId: "lagos-state-governorship-election-2026",
    title: "2026 Lagos State Governorship Election",
    location: "Lagos State, Alimosho District",
    timeLabel: "8:00 AM - 4:00 PM (GMT+1)",
    reportsCount: 2,
  },
  {
    id: "report-4",
    electionId: "house-of-assembly-election-2026",
    title: "2026 House of Assembly election",
    location: "Lagos State, Alimosho District",
    timeLabel: "8:00 AM - 4:00 PM (GMT+1)",
    reportsCount: 2,
  },
];

export const emptyReportsList: ReportElectionItem[] = [];