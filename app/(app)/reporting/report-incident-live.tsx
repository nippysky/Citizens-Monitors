import { Ionicons } from "@expo/vector-icons";
import {
  CameraType,
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { useAppToast } from "@/hooks/useAppToast";
import { stageMediaFile } from "@/lib/offlineMedia";
import {
  buildCommencementContext,
  buildInitialIncidentDraft,
  getIncidentDraft,
  saveIncidentDraft,
  saveLiveVideoUri,
} from "@/lib/reporting";

const MAX_RECORDING_SECONDS = 180;

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Pulsing red dot + elapsed timer — TikTok/IG-live style recording badge. */
function RecordingBadge({ elapsedSec }: { elapsedSec: number }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0.25, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    return () => cancelAnimation(pulse);
  }, [pulse]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View style={styles.recBadge}>
      <Animated.View style={[styles.recDot, dotStyle]} />
      <AppText style={styles.recBadgeText}>
        {`${formatClock(elapsedSec)} / ${formatClock(MAX_RECORDING_SECONDS)}`}
      </AppText>
    </View>
  );
}

/**
 * Center record control — white ring with a red core that morphs from a
 * circle (idle) into a rounded square (recording), like TikTok/Instagram.
 */
function RecordButton({
  recording,
  disabled,
  onPress,
}: {
  recording: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(recording ? 1 : 0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, recording]);

  const innerStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [58, 30]),
    height: interpolate(progress.value, [0, 1], [58, 30]),
    borderRadius: interpolate(progress.value, [0, 1], [29, 8]),
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.recordOuter, disabled && styles.recordOuterDisabled]}
      accessibilityRole="button"
      accessibilityLabel={recording ? "Stop recording" : "Start recording"}
    >
      <Animated.View style={[styles.recordInner, innerStyle]} />
    </Pressable>
  );
}

