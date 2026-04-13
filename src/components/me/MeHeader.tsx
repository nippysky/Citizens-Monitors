// ─── src/components/me/MeHeader.tsx ───────────────────────────────────────────
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import type { MeUser } from "@/data/me";
import CitizenIcon from "@/svgs/app/CitizenIcon";
import ProfilePhoto from "@/svgs/app/profile/ProfilePhoto";
import { Theme } from "@/theme";

type Props = { user: MeUser };

export default function MeHeader({ user }: Props) {
  const showStatus =
    user.userType === "observer" && user.verificationStatus !== "none";
  const isVerified = user.verificationStatus === "verified";

  return (
    <View style={styles.wrap}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <CitizenIcon width={28} height={28} />
        <Pressable
          style={styles.iconButton}
          onPress={() => router.push(Paths.appNotifications)}
        >
          <Ionicons name="notifications-outline" size={21} color={Theme.colors.text} />
        </Pressable>
      </View>

      {/* Profile row */}
      <View style={styles.profileRow}>
        <View style={styles.avatarWrap}>
          {user.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
          ) : (
            <ProfilePhoto width={80} height={80} />
          )}
        </View>

        <View style={styles.profileTextWrap}>
          <AppText style={styles.name}>{user.fullName}</AppText>
          <AppText style={styles.roleText}>{user.roleLabel}</AppText>

          {/* Username */}
          <View style={styles.usernameRow}>
            <AppText style={styles.usernameLabel}>Username: </AppText>
            <AppText style={styles.usernameValue}>• {user.username}</AppText>
          </View>

          {/* Verification status (observer only) */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#EEF2F6" },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  profileTextWrap: { flex: 1, gap: 2 },
  name: { fontSize: 22, lineHeight: 26, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },
  roleText: { fontSize: 13, lineHeight: 18, color: "rgba(17,26,50,0.68)", fontFamily: Theme.fonts.body.medium },
  usernameRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  usernameLabel: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },
  usernameValue: { fontSize: 13, lineHeight: 18, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 999 },
  statusText: { fontSize: 13, lineHeight: 18, fontFamily: Theme.fonts.body.semibold },
});