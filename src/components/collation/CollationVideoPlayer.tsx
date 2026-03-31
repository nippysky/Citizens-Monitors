import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

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
  title = "Video evidence ready",
  subtitle = "Tap to load and play this video",
  posterMode = true,
}: Props) {
  const [isActivated, setIsActivated] = useState(!posterMode);

  const player = useVideoPlayer(
    useMemo(() => ({ uri }), [uri]),
    (instance) => {
      instance.loop = false;
    }
  );

  if (!isActivated) {
    return (
      <Pressable
        onPress={() => setIsActivated(true)}
        style={styles.previewCard}
      >
        <View style={styles.previewIconWrap}>
          <Ionicons name="play" size={24} color={Theme.colors.primary} />
        </View>

        <View style={styles.previewTextWrap}>
          <AppText style={styles.previewTitle}>{title}</AppText>
          <AppText style={styles.previewSubtitle}>{subtitle}</AppText>
        </View>

        <View style={styles.previewPill}>
          <AppText style={styles.previewPillText}>Load video</AppText>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.wrap}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture={false}
        nativeControls
        contentFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    height: 220,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#EDEFF3",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  previewCard: {
    minHeight: 220,
    borderRadius: 18,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E5EAF1",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 14,
  },

  previewIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EAFBF9",
    alignItems: "center",
    justifyContent: "center",
  },

  previewTextWrap: {
    alignItems: "center",
    gap: 4,
  },

  previewTitle: {
    fontSize: 16,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
    textAlign: "center",
  },

  previewSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 240,
  },

  previewPill: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: Theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  previewPillText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.body.semibold,
  },
});