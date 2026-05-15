import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { Theme } from "@/theme";
import { CalendarDayItem } from "@/types/home";

type Props = {
  items: CalendarDayItem[];
  selectedKey: string;
  monthLabel: string;
  onSelect: (item: CalendarDayItem) => void;
};

function DayCircle({
  item,
  active,
  onPress,
}: {
  item: CalendarDayItem;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.dayCircle,
        active && styles.dayCircleActive,
        pressed && styles.pressed,
      ]}
    >
      <AppText style={[styles.weekday, active && styles.weekdayActive]}>
        {item.weekdayShort}
      </AppText>

      <AppText style={[styles.dayNumber, active && styles.dayNumberActive]}>
        {item.dayNumber}
      </AppText>

      {active ? <View style={styles.activeDot} /> : null}
    </Pressable>
  );
}

export default function HomeCalendarStrip({
  items,
  selectedKey,
  monthLabel,
  onSelect,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.push(Paths.appElectionCalendar)}
          hitSlop={8}
          style={styles.calendarLink}
        >
          <AppText style={styles.calendarLinkText}>Election Calendar</AppText>
          <Ionicons
            name="chevron-forward"
            size={17}
            color={Theme.colors.primary}
          />
        </Pressable>

        <AppText style={styles.monthText}>{monthLabel}</AppText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContent}
      >
        {items.map((item) => (
          <DayCircle
            key={item.key}
            item={item}
            active={item.key === selectedKey}
            onPress={() => onSelect(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  calendarLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  calendarLinkText: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  monthText: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  daysContent: {
    gap: 14,
    paddingRight: 16,
  },

  dayCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: "#DDE4EC",
    backgroundColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },

  dayCircleActive: {
    borderColor: Theme.colors.primary,
    borderWidth: 1.8,
    backgroundColor: "rgba(5,163,156,0.04)",
  },

  weekday: {
    fontSize: 9,
    lineHeight: 12,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.bold,
  },

  weekdayActive: {
    color: Theme.colors.primary,
  },

  dayNumber: {
    fontSize: 16,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  dayNumberActive: {
    color: Theme.colors.primary,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
    marginTop: 1,
  },

  pressed: {
    opacity: 0.72,
  },
});