import type { ImageSourcePropType } from "react-native";

export type IntroSlideItem = {
  id: string;
  title: string;
  description: string;
  cta: string;
  phoneImage: ImageSourcePropType;
};

export const INTRO_SLIDES: IntroSlideItem[] = [
  {
    id: "slide-1",
    title: "Every Election, Results\nDisappear.",
    description:
      "Citizen Monitors changes that. Every result submitted here becomes a permanent, geo-tagged, legally admissible record. Forever.",
    cta: "PROCEED",
    phoneImage: require("../../assets/images/onboarding/O1.png"),
  },
  {
    id: "slide-2",
    title: "One Nation. Thousands\nOf Eyes. One Truth.",
    description:
      "Citizen Monitors turns every registered voter into an accountability agent. Report results, flag incidents, & let Nigeria watch in real time.",
    cta: "PROCEED",
    phoneImage: require("../../assets/images/onboarding/O2.png"),
  },
  {
    id: "slide-3",
    title: "Connect To Your Circle.\nChange Begins Locally",
    description:
      "Talk, build rapport, and create meaningful connections that bring your community closer and stronger every day.",
    cta: "GET STARTED",
    phoneImage: require("../../assets/images/onboarding/O3.png"),
  },
];