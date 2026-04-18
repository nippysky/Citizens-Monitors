// ─── src/data/me.ts ──────────────────────────────────────────────────────────
// ┌─────────────────────────────────────────────────────────────────────────┐
// │  DEV SWITCH — change this to test different user views:                │
// │    "observer-pending"  → observer awaiting PVC verification            │
// │    "observer-verified" → verified observer with all features           │
// │    "volunteer"         → volunteer, can upgrade to observer            │
// │    "public-viewer"     → minimal view, can upgrade                     │

import ArchiveReport from "@/svgs/app/profile/ArchiveReport";
import BankDetails from "@/svgs/app/profile/BankDetails";
import CitizenAcademy from "@/svgs/app/profile/CitizenAcademy";
import DigitalVaultCheck from "@/svgs/app/profile/DigitalVaultCheck";
import Feedback from "@/svgs/app/profile/Feedback";
import MyPollingUnit from "@/svgs/app/profile/MyPollingUnit";
import Notification from "@/svgs/app/profile/Notification";
import Profile from "@/svgs/app/profile/Profile";
import PUCheck from "@/svgs/app/profile/PUCheck";
import Security from "@/svgs/app/profile/Security";
import Support from "@/svgs/app/profile/Support";
import SignOut from "@/svgs/app/SignOut";
import React, { ReactNode } from "react";

// └─────────────────────────────────────────────────────────────────────────┘
export const DEV_USER_TYPE: DevUserType = "volunteer";
// ─────────────────────────────────────────────────────────────────────────────


/* ───── Types ───── */

export type DevUserType =
  | "observer-pending"
  | "observer-verified"
  | "volunteer"
  | "public-viewer";

export type UserType = "observer" | "volunteer" | "public-viewer";
export type VerificationStatus = "pending" | "verified" | "none";

export type MeUser = {
  fullName: string;
  username: string;
  roleLabel: string;
  userType: UserType;
  verificationStatus: VerificationStatus;
  pollingUnit: string;
  avatarUri?: string;
  pvcVerifiedDate?: string;
  reportsCount: number;
  electionsCount: number;
  incidentsCount: number;
};

export type MeMenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  tone?: "default" | "danger";
};

export type MeBannerConfig = {
  show: boolean;
  title: string;
  subtitle: string;
  type: "complete-profile" | "observer-registration" | "none";
};

/* ───── User presets ───── */

const userPresets: Record<DevUserType, MeUser> = {
  "observer-pending": {
    fullName: "Ifeoluwa Ajetomobi",
    username: "IronEagel24",
    roleLabel: "Observer at Alimosho PU",
    userType: "observer",
    verificationStatus: "pending",
    pollingUnit: "PU 024, Alimosho",
    reportsCount: 17,
    electionsCount: 3,
    incidentsCount: 24,
  },
  "observer-verified": {
    fullName: "Ifeoluwa Ajetomobi",
    username: "IronEagel24",
    roleLabel: "Observer at Alimosho PU",
    userType: "observer",
    verificationStatus: "verified",
    pollingUnit: "PU 024, Alimosho",
    pvcVerifiedDate: "Mar 19, 2027",
    reportsCount: 17,
    electionsCount: 3,
    incidentsCount: 24,
  },
  volunteer: {
    fullName: "Ifeoluwa Ajetomobi",
    username: "IronEagel24",
    roleLabel: "Volunteer at Alimosho PU",
    userType: "volunteer",
    verificationStatus: "none",
    pollingUnit: "PU 024, Alimosho",
    reportsCount: 17,
    electionsCount: 3,
    incidentsCount: 24,
  },
  "public-viewer": {
    fullName: "Ifeoluwa Ajetomobi",
    username: "IronEagel24",
    roleLabel: "Public  Viewer",
    userType: "public-viewer",
    verificationStatus: "none",
    pollingUnit: "PU 024, Alimosho",
    reportsCount: 0,
    electionsCount: 0,
    incidentsCount: 0,
  },
};

/** Active mock user — driven by DEV_USER_TYPE flag */
export const mockMeUser: MeUser = userPresets[DEV_USER_TYPE];

/* ───── Banner logic ───── */

export function getMeBanner(user: MeUser): MeBannerConfig {
  if (user.userType === "observer" && user.verificationStatus === "pending") {
    return {
      show: true,
      title: "Complete your profile",
      subtitle: "Upload your PVC to unlock full access as a Volunteer.",
      type: "complete-profile",
    };
  }
  if (user.userType === "volunteer") {
    return {
      show: true,
      title: "Observer Registration",
      subtitle: "Upgrade to become an observer",
      type: "observer-registration",
    };
  }
  return { show: false, title: "", subtitle: "", type: "none" };
}

