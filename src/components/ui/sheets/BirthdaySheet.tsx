import { Ionicons } from "@expo/vector-icons";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Picker } from "@react-native-picker/picker";
import { forwardRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { BirthdayValue } from "@/types/onboarding";

type Props = {
  value: BirthdayValue;
  onChange: (value: BirthdayValue) => void;
  onConfirm: () => void;
};

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const YEARS = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i);

const BirthdaySheet = forwardRef<BottomSheetModal, Props>(function BirthdaySheet(
  { value, onChange, onConfirm },
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
      snapPoints={["72%"]}
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
            Your Birthday
          </AppText>

          <Pressable onPress={dismiss} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.content}>
          <View style={styles.labelsRow}>
            <AppText style={styles.label}>DAY</AppText>
            <AppText style={styles.label}>MONTH</AppText>
            <AppText style={styles.label}>YEAR</AppText>
          </View>

          <View style={styles.pickerRow}>
            <View style={styles.pickerCol}>
              <Picker
                selectedValue={value.day}
                onValueChange={(selected) =>
                  onChange({
                    ...value,
                    day: Number(selected),
                    formatted: `${Number(selected)} ${value.month}, ${value.year}`,
                  })
                }
                itemStyle={styles.pickerItem}
              >
                {DAYS.map((item) => (
                  <Picker.Item key={item} label={String(item)} value={item} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerCol}>
              <Picker
                selectedValue={value.month}
                onValueChange={(selected) =>
                  onChange({
                    ...value,
                    month: String(selected),
                    formatted: `${value.day} ${String(selected)}, ${value.year}`,
                  })
                }
                itemStyle={styles.pickerItem}
              >
                {MONTHS.map((item) => (
                  <Picker.Item key={item} label={item} value={item} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerCol}>
              <Picker
                selectedValue={value.year}
                onValueChange={(selected) =>
                  onChange({
                    ...value,
                    year: Number(selected),
                    formatted: `${value.day} ${value.month}, ${Number(selected)}`,
                  })
                }
                itemStyle={styles.pickerItem}
              >
                {YEARS.map((item) => (
                  <Picker.Item key={item} label={String(item)} value={item} />
                ))}
              </Picker>
            </View>
          </View>

          <AppText style={styles.preview}>{value.formatted}</AppText>

          <AppButton title="Confirm Date" onPress={onConfirm} />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default BirthdaySheet;

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
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textSoft,
    fontFamily: Theme.fonts.body.medium,
  },
  pickerRow: {
    flexDirection: "row",
    gap: 10,
  },
  pickerCol: {
    flex: 1,
    minHeight: 220,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  pickerItem: {
    fontSize: 18,
    color: Theme.colors.text,
  },
  preview: {
    textAlign: "center",
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});