import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import TutorialBanner from "@/components/onboarding/TutorialBanner";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  onComplete: (payload: { frontPvcUri: string; backPvcUri: string }) => void;
  onSkip: () => void;
};

type UploadCardProps = {
  label: string;
  uri: string | null;
  onPick: () => void;
  onRemove: () => void;
};

async function pickImageFromLibrary(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return null;
  }

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
}

function UploadCard({
  label,
  uri,
  onPick,
  onRemove,
}: UploadCardProps) {
  return (
    <View style={styles.uploadBlock}>
      <AppText style={styles.uploadLabel}>{label}</AppText>

      <Pressable onPress={onPick} style={[styles.uploadCard, uri && styles.uploadCardFilled]}>
        {uri ? (
          <>
            <Image source={{ uri }} style={styles.previewImage} />

            <Pressable onPress={onRemove} hitSlop={10} style={styles.removeButton}>
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

export default function OnboardingVerifyIdetity({
  onComplete,
  onSkip,
}: Props) {
  const [frontPvcUri, setFrontPvcUri] = useState<string | null>(null);
  const [backPvcUri, setBackPvcUri] = useState<string | null>(null);

  const handlePickFront = async (): Promise<void> => {
    const uri = await pickImageFromLibrary();

    if (uri) {
      setFrontPvcUri(uri);
    }
  };

  const handlePickBack = async (): Promise<void> => {
    const uri = await pickImageFromLibrary();

    if (uri) {
      setBackPvcUri(uri);
    }
  };

  const handleFinish = (): void => {
    if (!frontPvcUri || !backPvcUri) return;

    onComplete({
      frontPvcUri,
      backPvcUri,
    });
  };

  const canFinish = Boolean(frontPvcUri && backPvcUri);

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <AppText variant="title" style={styles.heading}>
          Verify Your Identity
        </AppText>

        <AppText style={styles.subheading}>
          Upload both sides of your permanents voter&apos;s card (PVC) to unlock
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
          onPick={handlePickFront}
          onRemove={() => setFrontPvcUri(null)}
        />

        <UploadCard
          label="Back of PVC"
          uri={backPvcUri}
          onPick={handlePickBack}
          onRemove={() => setBackPvcUri(null)}
        />
      </View>

      <View style={styles.buttonGroup}>
        <AppButton
          title="Finish Setup"
          onPress={handleFinish}
          disabled={!canFinish}
          style={styles.primaryButton}
        />

        <AppButton
          title="Skip For Now (Limited Access)"
          variant="secondary"
          onPress={onSkip}
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
    gap: 6,
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
    height: 260,
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