/* ───── Dynamic menu items ───── */

export function getMeAccountItems(user: MeUser): MeMenuItem[] {
  const items: MeMenuItem[] = [];

  // Personal Profile — always
  items.push({
    id: "personal-profile",
    title: "Personal Profile",
    subtitle: "Edit your profile information",
    icon: <Profile width={42} height={42} />,
  });

  // Security — always
  items.push({
    id: "security",
    title: "Security",
    subtitle: "Set new login password",
    icon: <Security width={42} height={42} />,
  });

  // Polling Unit — observer & volunteer only
  if (user.userType === "observer" || user.userType === "volunteer") {
    items.push({
      id: "polling-unit",
      title: "My Polling Unit",
      subtitle: user.pollingUnit,
      icon: <MyPollingUnit width={42} height={42} />,
    });
  }

  // Public viewer & volunteer: Upgrade User Type
  if (user.userType === "public-viewer" || user.userType === "volunteer") {
    items.push({
      id: "upgrade-user",
      title: "Upgrade User Type",
      subtitle: "Set polling unit you associated with",
      icon: <PUCheck width={42} height={42} />,
    });
  }

  // Observer verified: PVC, Bank, Archive
  if (user.userType === "observer" && user.verificationStatus === "verified") {
    items.push({
      id: "pvc-verification",
      title: "PVC Verification",
      subtitle: user.pvcVerifiedDate
        ? `Verified: ${user.pvcVerifiedDate}`
        : "Upload your PVC",
      icon: <PUCheck width={42} height={42} />,
    });
    items.push({
      id: "bank-details",
      title: "Observer Bank Detail",
      subtitle: "Get remunerated for being an observer",
      icon: <BankDetails width={42} height={42} />,
    });
    items.push({
      id: "archive-reports",
      title: "Archive Reports",
      subtitle: `${user.reportsCount} reports across ${user.electionsCount} elections`,
      icon: <ArchiveReport width={42} height={42} />,
    });
  }

  // Digital Vault — observer pending, volunteer (not verified observer, not public viewer)
  if (
    (user.userType === "observer" && user.verificationStatus === "pending") ||
    user.userType === "volunteer"
  ) {
    items.push({
      id: "digital-vault",
      title: "Digital Vault",
      subtitle: `${user.reportsCount} reports across ${user.electionsCount} elections`,
      icon: <DigitalVaultCheck width={42} height={42} />,
    });
  }

  // Citizen Academy — always
  items.push({
    id: "citizen-academy",
    title: "Citizen Academy",
    subtitle: "Know all about election practices",
    icon: <CitizenAcademy width={42} height={42} />,
  });

  return items;
}

export function getMeOtherItems(): MeMenuItem[] {
  return [
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage alerts and push messages",
      icon: <Notification width={42} height={42} />,
    },
    {
      id: "support-faq",
      title: "Support & FAQ",
      subtitle: "Get help from here",
      icon: <Support width={42} height={42} />,
    },
    {
      id: "feedback",
      title: "Give Feedback",
      subtitle: "Help improve this app",
      icon: <Feedback width={42} height={42} />,
    },
    {
      id: "sign-out",
      title: "Sign Out",
      subtitle: "Log out from this device",
      icon: <SignOut width={42} height={42} />,
      tone: "danger",
    },
  ];
}

/* ───── Notification settings ───── */

export type NotificationSettingsState = {
  pollingUnitActivity: boolean;
  electionDayAlert: boolean;
  discussionReplies: boolean;
  resultsAggregated: boolean;
  resultsElectionDayAlert: boolean;
  reportConfirmed: boolean;
  reportFlagged: boolean;
  securityAlerts: boolean;
  newsletters: boolean;
};

export const defaultNotificationSettings: NotificationSettingsState = {
  pollingUnitActivity: true,
  electionDayAlert: false,
  discussionReplies: false,
  resultsAggregated: false,
  resultsElectionDayAlert: false,
  reportConfirmed: false,
  reportFlagged: true,
  securityAlerts: false,
  newsletters: true,
};

/* ───── Citizen Academy ───── */

export type AcademyItem = {
  id: string;
  title: string;
  category: string;
  readTime: string;
  description: string;
  content: string;
};

