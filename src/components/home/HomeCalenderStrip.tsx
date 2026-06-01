import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Animated,
  Easing,
  FlatList,
  ListRenderItemInfo,
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
  todayKey: string;
  monthLabel: string;
  onSelect: (item: CalendarDayItem) => void;
};

const CARD_SIZE = 64;
const CARD_GAP = 12;
const EDGE_PADDING = 16;
const ITEM_SIZE = CARD_SIZE + CARD_GAP;

type DayChipProps = {
  item: CalendarDayItem;
  selected: boolean;
  today: boolean;
  onPress: () => void;
};

function DayChip({ item, selected, today, onPress }: DayChipProps) {
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
            today && !selected && styles.dayWrapToday,
            {
              transform: [{ scale: pressed ? 0.985 : scale }],
            },
          ]}
        >
          <AppText
            style={[
              styles.weekday,
              today && styles.weekdayToday,
              selected && styles.weekdaySelected,
            ]}
          >
            {item.weekdayShort}
          </AppText>

          <AppText
            style={[
              styles.dayNumber,
              today && styles.dayNumberToday,
              selected && styles.dayNumberSelected,
            ]}
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
  todayKey,
  monthLabel,
  onSelect,
}: Props) {
  const listRef = useRef<FlatList<CalendarDayItem>>(null);
  const centerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoScrolledRef = useRef(false);

  const { width } = useWindowDimensions();

  const selectedIndex = useMemo(
    () => items.findIndex((item) => item.key === selectedKey),
    [items, selectedKey]
  );

  const todayIndex = useMemo(
    () => items.findIndex((item) => item.key === todayKey),
    [items, todayKey]
  );

  const targetIndex = selectedIndex >= 0 ? selectedIndex : todayIndex;

  const contentWidth = useMemo(() => {
    if (items.length === 0) return 0;

    return (
      EDGE_PADDING * 2 +
      items.length * CARD_SIZE +
      Math.max(0, items.length - 1) * CARD_GAP
    );
  }, [items.length]);

  const maxScrollOffset = useMemo(() => {
    return Math.max(0, contentWidth - width);
  }, [contentWidth, width]);

  const getCenteredOffset = useCallback(
    (index: number) => {
      const itemCenter =
        EDGE_PADDING + index * ITEM_SIZE + CARD_SIZE / 2;

      const rawOffset = itemCenter - width / 2;

      return Math.min(Math.max(rawOffset, 0), maxScrollOffset);
    },
    [maxScrollOffset, width]
  );

  const scrollToIndexSafely = useCallback(
    (index: number, animated: boolean) => {
      if (index < 0 || items.length === 0) return;

      const safeIndex = Math.min(Math.max(index, 0), items.length - 1);
      const offset = getCenteredOffset(safeIndex);

      if (centerTimerRef.current) {
        clearTimeout(centerTimerRef.current);
      }

      centerTimerRef.current = setTimeout(() => {
        requestAnimationFrame(() => {
          listRef.current?.scrollToOffset({
            offset,
            animated,
          });
        });
      }, 60);
    },
    [getCenteredOffset, items.length]
  );

  useEffect(() => {
    if (hasAutoScrolledRef.current) return;
    if (targetIndex < 0) return;

    hasAutoScrolledRef.current = true;
    scrollToIndexSafely(targetIndex, false);

    return () => {
      if (centerTimerRef.current) {
        clearTimeout(centerTimerRef.current);
      }
    };
  }, [scrollToIndexSafely, targetIndex]);

  useFocusEffect(
    useCallback(() => {
      if (targetIndex >= 0) {
        scrollToIndexSafely(targetIndex, false);
      }

      return () => {
        if (centerTimerRef.current) {
          clearTimeout(centerTimerRef.current);
        }
      };
    }, [scrollToIndexSafely, targetIndex])
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CalendarDayItem>) => {
      const selected = item.key === selectedKey;
      const today = item.key === todayKey;

      return (
        <DayChip
          item={item}
          selected={selected}
          today={today}
          onPress={() => {
            onSelect(item);

            const nextIndex = items.findIndex((day) => day.key === item.key);
            scrollToIndexSafely(nextIndex, true);
          }}
        />
      );
    },
    [items, onSelect, scrollToIndexSafely, selectedKey, todayKey]
  );

  const itemSeparator = useCallback(() => {
    return <View style={styles.itemSeparator} />;
  }, []);

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
          alwaysBounceHorizontal={false}
          overScrollMode="never"
          contentInsetAdjustmentBehavior="never"
          contentContainerStyle={styles.rowContent}
          ItemSeparatorComponent={itemSeparator}
          getItemLayout={(_, index) => ({
            length: ITEM_SIZE,
            offset: ITEM_SIZE * index,
            index,
          })}
          renderItem={renderItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 13,
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
    paddingLeft: EDGE_PADDING,
    paddingRight: EDGE_PADDING,
  },

  itemSeparator: {
    width: CARD_GAP,
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
    gap: 1,
  },

  dayWrapIdle: {
    borderColor: "#D9DEE8",
    backgroundColor: "rgba(255,255,255,0.32)",
  },

  dayWrapToday: {
    borderColor: "rgba(25,183,176,0.45)",
    backgroundColor: "rgba(25,183,176,0.045)",
  },

  dayWrapSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(25,183,176,0.07)",
  },

  weekday: {
    fontSize: 9.5,
    lineHeight: 12,
    fontFamily: Theme.fonts.body.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.24,
    color: Theme.colors.textMuted,
  },

  weekdayToday: {
    color: Theme.colors.primary,
  },

  weekdaySelected: {
    color: Theme.colors.primary,
  },

  dayNumber: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: Theme.fonts.heading.bold,
    letterSpacing: -0.22,
    color: Theme.colors.text,
  },

  dayNumberToday: {
    color: Theme.colors.primary,
  },

  dayNumberSelected: {
    color: Theme.colors.primary,
  },

  activeDot: {
    position: "absolute",
    bottom: 7,
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },
});