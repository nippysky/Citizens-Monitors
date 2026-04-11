import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import type { MeUser } from "@/data/me";
import CitizenIcon from "@/svgs/app/CitizenIcon";
import ProfilePhoto from "@/svgs/profile/ProfilePhoto";
import { Theme } from "@/theme";

type Props = {
  user: MeUser;
};

export default function MeHeader({ user }: Props) {
  const statusColor =
    user.verificationStatus === "verified" ? "#1E8E3E" : "#EE7A34";

  const statusLabel =
    user.verificationStatus === "verified"
      ? "Verified"
      : "Pending Verification";

  return (
    <View style={styles.wrap}>
      <View style={styles.topBar}>
        <CitizenIcon width={28} height={28} />

        <Pressable
          style={styles.iconButton}
          onPress={() => router.push(Paths.appNotifications)}
        >
          <Ionicons
            name="notifications-outline"
            size={21}
            color={Theme.colors.text}
          />
        </Pressable>
      </View>

      <View style={styles.profileRow}>
        <View style={styles.avatarWrap}>
          <ProfilePhoto width={92} height={92} />
        </View>

        <View style={styles.profileTextWrap}>
          <AppText style={styles.name}>{user.fullName}</AppText>
          <AppText style={styles.roleText}>{user.roleLabel}</AppText>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <AppText style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  iconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  avatarWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  profileTextWrap: {
    flex: 1,
    gap: 4,
  },

  name: {
    fontSize: 24,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  roleText: {
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(17,26,50,0.72)",
    fontFamily: Theme.fonts.body.medium,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },

  statusText: {
    fontSize: 13.5,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },
});