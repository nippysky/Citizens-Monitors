import { View } from "react-native";

import Feedback from "@/svgs/profile/Feedback";
import Notification from "@/svgs/profile/Notification";
import Profile from "@/svgs/profile/Profile";
import PUCheck from "@/svgs/profile/PUCheck";
import Security from "@/svgs/profile/Security";
import Support from "@/svgs/profile/Support";
import { ReactNode } from "react";

export type MeUser = {
  fullName: string;
  roleLabel: string;
  verificationStatus: "pending" | "verified";
  showRegistrationCard: boolean;
  registrationTitle: string;
  registrationSubtitle: string;
  registrationActionLabel?: string;
};

export type MeMenuItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  tone?: "default" | "danger";
};

/**
 * DEV / TEST OVERRIDE
 * - true  => always show My Reports
 * - false => follow actual verification logic
 */
export const SHOW_REPORTS_IN_TEST_MODE = true;

export const mockMeUser: MeUser = {
  fullName: "Ifeoluwa Ajetomobi",
  roleLabel: "Observer at Alimosho PU",
  verificationStatus: "pending",
  showRegistrationCard: true,
  registrationTitle: "Observer Registration",
  registrationSubtitle: "Complete your registration",
  registrationActionLabel: undefined,
};

const allProfileItems: MeMenuItem[] = [
  {
    id: "personal-profile",
    title: "Personal Profile",
    subtitle: "Edit your profile information",
    icon: <Profile width={42} height={42} />,
  },
  {
    id: "my-reports",
    title: "My Reports",
    subtitle: "Review your submitted PU reports",
    icon: <PUCheck width={42} height={42} />,
  },
  {
    id: "security",
    title: "Security",
    subtitle: "Set new login password",
    icon: <Security width={42} height={42} />,
  },
  {
    id: "polling-unit",
    title: "My Polling Unit",
    subtitle: "PU 024, Alimosho",
    icon: <PUCheck width={42} height={42} />,
  },
];

export function getMeProfileItems(user: MeUser): MeMenuItem[] {
  const canSeeReports =
    SHOW_REPORTS_IN_TEST_MODE || user.verificationStatus === "verified";

  return allProfileItems.filter((item) => {
    if (item.id === "my-reports") {
      return canSeeReports;
    }

    return true;
  });
}

export const meOtherItems: MeMenuItem[] = [
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
    icon: <View />,
    tone: "danger",
  },
];