export const citizenAcademyItems: AcademyItem[] = [
  {
    id: "pvc-guide",
    title: "PVC Registration Guide",
    category: "Essential",
    readTime: "5 MIN READ",
    description:
      "Step-by-step process on how to register and collect your Permanent Voter Card.",
    content:
      "The Permanent Voter Card (PVC) is the primary identity document for every voter in Nigeria. Without it, you cannot cast your ballot.\n\nStep 1: Check your registration status on the official INEC portal. If you are not registered, wait for the Continuous Voter Registration (CVR) window.\n\nStep 2: Visit your local government headquarters or designated registration center with a valid ID (National ID, Drivers License, or Passport).\n\nStep 3: Provide your biometric data (fingerprints and facial capture) to the registration officer.\n\nStep 4: Collect your Temporary Voter Card (TVC). You will be notified by SMS or Email when your PVC is ready for collection.",
  },
  {
    id: "voters-right",
    title: "Know Voters Right",
    category: "Essential",
    readTime: "5 MIN READ",
    description:
      "Understand what you can and cannot do at the polling unit as a citizen.",
    content:
      "Every citizen has the right to vote freely without intimidation. You have the right to observe the counting process and to challenge any irregularity you witness.",
  },
  {
    id: "incident-reporting",
    title: "Incident Reporting",
    category: "Essential",
    readTime: "5 MIN READ",
    description:
      "How to accurately document and report irregularities during elections.",
    content:
      "When reporting an incident, capture photographic or video evidence. Note the time, location, and names of any officials present. Submit through the Citizen Monitors app immediately.",
  },
  {
    id: "electoral-act",
    title: "Electoral Act 2022",
    category: "LAW",
    readTime: "5 MIN READ",
    description:
      "Full legal framework governing the conduct of elections in Nigeria.",
    content:
      "The Electoral Act 2022 (as amended) is the principal legislation governing elections in Nigeria. Key provisions include electronic transmission of results, BVAS for voter accreditation, and penalties for electoral offences.",
  },
  {
    id: "voters-handbook",
    title: "Voter's Handbook 2027 Edition",
    category: "Security",
    readTime: "5 MIN READ",
    description:
      "Step-by-step process on how to register and collect your Permanent Voter Card.",
    content:
      "This comprehensive handbook covers everything from registration to voting day procedures.",
  },
];

/* ───── Archive Reports ───── */

export type ArchiveReportItem = {
  id: string;
  type: "result" | "incident";
  title: string;
  date: string;
  time: string;
  partySummary?: string;
  evidenceLabel?: string;
  evidenceType?: "photo" | "video";
};

export type ArchiveElection = {
  id: string;
  title: string;
  location: string;
  electionType: string;
  reports: ArchiveReportItem[];
};

export const archiveData = {
  totalResults: 12,
  totalIncidents: 24,
  totalElections: 3,
  elections: [
    {
      id: "ae-1",
      title: "Lagos Governorship 2026",
      location: "Ikotun Primary School, PU 024 · Alimosho",
      electionType: "Gubernatorial",
      reports: [
        { id: "ar-1", type: "result" as const, title: "Result Report — EC8A", date: "Mar 20, 2027", time: "11:58am", partySummary: "APC 847 · PDP 612 · LP 234 · NNPP 42" },
        { id: "ar-2", type: "incident" as const, title: "Incident — Ballot Stuffing", date: "Mar 20, 2027", time: "11:58am", evidenceLabel: "Video evidence uploaded", evidenceType: "video" as const },
        { id: "ar-3", type: "incident" as const, title: "Incident — Underage Voting", date: "Mar 20, 2027", time: "11:58am", evidenceLabel: "Photo evidence uploaded", evidenceType: "photo" as const },
      ],
    },
    {
      id: "ae-2",
      title: "House of Representative election 2026",
      location: "Ikotun Primary School, PU 024 · Alimosho",
      electionType: "House of Reps",
      reports: [
        { id: "ar-4", type: "result" as const, title: "Result Report — EC8A", date: "Mar 20, 2027", time: "11:58am", partySummary: "APC 847 · PDP 612 · LP 234 · NNPP 42" },
      ],
    },
    {
      id: "ae-3",
      title: "Presidential election 2026",
      location: "Alimosho LG Area 4, PU 024 · Alimosho",
      electionType: "Presidential",
      reports: [
        { id: "ar-7", type: "result" as const, title: "Result Report — EC8A", date: "Mar 20, 2027", time: "11:58am", partySummary: "APC 847 · PDP 612 · LP 234 · NNPP 42" },
      ],
    },
  ],
};