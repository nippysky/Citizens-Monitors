import { Platform } from "react-native";

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: "#111827",
      shadowOpacity: 0.06,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  soft: Platform.select({
    ios: {
      shadowColor: "#111827",
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
};