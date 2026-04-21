import type { ReactNode } from "react";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TourTarget from "@/components/tour/TourTarget";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type TabIconProps = {
  focused: boolean;
  label: string;
  icon: (color: string) => ReactNode;
};

function TabIcon({ focused, label, icon }: TabIconProps) {
  const iconColor = focused ? "#FFFFFF" : Theme.colors.textMuted;
  const labelColor = focused ? Theme.colors.primary : Theme.colors.textMuted;

  return (
    <View style={styles.tabIconWrap}>
      <View style={[styles.iconPill, focused && styles.iconPillActive]}>
        {icon(iconColor)}
      </View>

      <AppText
        style={[
          styles.tabLabel,
          { color: labelColor },
          focused && styles.tabLabelActive,
        ]}
        numberOfLines={1}
        ellipsizeMode="clip"
      >
        {label}
      </AppText>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const bottomInset =
    Platform.OS === "ios" ? insets.bottom : Math.max(insets.bottom, 8);
  const tabBarHeight = 64 + bottomInset;

  return (
    <Tabs
      tabBar={(props) => (
        <TourTarget id="app.tabbar">
          <BottomTabBar {...props} />
        </TourTarget>
      )}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingTop: 10,
            paddingBottom: bottomInset,
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIconStyle,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Home"
              icon={(c) => <AntDesign name="home" size={21} color={c} />}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="elections"
        options={{
          title: "Elections",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Elections"
              icon={(c) => (
                <MaterialCommunityIcons
                  name="vote-outline"
                  size={24}
                  color={c}
                />
              )}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="collation"
        options={{
          title: "Collation",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Collation"
              icon={(c) => (
                <Ionicons name="filter-outline" size={21} color={c} />
              )}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="pulse"
        options={{
          title: "Pulse",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Pulse"
              icon={(c) => <Octicons name="megaphone" size={20} color={c} />}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="Me"
              icon={(c) => <Ionicons name="person-outline" size={21} color={c} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1.5,
    borderTopColor: "rgba(5, 163, 156, 0.22)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },

  tabBarItem: {
    justifyContent: "center",
    alignItems: "center",
  },

  tabBarIconStyle: {
    marginBottom: 0,
  },

  tabIconWrap: {
    width: 62,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  iconPill: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  iconPillActive: {
    backgroundColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },

  tabLabel: {
    fontSize: 10.5,
    lineHeight: 13,
    textAlign: "center",
    fontFamily: Theme.fonts.body.medium,
  },

  tabLabelActive: {
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.primary,
  },
});