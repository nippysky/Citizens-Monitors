import { CameraView } from "expo-camera";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { ensureCameraPermission } from "@/lib/permissions";
import {
  getIncidentDraft,
  saveIncidentDraft,
  saveLiveVideoUri,
} from "@/lib/reporting";

export default function ReportIncidentLiveScreen() {
  const cameraRef = useRef<CameraView>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      const granted = await ensureCameraPermission();
      if (mounted) {
        setHasPermission(granted);
      }
    };

    void checkPermission();

    return () => {
      mounted = false;
    };
  }, []);

  const requestAgain = async () => {
    const granted = await ensureCameraPermission();
    setHasPermission(granted);
  };

  const startRecording = async () => {
    if (!hasPermission || recording) return;

    try {
      setRecording(true);

      const result = await cameraRef.current?.recordAsync({
        maxDuration: 180,
      });

      if (result?.uri) {
        await saveLiveVideoUri(result.uri);

        const draft = await getIncidentDraft();
        if (draft) {
          await saveIncidentDraft({
            ...draft,
            liveVideoUri: result.uri,
          });
        }

        router.replace(Paths.reportIncident);
        return;
      }

      setRecording(false);
    } catch {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      cameraRef.current?.stopRecording();
      setRecording(false);
    } catch {
      setRecording(false);
    }
  };

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

      <View style={styles.bottomControls}>
        {recording ? (
          <>
            <Pressable onPress={stopRecording} style={styles.stopBtn}>
              <AppText style={styles.stopText}>■ Stop & Submit</AppText>
            </Pressable>

            <Pressable
              onPress={() => {
                stopRecording();
                router.back();
              }}
              style={styles.discardBtn}
            >
              <AppText style={styles.discardText}>✕ Discard</AppText>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={startRecording} style={styles.startBtn}>
            <AppText style={styles.startText}>◉ Start Recording</AppText>
          </Pressable>
        )}
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
    left: 16,
    right: 16,
    bottom: 26,
    flexDirection: "row",
    gap: 12,
  },
  startBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#F84C00",
    alignItems: "center",
    justifyContent: "center",
  },
  startText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Inter-SemiBold",
  },
  stopBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#F84C00",
    alignItems: "center",
    justifyContent: "center",
  },
  stopText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Inter-SemiBold",
  },
  discardBtn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  discardText: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "Inter-SemiBold",
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