import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";

import TutorialBanner from "@/components/onboarding/TutorialBanner";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { useAppToast } from "@/hooks/useAppToast";
import { ensureMediaLibraryPermission } from "@/lib/permissions";
import { Theme } from "@/theme";

type Props = {
  loading?: boolean;
  onComplete: (payload: { frontPvcUri: string; backPvcUri: string }) => void;
  onSkip: () => void;
};

type UploadCardProps = {
  label: string;
  uri: string | null;
  disabled?: boolean;
  onPick: () => void;
  onRemove: () => void;
};

function UploadCard({
  label,
  uri,
  disabled,
  onPick,
  onRemove,
}: UploadCardProps) {
  return (
    <View style={styles.uploadBlock}>
      <AppText style={styles.uploadLabel}>{label}</AppText>

      <Pressable
        disabled={disabled}
        onPress={onPick}
        style={[
          styles.uploadCard,
          uri && styles.uploadCardFilled,
          disabled && styles.disabled,
        ]}
      >
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.previewImage} />

            <Pressable
              disabled={disabled}
              onPress={onRemove}
              hitSlop={10}
              style={styles.removeButton}
            >
              <Ionicons name="close" size={18} color="#FFFFFF" />
            </Pressable>
          </>
        ) : (
          <View style={styles.emptyUploadContent}>
            <View style={styles.emptyUploadIconWrap}>
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color={Theme.colors.textSoft}
              />
            </View>

            <AppText style={styles.emptyUploadText}>Upload Image</AppText>
          </View>
        )}
      </Pressable>
    </View>
  );
}

export default function OnboardingStepFourVerifyIdentity({
  loading = false,
  onComplete,
  onSkip,
}: Props) {
  const { showToast } = useAppToast();

  const [frontPvcUri, setFrontPvcUri] = useState<string | null>(null);
  const [backPvcUri, setBackPvcUri] = useState<string | null>(null);

  const pickImage = useCallback(async (): Promise<string | null> => {
    const ok = await ensureMediaLibraryPermission();
    if (!ok) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.9,
        selectionLimit: 1,
      });

      if (result.canceled || !result.assets?.length) {
        return null;
      }

      return result.assets[0].uri;
    } catch {
      showToast({
        type: "error",
        message: "Could not open gallery.",
      });
      return null;
    }
  }, [showToast]);

  const handlePickFront = useCallback(async (): Promise<void> => {
    if (loading) return;

    const uri = await pickImage();

    if (uri) {
      setFrontPvcUri(uri);
      showToast({
        type: "success",
        message: "Front PVC uploaded.",
      });
    }
  }, [loading, pickImage, showToast]);

  const handlePickBack = useCallback(async (): Promise<void> => {
    if (loading) return;

    const uri = await pickImage();

    if (uri) {
      setBackPvcUri(uri);
      showToast({
        type: "success",
        message: "Back PVC uploaded.",
      });
    }
  }, [loading, pickImage, showToast]);

  const handleFinish = (): void => {
    if (!frontPvcUri || !backPvcUri) {
      showToast({
        type: "error",
        message: "Upload both front and back PVC images.",
      });
      return;
    }

    onComplete({
      frontPvcUri,
      backPvcUri,
    });
  };

  const canFinish = Boolean(frontPvcUri && backPvcUri) && !loading;

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <AppText variant="title" style={styles.heading}>
          Verify Your Identity
        </AppText>

        <AppText style={styles.subheading}>
          Upload both sides of your permanent voter&apos;s card (PVC) to unlock
          full observer access.
        </AppText>
      </View>

      <TutorialBanner />

      <View style={styles.infoCard}>
        <Ionicons
          name="information-circle"
          size={20}
          color={Theme.colors.primary}
          style={styles.infoIcon}
        />
        <AppText style={styles.infoText}>
          Your PVC is encrypted and protected under NDPR 2019. Your PVC is just
          to show us you belong to the said polling unit you claimed.
        </AppText>
      </View>

      <View style={styles.form}>
        <UploadCard
          label="Front of PVC"
          uri={frontPvcUri}
          disabled={loading}
          onPick={handlePickFront}
          onRemove={() => {
            setFrontPvcUri(null);
            showToast({
              type: "success",
              message: "Front PVC removed.",
            });
          }}
        />

        <UploadCard
          label="Back of PVC"
          uri={backPvcUri}
          disabled={loading}
          onPick={handlePickBack}
          onRemove={() => {
            setBackPvcUri(null);
            showToast({
              type: "success",
              message: "Back PVC removed.",
            });
          }}
        />
      </View>

      <View style={styles.buttonGroup}>
        <AppButton
          title="Finish Setup"
          onPress={handleFinish}
          disabled={!canFinish}
          loading={loading}
          style={styles.primaryButton}
        />

        <AppButton
          title="Skip For Now (Limited Access)"
          variant="secondary"
          onPress={onSkip}
          disabled={loading}
          style={styles.secondaryButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
    paddingBottom: 12,
  },

  headerBlock: {
    gap: 8,
    marginTop: 22,
  },

  heading: {
    fontSize: 18,
    lineHeight: 24,
  },

  subheading: {
    color: Theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "rgba(25, 183, 176, 0.14)",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  infoIcon: {
    marginTop: 1,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.text,
  },

  form: {
    gap: 18,
  },

  uploadBlock: {
    gap: 10,
  },

  uploadLabel: {
    fontSize: 15,
    lineHeight: 21,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  uploadCard: {
    minHeight: 140,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#D9DEE8",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.52)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },

  uploadCardFilled: {
    borderStyle: "solid",
    borderColor: Theme.colors.primary,
    backgroundColor: "#FFFFFF",
  },

  disabled: {
    opacity: 0.7,
  },

  emptyUploadContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  emptyUploadIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(25, 183, 176, 0.10)",
  },

  emptyUploadText: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  previewImage: {
    width: "100%",
    height: 210,
    resizeMode: "cover",
  },

  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F15A24",
  },

  buttonGroup: {
    gap: 12,
    paddingTop: 2,
  },

  primaryButton: {
    marginVertical: 0,
  },

  secondaryButton: {
    marginVertical: 0,
  },
});