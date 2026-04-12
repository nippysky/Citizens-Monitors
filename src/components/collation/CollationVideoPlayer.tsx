// ─── src/components/collation/CollationVideoPlayer.tsx ────────────────────────
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  uri: string;
  title?: string;
  subtitle?: string;
  posterMode?: boolean;
};

export default function CollationVideoPlayer({
  uri,
  title,
  subtitle,
  posterMode = false,
}: Props) {
  const [activated, setActivated] = useState(false);

  if (posterMode && !activated) {
    return (
      <Pressable onPress={() => setActivated(true)} style={styles.posterWrap}>
        <View style={styles.posterContent}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={24} color={Theme.colors.primary} />
          </View>
          {title ? <AppText style={styles.posterTitle}>{title}</AppText> : null}
          {subtitle ? <AppText style={styles.posterSubtitle}>{subtitle}</AppText> : null}
        </View>
      </Pressable>
    );
  }

  return <ActivePlayer uri={uri} />;
}

function ActivePlayer({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = false;
  });

  return (
    <View style={styles.videoWrap}>
      <VideoView
        player={player}
        style={styles.video}
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  posterWrap: {
    minHeight: 180,
    backgroundColor: "#F0F4F8",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 20,
  },
  posterContent: { alignItems: "center", gap: 8 },
  playCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(5,163,156,0.12)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
  },
  posterTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
  },
  posterSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 220,
  },
  videoWrap: { width: "100%", aspectRatio: 16 / 9 },
  video: { flex: 1 },
});