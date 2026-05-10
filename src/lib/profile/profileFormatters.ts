import { MyProfileResponse } from "@/lib/api/profile.api";
import { BirthdayValue, Gender } from "@/types/onboarding";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function getProfileFullName(profile: MyProfileResponse): string {
  const name = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || profile.email || "Citizen";
}

export function toBirthdayValue(dateOfBirth?: string): BirthdayValue {
  if (!dateOfBirth) {
    return {
      day: 1,
      month: "January",
      year: 2000,
      formatted: "1 January, 2000",
    };
  }

  const date = new Date(dateOfBirth);

  if (Number.isNaN(date.getTime())) {
    return {
      day: 1,
      month: "January",
      year: 2000,
      formatted: "1 January, 2000",
    };
  }

  const day = date.getUTCDate();
  const month = MONTH_NAMES[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return {
    day,
    month,
    year,
    formatted: `${day} ${month}, ${year}`,
  };
}

export function toGender(value?: string): Gender {
  if (value === "Male" || value === "Female") {
    return value;
  }

  return "";
}

export function getResidence(profile: MyProfileResponse): string {
  return [profile.lga, profile.state].filter(Boolean).join(", ");
}