import { Ionicons } from "@expo/vector-icons";
import { CameraView } from "expo-camera";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { ensureCameraPermission } from "@/lib/permissions";
import { stageMediaFile } from "@/lib/offlineMedia";
import {
  getIncidentDraft,
  saveIncidentDraft,
  saveLiveVideoUri,
} from "@/lib/reporting";

export default function ReportIncidentLiveScreen() {
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [hasStartedAttempt, setHasStartedAttempt] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      const granted = await ensureCameraPermission();
      if (!mounted) return;

      setHasPermission(granted);
    };

    void checkPermission();

    return () => {
      mounted = false;
    };
  }, []);

  const requestAgain = useCallback(async () => {
    const granted = await ensureCameraPermission();
    setHasPermission(granted);
  }, []);

  const startRecording = useCallback(async () => {
    if (!hasPermission || recording) return;

    try {
      setRecording(true);

      const result = await cameraRef.current?.recordAsync({
        maxDuration: 180,
      });

      if (result?.uri) {
        const staged = await stageMediaFile({
          sourceUri: result.uri,
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

        router.replace(Paths.reportIncident);
        return;
      }

      setRecording(false);
    } catch {
      setRecording(false);
    }
  }, [hasPermission, recording]);

  useEffect(() => {
    if (hasPermission !== true) return;
    if (hasStartedAttempt) return;

    setHasStartedAttempt(true);

    const timer = setTimeout(() => {
      void startRecording();
    }, 250);

    return () => clearTimeout(timer);
  }, [hasPermission, hasStartedAttempt, startRecording]);

  const stopRecording = useCallback(() => {
    try {
      cameraRef.current?.stopRecording();
    } catch {
      setRecording(false);
    }
  }, []);

  const discardRecording = useCallback(() => {
    try {
      if (recording) {
        cameraRef.current?.stopRecording();
      }
    } catch {
      // no-op
    } finally {
      setRecording(false);
      router.back();
    }
  }, [recording]);

  if (hasPermission === null) {
    return <View style={styles.loadingScreen} />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionWrap}>
        <AppText style={styles.permissionTitle}>Camera access needed</AppText>

        <Pressable onPress={requestAgain} style={styles.permissionBtn}>
          <AppText style={styles.permissionBtnText}>
            Grant camera access
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
      />

      <View
        style={[
          styles.bottomControls,
          {
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.recordingControlsRow}>
          <Pressable onPress={stopRecording} style={styles.stopBtn}>
            <Ionicons name="square" size={11} color="#FFFFFF" />
            <AppText style={styles.stopText}>Stop & Submit</AppText>
          </Pressable>

          <Pressable onPress={discardRecording} style={styles.discardBtn}>
            <Ionicons name="close" size={18} color="#5C6470" />
            <AppText style={styles.discardText}>Discard</AppText>
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

  bottomControls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "rgba(247, 246, 242, 0.94)",
  },

  recordingControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  stopBtn: {
    flex: 1,
    minHeight: 48,
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
    minHeight: 48,
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
  },

  permissionBtn: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "#05A39C",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  permissionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 18,
    fontFamily: "Inter-SemiBold",
  },
});