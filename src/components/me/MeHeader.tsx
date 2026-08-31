import { Image, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import type { MeUser } from "@/data/me";
import { Theme } from "@/theme";

type Props = { user: MeUser };

// The large PNG avatar fallback — only PNG used on this screen
const AVATAR_FALLBACK = require("../../../assets/images/me/ProfileAvatar.png")

export default function MeHeader({ user }: Props) {
  const showStatus =
    user.userType === "observer" && user.verificationStatus !== "none";
  const isVerified = user.verificationStatus === "verified";

  return (
    <View style={styles.wrap}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <Image
          source={user.avatarUri ? { uri: user.avatarUri } : AVATAR_FALLBACK}
          style={styles.avatar}
        />
      </View>

      {/* Text block */}
      <View style={styles.textWrap}>
        <AppText style={styles.name}>{user.fullName}</AppText>
        <AppText style={styles.role}>{user.roleLabel}</AppText>

        {/* Username row */}
        <View style={styles.usernameRow}>
          <AppText style={styles.usernameLabel}>Username: </AppText>
          <AppText style={styles.usernameValue}>• {user.username}</AppText>
        </View>

        {/* Verification status — observer only */}
        {showStatus ? (
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isVerified ? "#1E8E3E" : "#EE7A34" },
              ]}
            />
            <AppText
              style={[
                styles.statusText,
                { color: isVerified ? "#1E8E3E" : "#EE7A34" },
              ]}
            >
              {isVerified ? "Verified" : "Pending Verification"}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    overflow: "hidden",
    backgroundColor: "#E4EAF0",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 22,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  role: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(17,26,50,0.68)",
    fontFamily: Theme.fonts.body.medium,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  usernameLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
  usernameValue: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
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
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Theme.fonts.body.semibold,
  },
});