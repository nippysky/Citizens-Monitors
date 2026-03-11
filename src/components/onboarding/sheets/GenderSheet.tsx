import { Ionicons } from "@expo/vector-icons";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import Female from "@/svgs/Female";
import Male from "@/svgs/Male";
import { Theme } from "@/theme";
import { Gender } from "@/types/onboarding";

type Props = {
  selected: Gender;
  onSelect: (value: Gender) => void;
  onConfirm: () => void;
};

const GenderSheet = forwardRef<BottomSheetModal, Props>(function GenderSheet(
  { selected, onSelect, onConfirm },
  ref
) {
  const insets = useSafeAreaInsets();

  const dismiss = () => {
    if (ref && typeof ref !== "function" && ref.current) {
      ref.current.dismiss();
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={["46%"]}
      topInset={insets.top + 12}
      enablePanDownToClose
      backgroundStyle={styles.sheetBgTransparent}
      handleIndicatorStyle={styles.sheetHandle}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.32}
        />
      )}
    >
      <BottomSheetView style={styles.sheetWrap}>
        <View style={styles.header}>
          <AppText variant="title" style={styles.title}>
            Select Your Gender
          </AppText>

          <Pressable onPress={dismiss} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.content}>
          <View style={styles.grid}>
            <Pressable
              style={[styles.card, selected === "Male" && styles.cardActive]}
              onPress={() => onSelect("Male")}
            >
              <Male width={84} height={84} />
              <AppText style={styles.label}>Male</AppText>
              {selected === "Male" ? (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={16} color={Theme.colors.primary} />
                </View>
              ) : null}
            </Pressable>

            <Pressable
              style={[styles.card, selected === "Female" && styles.cardActive]}
              onPress={() => onSelect("Female")}
            >
              <Female width={84} height={84} />
              <AppText style={styles.label}>Female</AppText>
              {selected === "Female" ? (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={16} color={Theme.colors.primary} />
                </View>
              ) : null}
            </Pressable>
          </View>

          <AppButton
            title="Confirm Your Gender"
            disabled={!selected}
            onPress={onConfirm}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default GenderSheet;

const styles = StyleSheet.create({
  sheetBgTransparent: {
    backgroundColor: "transparent",
  },
  sheetHandle: {
    backgroundColor: "rgba(17, 26, 50, 0.12)",
    width: 44,
  },
  sheetWrap: {
    flex: 1,
    backgroundColor: "#FBF8EA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  header: {
    minHeight: 76,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#D9DEE8",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 18,
  },
  grid: {
    flexDirection: "row",
    gap: 14,
  },
  card: {
    flex: 1,
    minHeight: 164,
    borderWidth: 1,
    borderColor: "#D9DEE8",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    position: "relative",
  },
  cardActive: {
    borderColor: Theme.colors.primary,
  },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E8FBF8",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.textMuted,
  },
});