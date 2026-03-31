import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import AppBottomSheet from "@/components/ui/AppBottomSheet";
import AppButton from "@/components/ui/AppButton";
import AppInput from "@/components/ui/AppInput";
import AppText from "@/components/ui/AppText";
import {
  PickedMedia,
  ResolvedLocation,
  useCollationMedia,
} from "@/hooks/useCollationMedia";
import { useAppToast } from "@/hooks/useAppToast";
import { Theme } from "@/theme";

type Props = {
  onSubmitted?: () => void;
};

type BusyAction =
  | "location"
  | "take-photo"
  | "upload-photo"
  | "record-video"
  | "upload-video"
  | "submit"
  | null;

const FlagReportBottomSheet = forwardRef<BottomSheetModal, Props>(
  function FlagReportBottomSheet({ onSubmitted }, ref) {
    const { showToast } = useAppToast();
    const {
      busy,
      capturePhoto,
      captureVideo,
      pickImageFromGallery,
      pickVideoFromGallery,
      resolveCurrentLocation,
    } = useCollationMedia();

    const [reason, setReason] = useState("");
    const [imageAsset, setImageAsset] = useState<PickedMedia | null>(null);
    const [videoAsset, setVideoAsset] = useState<PickedMedia | null>(null);
    const [locationInfo, setLocationInfo] = useState<ResolvedLocation | null>(null);
    const [busyAction, setBusyAction] = useState<BusyAction>(null);

    const canSubmit = useMemo(() => {
      return reason.trim().length > 8 && !!locationInfo && !!imageAsset;
    }, [reason, locationInfo, imageAsset]);

    const resetForm = () => {
      setReason("");
      setImageAsset(null);
      setVideoAsset(null);
      setLocationInfo(null);
      setBusyAction(null);
    };

    const closeSheet = () => {
      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    const enableLocation = async () => {
      setBusyAction("location");
      const result = await resolveCurrentLocation();
      setBusyAction(null);

      if (!result.ok) {
        showToast({
          type: "error",
          message: result.error,
        });
        return;
      }

      if (!result.data) return;

      setLocationInfo(result.data);
      showToast({
        type: "success",
        message: "Location confirmed successfully.",
      });
    };

    const handleTakePhoto = async () => {
      setBusyAction("take-photo");
      const result = await capturePhoto();
      setBusyAction(null);

      if (!result.ok) {
        showToast({
          type: "error",
          message: result.error,
        });
        return;
      }

      if (!result.data) return;

      setImageAsset(result.data);
      showToast({
        type: "success",
        message: "Image evidence added.",
      });
    };

    const handleUploadPhoto = async () => {
      setBusyAction("upload-photo");
      const result = await pickImageFromGallery();
      setBusyAction(null);

      if (!result.ok) {
        showToast({
          type: "error",
          message: result.error,
        });
        return;
      }

      if (!result.data) return;

      setImageAsset(result.data);
      showToast({
        type: "success",
        message: "Image evidence selected.",
      });
    };

    const handleRecordVideo = async () => {
      setBusyAction("record-video");
      const result = await captureVideo();
      setBusyAction(null);

      if (!result.ok) {
        showToast({
          type: "error",
          message: result.error,
        });
        return;
      }

      if (!result.data) return;

      setVideoAsset(result.data);
      showToast({
        type: "success",
        message: "Video evidence added.",
      });
    };

    const handleUploadVideo = async () => {
      setBusyAction("upload-video");
      const result = await pickVideoFromGallery();
      setBusyAction(null);

      if (!result.ok) {
        showToast({
          type: "error",
          message: result.error,
        });
        return;
      }

      if (!result.data) return;

      setVideoAsset(result.data);
      showToast({
        type: "success",
        message: "Video evidence selected.",
      });
    };

    const handleSubmit = async () => {
      if (!canSubmit) {
        showToast({
          type: "error",
          message: "Add your reason, verify location, and attach image evidence before submitting.",
        });
        return;
      }

      setBusyAction("submit");

      setTimeout(() => {
        setBusyAction(null);
        showToast({
          type: "success",
          message: "Your flag report has been submitted for review.",
        });
        resetForm();
        onSubmitted?.();
        closeSheet();
      }, 500);
    };

    const locationReady = !!locationInfo;
    const imageReady = !!imageAsset;
    const videoReady = !!videoAsset;

    return (
      <AppBottomSheet ref={ref} title="Flagging Report" snapPoints={["92%"]}>
        <View style={styles.content}>
          <View style={styles.introCard}>
            <AppText style={styles.introTitle}>
              Your report helps ensure a transparent election process.
            </AppText>
            <AppText style={styles.introBody}>
              Provide a clear reason, verify your location, and attach strong
              supporting evidence before submitting.
            </AppText>
          </View>

          <View style={styles.progressRow}>
            <StatusPill
              label="Reason"
              complete={reason.trim().length > 8}
            />
            <StatusPill
              label="Location"
              complete={locationReady}
            />
            <StatusPill
              label="Image"
              complete={imageReady}
            />
            <StatusPill
              label="Video"
              complete={videoReady}
              optional
            />
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>Your Reason</AppText>
            <AppInput
              placeholder="Describe the issue or irregularity of this result in detail..."
              value={reason}
              onChangeText={setReason}
              multiline
              inputWrapperStyle={styles.textAreaWrap}
              style={styles.textArea}
            />
            <AppText style={styles.sectionHint}>
              Be factual, concise, and specific to what happened at your polling unit.
            </AppText>
          </View>

          <View style={styles.section}>
            <AppText style={styles.sectionLabel}>GPS Map Camera</AppText>

            <LocationCard
              busy={busy && busyAction === "location"}
              locationInfo={locationInfo}
              onEnable={enableLocation}
            />
          </View>

          <EvidenceCard
            title="Attach Image Evidence"
            subtitle="The picture uploaded must be a solid evidence at your polling unit."
            hint="Best for signed result sheets, incident scenes, or material shortages."
            primaryActionLabel="Take Photo"
            secondaryActionLabel="Upload from Gallery"
            onPrimaryAction={handleTakePhoto}
            onSecondaryAction={handleUploadPhoto}
            previewAsset={imageAsset}
            previewType="image"
            busy={busy && (busyAction === "take-photo" || busyAction === "upload-photo")}
            onRemove={() => setImageAsset(null)}
          />

          <EvidenceCard
            title="Attach Video Evidence"
            subtitle="Video must contain vocal proof to validate the video as authentic and verifiable."
            hint="Best for live incident proof, crowd context, or result announcement capture."
            primaryActionLabel="Record Live"
            secondaryActionLabel="Upload from Gallery"
            onPrimaryAction={handleRecordVideo}
            onSecondaryAction={handleUploadVideo}
            previewAsset={videoAsset}
            previewType="video"
            busy={busy && (busyAction === "record-video" || busyAction === "upload-video")}
            onRemove={() => setVideoAsset(null)}
          />

          <View style={styles.footerBlock}>
            <AppButton
              title={
                busyAction === "submit"
                  ? "Submitting Report..."
                  : "Proceed To Report"
              }
              onPress={handleSubmit}
              loading={busyAction === "submit"}
              disabled={!canSubmit || busy}
              style={styles.submitButton}
            />

            <AppText style={styles.submitHint}>
              Location metadata is attached when verified. Image evidence is required.
            </AppText>
          </View>
        </View>
      </AppBottomSheet>
    );
  }
);

export default FlagReportBottomSheet;

function StatusPill({
  label,
  complete,
  optional = false,
}: {
  label: string;
  complete: boolean;
  optional?: boolean;
}) {
  return (
    <View
      style={[
        styles.statusPill,
        complete && styles.statusPillComplete,
        optional && !complete && styles.statusPillOptional,
      ]}
    >
      <Ionicons
        name={complete ? "checkmark-circle" : optional ? "ellipse-outline" : "time-outline"}
        size={14}
        color={
          complete
            ? Theme.colors.primary
            : optional
              ? Theme.colors.textMuted
              : "#D97706"
        }
      />
      <AppText
        style={[
          styles.statusPillText,
          complete && styles.statusPillTextComplete,
        ]}
      >
        {label}
      </AppText>
    </View>
  );
}

function LocationCard({
  busy,
  locationInfo,
  onEnable,
}: {
  busy: boolean;
  locationInfo: ResolvedLocation | null;
  onEnable: () => void;
}) {
  const isReady = !!locationInfo;

  return (
    <View style={styles.locationCard}>
      <View style={styles.locationTop}>
        <View style={styles.pinWrap}>
          <Ionicons
            name={isReady ? "location" : "location-outline"}
            size={20}
            color={isReady ? Theme.colors.primary : "#E45858"}
          />
        </View>

        <View style={styles.locationTopText}>
          <AppText style={styles.locationTitle}>
            {isReady ? "Polling Area Verified" : "Enable your Location"}
          </AppText>
          <AppText style={styles.locationSubtitle}>
            {isReady
              ? "Your location has been captured and will be attached to this report."
              : "Please confirm you're at the polling unit by enabling your geo-locator."}
          </AppText>
        </View>
      </View>

      {busy ? (
        <View style={styles.locationLoadingCard}>
          <ActivityIndicator color={Theme.colors.primary} />
          <AppText style={styles.locationLoadingText}>
            Verifying polling area location...
          </AppText>
        </View>
      ) : isReady && locationInfo ? (
        <View style={styles.locationVerifiedWrap}>
          <View style={styles.mapCard}>
            <View style={styles.mapGrid} />
            <View style={styles.mapPin}>
              <Ionicons name="location" size={20} color="#E45858" />
            </View>
          </View>

          <View style={styles.locationMetaCard}>
            <View style={styles.locationMetaHeader}>
              <AppText style={styles.locationMetaTitle}>GPS Map Camera</AppText>
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={Theme.colors.primary}
                />
                <AppText style={styles.verifiedBadgeText}>Verified</AppText>
              </View>
            </View>

            <AppText style={styles.locationAddress}>
              {locationInfo.addressLabel}
            </AppText>

            <View style={styles.coordinatesRow}>
              <CoordinateChip
                label="Lat"
                value={locationInfo.latitude.toFixed(5)}
              />
              <CoordinateChip
                label="Lng"
                value={locationInfo.longitude.toFixed(5)}
              />
            </View>
          </View>
        </View>
      ) : (
        <AppButton
          title="Enable location"
          onPress={onEnable}
          style={styles.locationButton}
        />
      )}
    </View>
  );
}

function CoordinateChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.coordinateChip}>
      <AppText style={styles.coordinateLabel}>{label}</AppText>
      <AppText style={styles.coordinateValue}>{value}</AppText>
    </View>
  );
}

