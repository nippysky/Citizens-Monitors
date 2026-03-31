import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type TabIconProps = {
  focused: boolean;
  color: string;
  label: string;
  icon: React.ReactNode;
};

function TabIcon({ focused, color, label, icon }: TabIconProps) {
  return (
    <View style={styles.tabIconWrap}>
      <View style={[styles.iconPill, focused && styles.iconPillActive]}>
        {icon}
      </View>

      <AppText
        style={[styles.tabLabel, focused && styles.tabLabelActive]}
        numberOfLines={1}
        ellipsizeMode="clip"
      >
        {label}
      </AppText>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: styles.tabBarIconStyle,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Home"
              icon={<Ionicons name="home-outline" size={22} color={color} />}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="elections"
        options={{
          title: "Elections",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Elections"
              icon={
                <MaterialCommunityIcons
                  name="vote-outline"
                  size={24}
                  color={color}
                />
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="collation"
        options={{
          title: "Collation",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Collation"
              icon={<Ionicons name="filter-outline" size={22} color={color} />}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Alerts"
              icon={
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={color}
                />
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              color={color}
              label="Me"
              icon={<Ionicons name="person-outline" size={22} color={color} />}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? 86 : 74,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 14 : 8,
    backgroundColor: "#FBFBF7",
    borderTopWidth: 1,
    borderTopColor: "rgba(25, 183, 176, 0.16)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },

  tabBarItem: {
    paddingVertical: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  tabBarIconStyle: {
    marginBottom: 0,
  },

  tabIconWrap: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  iconPill: {
    minWidth: 38,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  iconPillActive: {
    backgroundColor: "rgba(25, 183, 176, 0.12)",
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  tabLabel: {
    width: 64,
    textAlign: "center",
    fontSize: 10.5,
    lineHeight: 13,
    color: Theme.colors.textMuted,
  },

  tabLabelActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});