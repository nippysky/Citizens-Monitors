import { Animated, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useEffect, useMemo, useRef } from "react";

import AppText from "@/components/ui/AppText";
import type { ElectionScopeTab } from "@/data/elections";
import { Theme } from "@/theme";

type Props = {
  value: ElectionScopeTab;
  onChange: (value: ElectionScopeTab) => void;
};

const tabs: { key: ElectionScopeTab; label: string }[] = [
  { key: "polling-unit", label: "YOUR POLLING UNIT" },
  { key: "all-elections", label: "ALL ELECTIONS" },
];

export default function ElectionScopeTabs({ value, onChange }: Props) {
  const { width } = useWindowDimensions();
  const animatedIndex = useRef(
    new Animated.Value(value === "polling-unit" ? 0 : 1)
  ).current;

  useEffect(() => {
    Animated.timing(animatedIndex, {
      toValue: value === "polling-unit" ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [animatedIndex, value]);

  const containerWidth = useMemo(() => width - 32, [width]); // parent has 16px horizontal padding
  const tabWidth = useMemo(() => containerWidth / 2, [containerWidth]);

  const indicatorWidth = useMemo(() => tabWidth * 0.62, [tabWidth]);
  const indicatorInset = useMemo(() => (tabWidth - indicatorWidth) / 2, [indicatorWidth, tabWidth]);

  const translateX = animatedIndex.interpolate({
    inputRange: [0, 1],
    outputRange: [indicatorInset, tabWidth + indicatorInset],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {tabs.map((tab) => {
          const active = value === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={styles.tab}
            >
              <AppText style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.track} />

      <Animated.View
        style={[
          styles.indicator,
          {
            width: indicatorWidth,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    paddingBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  tab: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },

  tabText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.semibold,
  },

  tabTextActive: {
    color: Theme.colors.primary,
  },

  track: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: "#DCE2E8",
  },

  indicator: {
    position: "absolute",
    bottom: 0,
    height: 3.5,
    borderRadius: 999,
    backgroundColor: Theme.colors.primary,
  },
});