type EvidenceCardProps = {
  title: string;
  subtitle: string;
  hint: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  previewAsset: PickedMedia | null;
  previewType: "image" | "video";
  busy: boolean;
  onRemove: () => void;
};

function EvidenceCard({
  title,
  subtitle,
  hint,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  previewAsset,
  previewType,
  busy,
  onRemove,
}: EvidenceCardProps) {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionLabel}>{title}</AppText>

      <View style={styles.uploadCard}>
        <View style={styles.uploadCardHeader}>
          <View style={styles.uploadCardHeaderLeft}>
            <View style={styles.uploadIconWrap}>
              <Ionicons
                name={previewType === "image" ? "image-outline" : "videocam-outline"}
                size={20}
                color={Theme.colors.primary}
              />
            </View>

            <View style={styles.uploadCardHeaderText}>
              <AppText style={styles.uploadTitle}>
                {previewType === "image"
                  ? "Capture clear image evidence"
                  : "Capture live video evidence"}
              </AppText>
              <AppText style={styles.uploadHint}>{hint}</AppText>
            </View>
          </View>

          {previewAsset ? (
            <View style={styles.readyPill}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Theme.colors.primary}
              />
              <AppText style={styles.readyPillText}>Added</AppText>
            </View>
          ) : null}
        </View>

        {busy ? (
          <View style={styles.mediaLoadingWrap}>
            <ActivityIndicator color={Theme.colors.primary} />
            <AppText style={styles.mediaLoadingText}>
              {previewType === "image"
                ? "Preparing image capture..."
                : "Preparing video capture..."}
            </AppText>
          </View>
        ) : previewAsset ? (
          <View style={styles.previewWrap}>
            {previewType === "image" ? (
              <Image source={{ uri: previewAsset.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.videoPreviewCard}>
                <Ionicons
                  name="play-circle"
                  size={28}
                  color={Theme.colors.primary}
                />
                <AppText style={styles.videoPreviewTitle}>
                  Video evidence selected
                </AppText>
                <AppText style={styles.videoPreviewSubtext}>
                  Ready to attach to this report
                </AppText>
              </View>
            )}

            <Pressable onPress={onRemove} style={styles.removeButton}>
              <Ionicons
                name="trash-outline"
                size={16}
                color="#F04A1D"
              />
              <AppText style={styles.removeButtonText}>Remove</AppText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.emptyMediaState}>
            <Ionicons
              name={previewType === "image" ? "scan-outline" : "radio-outline"}
              size={22}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.emptyMediaStateText}>
              {previewType === "image"
                ? "No image evidence added yet."
                : "No video evidence added yet."}
            </AppText>
          </View>
        )}

        <View style={styles.actionRow}>
          <ActionButton
            title={primaryActionLabel}
            onPress={onPrimaryAction}
            icon={previewType === "image" ? "camera-outline" : "videocam-outline"}
            disabled={busy}
          />
          <ActionButton
            title={secondaryActionLabel}
            onPress={onSecondaryAction}
            icon="images-outline"
            secondary
            disabled={busy}
          />
        </View>
      </View>

      <AppText style={styles.uploadSubtitle}>{subtitle}</AppText>
    </View>
  );
}

