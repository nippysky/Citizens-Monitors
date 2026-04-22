import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

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

const CARD_SIZE = 74;
const CARD_GAP = 14;
const ITEM_SIZE = CARD_SIZE + CARD_GAP;

type DayChipProps = {
  item: CalendarDayItem;
  selected: boolean;
  onPress: () => void;
};

function DayChip({ item, selected, onPress }: DayChipProps) {
  const scale = useRef(new Animated.Value(selected ? 1 : 0.96)).current;
  const dotOpacity = useRef(new Animated.Value(selected ? 1 : 0)).current;
  const dotScale = useRef(new Animated.Value(selected ? 1 : 0.82)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: selected ? 1 : 0.96,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dotOpacity, {
        toValue: selected ? 1 : 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dotScale, {
        toValue: selected ? 1 : 0.82,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [dotOpacity, dotScale, scale, selected]);

  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.dayPressable}>
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.dayWrap,
            selected ? styles.dayWrapSelected : styles.dayWrapIdle,
            {
              transform: [{ scale: pressed ? 0.985 : scale }],
            },
          ]}
        >
          <AppText style={[styles.weekday, selected && styles.weekdaySelected]}>
            {item.weekdayShort}
          </AppText>

          <AppText
            style={[styles.dayNumber, selected && styles.dayNumberSelected]}
          >
            {item.dayNumber}
          </AppText>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeDot,
              {
                opacity: dotOpacity,
                transform: [{ scale: dotScale }],
              },
            ]}
          />
        </Animated.View>
      )}
    </Pressable>
  );
}

export default function HomeCalendarStrip({
  items,
  selectedKey,
  monthLabel,
  onSelect,
}: Props) {
  const listRef = useRef<FlatList<CalendarDayItem>>(null);
  const hasInitialCenteredRef = useRef(false);
  const { width } = useWindowDimensions();

  const sidePadding = useMemo(
    () => Math.max(16, width / 2 - CARD_SIZE / 2 - 6),
    [width]
  );

  const selectedIndex = useMemo(
    () => items.findIndex((item) => item.key === selectedKey),
    [items, selectedKey]
  );

  useEffect(() => {
    if (selectedIndex < 0) return;
    if (hasInitialCenteredRef.current) return;

    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: false,
        viewPosition: 0.5,
      });
      hasInitialCenteredRef.current = true;
    }, 40);

    return () => clearTimeout(timer);
  }, [selectedIndex]);

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Pressable
          style={({ pressed }) => [
            styles.calendarLink,
            pressed && styles.calendarLinkPressed,
          ]}
          onPress={() => router.push(Paths.appElectionCalendar)}
          hitSlop={8}
        >
          <AppText style={styles.calendarLinkText}>Election Calendar</AppText>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Theme.colors.primary}
          />
        </Pressable>

        <AppText style={styles.monthLabel}>{monthLabel}</AppText>
      </View>

      <View style={styles.rowWrap}>
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces
          overScrollMode="never"
          decelerationRate="fast"
          snapToInterval={ITEM_SIZE}
          disableIntervalMomentum
          contentContainerStyle={[
            styles.rowContent,
            { paddingHorizontal: sidePadding },
          ]}
          getItemLayout={(_, index) => ({
            length: ITEM_SIZE,
            offset: ITEM_SIZE * index,
            index,
          })}
          initialScrollIndex={selectedIndex >= 0 ? selectedIndex : undefined}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: false,
              });
            }, 60);
          }}
          renderItem={({ item }) => {
            const selected = item.key === selectedKey;

            return (
              <DayChip
                item={item}
                selected={selected}
                onPress={() => onSelect(item)}
              />
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  calendarLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  calendarLinkPressed: {
    opacity: 0.74,
  },

  calendarLinkText: {
    fontSize: 15.5,
    lineHeight: 20,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.primary,
    letterSpacing: -0.15,
  },

  monthLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
    letterSpacing: -0.1,
  },

  rowWrap: {
    marginHorizontal: -16,
  },

  rowContent: {
    gap: CARD_GAP,
  },

  dayPressable: {
    width: CARD_SIZE,
  },

  dayWrap: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: CARD_SIZE / 2,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },

  dayWrapIdle: {
    borderColor: "#D9DEE8",
    backgroundColor: "rgba(255,255,255,0.32)",
  },

  dayWrapSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(25,183,176,0.06)",
  },

  weekday: {
    fontSize: 10.5,
    lineHeight: 13,
    fontFamily: Theme.fonts.body.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.25,
    color: Theme.colors.textMuted,
  },

  weekdaySelected: {
    color: Theme.colors.primary,
  },

  dayNumber: {
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Theme.fonts.heading.bold,
    letterSpacing: -0.25,
    color: Theme.colors.text,
  },

  dayNumberSelected: {
    color: Theme.colors.primary,
  },

  activeDot: {
    position: "absolute",
    bottom: 9,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },
});