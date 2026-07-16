import type { ReactNode } from "react";
import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
// expo-router SDK 57 ships its own fork of @react-navigation — import from
// there so Metro's compatibility check (which blocks @react-navigation/core)
// is never triggered.
import { BottomTabBar } from "expo-router/build/react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";

import TourTarget from "@/components/tour/TourTarget";
import AppText from "@/components/ui/AppText";
import { useTabBarLayout } from "@/hooks/useTabBarLayout";
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
  const { bottomInset, tabBarHeight } = useTabBarLayout();

  return (
    <Tabs
      tabBar={(props) => (
        <View style={styles.tabBarHost}>
          <BottomTabBar {...props} />

          <View
            pointerEvents="none"
            style={[styles.tabBarTourLayer, { height: tabBarHeight }]}
          >
            <TourTarget id="app.tabbar">
              <View
                style={[
                  styles.tabBarTourTarget,
                  {
                    height: tabBarHeight,
                  },
                ]}
              />
            </TourTarget>
          </View>
        </View>
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
  tabBarHost: {
    // position: 'absolute' + bottom/left/right restores SDK 54 behaviour:
    // the tab bar overlays the bottom of the screen (MaybeScreenContainer gets
    // full flex:1 height), so screens are not cut short and TabBarSpacer keeps
    // working as before. Without this, the SDK 57 expo-router fork renders the
    // tab bar in normal flow, stealing height from screens and leaving visible
    // empty space at the bottom of every tab screen.
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
  },

  tabBarTourLayer: {
    ...StyleSheet.absoluteFill,
    top: undefined,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },

  tabBarTourTarget: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "transparent",
  },

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