import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { CalendarDayItem } from "@/types/home";

type Props = {
  items: CalendarDayItem[];
  selectedKey: string;
  monthLabel: string;
  onSelect: (item: CalendarDayItem) => void;
};

export default function HomeCalendarStrip({
  items,
  selectedKey,
  monthLabel,
  onSelect,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.sectionTitle}>Election Calendar</AppText>
        <AppText style={styles.monthLabel}>{monthLabel}</AppText>
      </View>

      <View style={styles.row}>
        {items.map((item) => {
          const selected = item.key === selectedKey;

          return (
            <Pressable
              key={item.key}
              style={[styles.dayWrap, selected && styles.dayWrapSelected]}
              onPress={() => onSelect(item)}
            >
              <AppText style={[styles.weekday, selected && styles.weekdaySelected]}>
                {item.weekdayShort}
              </AppText>
              <AppText style={[styles.dayNumber, selected && styles.dayNumberSelected]}>
                {item.dayNumber}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.semibold,
  },
  monthLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  dayWrap: {
    flex: 1,
    minHeight: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    backgroundColor: "rgba(255,255,255,0.46)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  dayWrapSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(25, 183, 176, 0.08)",
  },
  weekday: {
    fontSize: 10,
    lineHeight: 13,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },
  weekdaySelected: {
    color: Theme.colors.primary,
  },
  dayNumber: {
    fontSize: 16,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  dayNumberSelected: {
    color: Theme.colors.primary,
  },
});