function ActionButton({
  title,
  onPress,
  icon,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.actionButton,
        secondary && styles.actionButtonSecondary,
        disabled && styles.actionButtonDisabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={secondary ? Theme.colors.primary : Theme.colors.white}
      />
      <AppText
        style={[
          styles.actionButtonText,
          secondary && styles.actionButtonTextSecondary,
        ]}
      >
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },

  introCard: {
    borderRadius: 18,
    backgroundColor: "#F4FBFA",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.12)",
    padding: 14,
    gap: 6,
  },

  introTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  introBody: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },

  progressRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  statusPill: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "#FFF7E7",
    borderWidth: 1,
    borderColor: "#F6DEB0",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusPillComplete: {
    backgroundColor: "#EAFBF9",
    borderColor: "rgba(5,163,156,0.22)",
  },

  statusPillOptional: {
    backgroundColor: "#F5F6F8",
    borderColor: "#E2E8F0",
  },

  statusPillText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#B45309",
    fontFamily: Theme.fonts.body.semibold,
  },

  statusPillTextComplete: {
    color: Theme.colors.primary,
  },

  section: {
    gap: 10,
  },

  sectionLabel: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  textAreaWrap: {
    minHeight: 122,
    alignItems: "flex-start",
    paddingTop: 14,
  },

  textArea: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  sectionHint: {
    fontSize: 11,
    lineHeight: 16,
    color: Theme.colors.textMuted,
  },

  locationCard: {
    borderRadius: 22,
    backgroundColor: "#F9F6EA",
    borderWidth: 1,
    borderColor: "#EFE3B7",
    padding: 16,
    gap: 14,
  },

  locationTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  pinWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF1C7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  locationTopText: {
    flex: 1,
    gap: 4,
  },

  locationTitle: {
    fontSize: 18,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },

  locationSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  locationLoadingCard: {
    minHeight: 84,
    borderRadius: 18,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 14,
  },

  locationLoadingText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
    textAlign: "center",
  },

  locationVerifiedWrap: {
    gap: 12,
  },

  mapCard: {
    height: 134,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#DDEFF1",
    borderWidth: 1,
    borderColor: "#CDE2E7",
    alignItems: "center",
    justifyContent: "center",
  },

  mapGrid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
    borderRadius: 18,
    backgroundColor: "transparent",
  },

  mapPin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },

  locationMetaCard: {
    borderRadius: 16,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    padding: 12,
    gap: 10,
  },

  locationMetaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  locationMetaTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  verifiedBadge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "#EAFBF9",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  verifiedBadgeText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  locationAddress: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
  },

  coordinatesRow: {
    flexDirection: "row",
    gap: 10,
  },

  coordinateChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: Theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
    gap: 2,
  },

  coordinateLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
  },

  coordinateValue: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  locationButton: {
    marginVertical: 0,
  },

  uploadCard: {
    borderWidth: 1,
    borderColor: "#DDE7EF",
    backgroundColor: "#FCFDFC",
    borderRadius: 20,
    padding: 14,
    gap: 14,
  },

  uploadCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  uploadCardHeaderLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },

  uploadIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EAFBF9",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  uploadCardHeaderText: {
    flex: 1,
    gap: 4,
  },

  uploadTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  uploadHint: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },

  readyPill: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    backgroundColor: "#EAFBF9",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  readyPillText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  mediaLoadingWrap: {
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: "#F6FAFB",
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
  },

  mediaLoadingText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  previewWrap: {
    gap: 10,
  },

  previewImage: {
    width: "100%",
    height: 170,
    borderRadius: 16,
    resizeMode: "cover",
    backgroundColor: "#EEF2F6",
  },

  videoPreviewCard: {
    minHeight: 130,
    borderRadius: 16,
    backgroundColor: "#F6FAFB",
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
  },

  videoPreviewTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  videoPreviewSubtext: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  removeButton: {
    alignSelf: "flex-start",
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 12,
    backgroundColor: "#FFF1EC",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  removeButtonText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#F04A1D",
    fontFamily: Theme.fonts.body.semibold,
  },

  emptyMediaState: {
    minHeight: 92,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Theme.colors.borderSoft,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
  },

  emptyMediaStateText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },

  actionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },

  actionButtonSecondary: {
    backgroundColor: "#EAFBF9",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.18)",
  },

  actionButtonDisabled: {
    opacity: 0.6,
  },

  actionButtonText: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.white,
    fontFamily: Theme.fonts.body.semibold,
  },

  actionButtonTextSecondary: {
    color: Theme.colors.primary,
  },

  uploadSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: "#F04A1D",
  },

  footerBlock: {
    gap: 8,
    paddingTop: 2,
  },

  submitButton: {
    marginVertical: 0,
  },

  submitHint: {
    fontSize: 11,
    lineHeight: 16,
    color: Theme.colors.textMuted,
    textAlign: "center",
  },
});