export default function ReportIncidentLiveScreen() {
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();

  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [saving, setSaving] = useState(false);
  const [incidentType, setIncidentType] = useState("");
  const [permissionBusy, setPermissionBusy] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [facing, setFacing] = useState<CameraType>("back");

  const { showToast } = useAppToast();

  const isMountedRef = useRef(true);
  const discardRequestedRef = useRef(false);
  const recordingRef = useRef(false);
  const savingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    const hydrate = async () => {
      const draft = await getIncidentDraft();
      if (!isMountedRef.current) return;
      setIncidentType(draft?.incidentType ?? "");
    };

    void hydrate();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  // Recording timer — drives the REC badge.
  useEffect(() => {
    if (!recording) {
      setElapsedSec(0);
      return;
    }

    const startedAt = Date.now();
    const interval = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);

    return () => clearInterval(interval);
  }, [recording]);

  const requestAllPermissions = useCallback(async () => {
    if (permissionBusy) {
      return Boolean(
        cameraPermission?.granted === true &&
          microphonePermission?.granted === true
      );
    }

    setPermissionBusy(true);

    try {
      const cam = cameraPermission?.granted
        ? cameraPermission
        : await requestCameraPermission();

      const mic = microphonePermission?.granted
        ? microphonePermission
        : await requestMicrophonePermission();

      return Boolean(cam?.granted && mic?.granted);
    } finally {
      if (isMountedRef.current) {
        setPermissionBusy(false);
      }
    }
  }, [
    cameraPermission,
    microphonePermission,
    permissionBusy,
    requestCameraPermission,
    requestMicrophonePermission,
  ]);

  const saveRecordingResult = useCallback(async (uri: string) => {
    if (savingRef.current) return;

    setSaving(true);

    try {
      // stageMediaFile MOVES the file (same-volume rename) — effectively
      // instant, so the review screen opens with the video immediately.
      const staged = await stageMediaFile({
        sourceUri: uri,
        kind: "video",
        mimeType: "video/mp4",
      });

      await saveLiveVideoUri(staged.localUri);

      // Self-heal like submit-election-report: NEVER navigate to review
      // without a persisted draft — a missing draft is what left the review
      // screen hanging on "Preparing report..." forever. If storage came back
      // empty for any reason, rebuild a baseline draft so the recorded video
      // is never lost.
      const stored = await getIncidentDraft();
      const base = stored ?? buildInitialIncidentDraft(buildCommencementContext());

      await saveIncidentDraft({
        ...base,
        liveVideoUri: staged.localUri,
      });

      router.replace(Paths.reportIncidentLiveReview);
    } catch {
      showToast({
        type: "error",
        message: "Could not process the recording. Please try again.",
      });
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    if (recordingRef.current || savingRef.current) return;
    if (!cameraReady) return;

    const granted = await requestAllPermissions();
    if (!granted) return;
    if (!cameraRef.current) return;

    try {
      discardRequestedRef.current = false;
      setRecording(true);

      const result = await cameraRef.current.recordAsync({
        maxDuration: MAX_RECORDING_SECONDS,
        // iOS: H.264 — universally playable and required for the
        // videoBitrate prop on CameraView to take effect.
        codec: Platform.OS === "ios" ? "avc1" : undefined,
      });

      if (isMountedRef.current) {
        setRecording(false);
      }

      if (!result?.uri) return;

      if (discardRequestedRef.current) {
        router.back();
        return;
      }

      await saveRecordingResult(result.uri);
    } catch {
      if (isMountedRef.current) {
        setRecording(false);
      }
    }
  }, [cameraReady, requestAllPermissions, saveRecordingResult]);

  const stopRecording = useCallback(() => {
    if (!recordingRef.current) return;

    try {
      cameraRef.current?.stopRecording();
    } catch {
      if (isMountedRef.current) {
        setRecording(false);
      }
    }
  }, []);

  const discardRecording = useCallback(() => {
    if (savingRef.current) return;

    if (recordingRef.current) {
      discardRequestedRef.current = true;

      try {
        cameraRef.current?.stopRecording();
      } catch {
        if (isMountedRef.current) {
          setRecording(false);
        }
        router.back();
      }

      return;
    }

    router.back();
  }, []);

  const toggleFacing = useCallback(() => {
    if (recordingRef.current || savingRef.current) return;
    // Force a full camera re-init (see key={facing} on CameraView) — simply
    // flipping the `facing` prop is unreliable on some Android devices while
    // mode="video", leaving the button seemingly dead.
    setCameraReady(false);
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const hasFullPermission =
    cameraPermission?.granted === true && microphonePermission?.granted === true;

  if (!cameraPermission || !microphonePermission) {
    return <View style={styles.loadingScreen} />;
  }

  if (!hasFullPermission) {
    return (
      <View style={styles.permissionWrap}>
        <View style={styles.permissionIconCircle}>
          <Ionicons name="videocam-outline" size={34} color="#05A39C" />
        </View>

        <AppText style={styles.permissionTitle}>
          Camera and microphone needed
        </AppText>

        <AppText style={styles.permissionSubtitle}>
          Please allow camera and microphone access so you can record live
          incident video with sound.
        </AppText>

        <Pressable
          onPress={requestAllPermissions}
          style={[
            styles.permissionBtn,
            permissionBusy && styles.permissionBtnDisabled,
          ]}
          disabled={permissionBusy}
        >
          <AppText style={styles.permissionBtnText}>
            {permissionBusy ? "Requesting..." : "Grant access"}
          </AppText>
        </Pressable>
      </View>
    );
  }

  const statusText = saving
    ? "Processing your video..."
    : recording
      ? "Recording — tap the button to stop"
      : cameraReady
        ? "Tap the record button to start"
        : "Preparing camera...";

  return (
    <View style={styles.container}>
      <CameraView
        // Remount on flip — guarantees the facing change takes effect on
        // every device (prop-only changes are flaky on some Android models).
        key={facing}
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
        // 720p @ ~2.5 Mbps keeps a 3-minute clip around 50-60 MB — light
        // enough to stage, preview and upload instantly (TikTok/IG-style)
        // instead of freezing the app on a heavy 1080p/4K file.
        videoQuality="720p"
        videoBitrate={2_500_000}
        onCameraReady={() => setCameraReady(true)}
      />

      {/* Legibility fades — content stays full-bleed, controls stay readable */}
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.18)", "transparent"]}
        style={styles.topFade}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["transparent", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.72)"]}
        style={styles.bottomFade}
      />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
        <Pressable
          onPress={discardRecording}
          style={styles.glassCircle}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>

        <View style={styles.topTitleWrap}>
          <AppText style={styles.topTitle}>Live Incident</AppText>
          <AppText style={styles.topSubtitle} numberOfLines={1}>
            {incidentType || "Incident type not selected"}
          </AppText>
        </View>

        <Pressable
          onPress={toggleFacing}
          style={[
            styles.glassCircle,
            (recording || saving) && styles.glassCircleDisabled,
          ]}
          disabled={recording || saving}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Flip camera"
        >
          <Ionicons name="camera-reverse-outline" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* REC badge */}
      {recording ? (
        <View
          pointerEvents="none"
          style={[
            styles.recBadgeWrap,
            { top: Math.max(insets.top, 12) + 64 },
          ]}
        >
          <RecordingBadge elapsedSec={elapsedSec} />
        </View>
      ) : null}

      {/* Camera warm-up */}
      {!cameraReady ? (
        <View style={styles.readyOverlay}>
          <ActivityIndicator color="#FFFFFF" />
          <AppText style={styles.readyText}>Preparing camera...</AppText>
        </View>
      ) : null}

      {/* Bottom controls */}
      <View
        style={[
          styles.bottomControls,
          { paddingBottom: Math.max(insets.bottom, 16) + 10 },
        ]}
      >
        <AppText style={styles.statusText}>{statusText}</AppText>

        <View style={styles.controlsRow}>
          <Pressable
            onPress={discardRecording}
            disabled={saving}
            style={[styles.sideBtn, saving && styles.sideBtnDisabled]}
            accessibilityRole="button"
            accessibilityLabel={recording ? "Discard recording" : "Cancel"}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>

          <RecordButton
            recording={recording}
            disabled={!cameraReady || saving || permissionBusy}
            onPress={recording ? stopRecording : () => void startRecording()}
          />

          <View style={styles.sideBtn}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <AppText style={styles.maxLenText}>
                {formatClock(MAX_RECORDING_SECONDS)}
              </AppText>
            )}
          </View>
        </View>

        <AppText style={styles.hintText}>
          {recording
            ? "Your video is recording with sound"
            : "Video records with sound · up to 3 minutes"}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: "#000000",
  },

  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  camera: {
    flex: 1,
  },

  topFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },

  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
  },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  glassCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  glassCircleDisabled: {
    opacity: 0.4,
  },

  topTitleWrap: {
    flex: 1,
    alignItems: "center",
    gap: 1,
  },

  topTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter-SemiBold",
    letterSpacing: 0.2,
  },

  topSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter-Medium",
    maxWidth: 220,
  },

  recBadgeWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },

  recBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(15,23,42,0.62)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },

  recDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
  },

  recBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 17,
    fontFamily: "Inter-SemiBold",
    letterSpacing: 0.6,
    fontVariant: ["tabular-nums"],
  },

  readyOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  readyText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter-SemiBold",
  },

  bottomControls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 16,
  },

  statusText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter-SemiBold",
    letterSpacing: 0.2,
  },

  controlsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  sideBtnDisabled: {
    opacity: 0.4,
  },

  maxLenText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter-SemiBold",
    fontVariant: ["tabular-nums"],
  },

  recordOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  recordOuterDisabled: {
    opacity: 0.45,
  },

  recordInner: {
    backgroundColor: "#FF3B30",
  },

  hintText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter-Medium",
  },

  permissionWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 14,
    backgroundColor: "#F7F4EA",
  },

  permissionIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(5,163,156,0.10)",
    borderWidth: 1.5,
    borderColor: "rgba(5,163,156,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  permissionTitle: {
    fontSize: 20,
    lineHeight: 26,
    color: "#111827",
    fontFamily: "LeagueSpartan-Bold",
    textAlign: "center",
  },

  permissionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
    fontFamily: "Inter-Regular",
    textAlign: "center",
    maxWidth: 320,
  },

  permissionBtn: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#05A39C",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  permissionBtnDisabled: {
    opacity: 0.7,
  },

  permissionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 18,
    fontFamily: "Inter-SemiBold",
  },
});
