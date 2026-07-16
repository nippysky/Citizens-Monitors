import { Ionicons } from "@expo/vector-icons";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { stageMediaFile } from "@/lib/offlineMedia";
import {
  getIncidentDraft,
  saveIncidentDraft,
  saveLiveVideoUri,
} from "@/lib/reporting";

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
      const staged = await stageMediaFile({
        sourceUri: uri,
        kind: "video",
        mimeType: "video/mp4",
      });

      await saveLiveVideoUri(staged.localUri);

      const draft = await getIncidentDraft();
      if (draft) {
        await saveIncidentDraft({
          ...draft,
          liveVideoUri: staged.localUri,
        });
      }

      router.replace(Paths.reportIncidentLiveReview);
    } finally {
      if (isMountedRef.current) {
        setSaving(false);
      }
    }
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
        maxDuration: 180,
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

  const hasFullPermission =
    cameraPermission?.granted === true && microphonePermission?.granted === true;

  if (!cameraPermission || !microphonePermission) {
    return <View style={styles.loadingScreen} />;
  }

  if (!hasFullPermission) {
    return (
      <View style={styles.permissionWrap}>
        <AppText style={styles.permissionTitle}>
          Camera and microphone needed
        </AppText>

        <AppText style={styles.permissionSubtitle}>
          Please allow camera and microphone access so you can record live incident video with sound.
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

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        mode="video"
        onCameraReady={() => setCameraReady(true)}
      />

      <View
        style={[
          styles.topOverlay,
          {
            paddingTop: Math.max(insets.top, 12),
          },
        ]}
      >
        <Pressable onPress={discardRecording} style={styles.topBackBtn}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>

        <View style={styles.topMeta}>
          <AppText style={styles.topMetaTitle}>Live Incident Recording</AppText>
          <AppText style={styles.topMetaSubtitle}>
            {incidentType || "Incident type not selected"}
          </AppText>
        </View>
      </View>

      {!cameraReady ? (
        <View style={styles.readyOverlay}>
          <AppText style={styles.readyText}>Preparing camera...</AppText>
        </View>
      ) : null}

      <View
        style={[
          styles.bottomControls,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.statusRow}>
          <View style={[styles.liveDot, recording && styles.liveDotActive]} />
          <AppText style={styles.statusText}>
            {saving
              ? "Saving video..."
              : recording
                ? "Recording live..."
                : cameraReady
                  ? "Camera ready"
                  : "Preparing camera..."}
          </AppText>
        </View>

        <View style={styles.recordingControlsRow}>
          {!recording ? (
            <Pressable
              onPress={startRecording}
              style={[
                styles.startBtn,
                (!cameraReady || saving || permissionBusy) &&
                  styles.startBtnDisabled,
              ]}
              disabled={!cameraReady || saving || permissionBusy}
            >
              <Ionicons name="radio-button-on" size={14} color="#FFFFFF" />
              <AppText style={styles.startText}>
                {saving
                  ? "Saving..."
                  : permissionBusy
                    ? "Preparing..."
                    : "Start Recording"}
              </AppText>
            </Pressable>
          ) : (
            <Pressable onPress={stopRecording} style={styles.stopBtn}>
              <Ionicons name="square" size={11} color="#FFFFFF" />
              <AppText style={styles.stopText}>Stop & Submit</AppText>
            </Pressable>
          )}

          <Pressable
            onPress={discardRecording}
            style={[styles.discardBtn, saving && styles.discardBtnDisabled]}
            disabled={saving}
          >
            <Ionicons name="close" size={18} color="#5C6470" />
            <AppText style={styles.discardText}>
              {recording ? "Discard" : "Cancel"}
            </AppText>
          </Pressable>
        </View>
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

  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  topBackBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },

  topMeta: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  topMetaTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter-SemiBold",
  },

  topMetaSubtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter-Medium",
  },

  readyOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.18)",
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
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: "rgba(247, 246, 242, 0.94)",
    gap: 10,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#B8BDC7",
  },

  liveDotActive: {
    backgroundColor: "#F84C00",
  },

  statusText: {
    color: "#3D4652",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "Inter-SemiBold",
  },

  recordingControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  startBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#05A39C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    flexDirection: "row",
    gap: 10,
  },

  startBtnDisabled: {
    backgroundColor: "#8DBFBC",
  },

  startText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter-SemiBold",
  },

  stopBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#F84C00",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    flexDirection: "row",
    gap: 10,
  },

  stopText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter-SemiBold",
  },

  discardBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: "#F7F7F5",
    borderWidth: 1.2,
    borderColor: "#6B7280",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
  },

  discardBtnDisabled: {
    opacity: 0.7,
  },

  discardText: {
    color: "#5C6470",
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "Inter-Medium",
  },

  permissionWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
    backgroundColor: "#F7F4EA",
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