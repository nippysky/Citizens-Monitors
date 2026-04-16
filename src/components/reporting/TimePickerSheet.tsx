import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  selectedValue?: string;
  onSelect: (value: string) => void;
};

const TIMES = [
  "06:00 AM",
  "06:15 AM",
  "06:30 AM",
  "06:45 AM",
  "07:00 AM",
  "07:15 AM",
  "07:30 AM",
  "07:45 AM",
  "08:00 AM",
  "08:15 AM",
  "08:30 AM",
  "08:45 AM",
  "09:00 AM",
  "09:15 AM",
  "09:30 AM",
  "09:45 AM",
  "10:00 AM",
  "10:15 AM",
  "10:30 AM",
  "10:45 AM",
  "11:00 AM",
  "11:15 AM",
  "11:30 AM",
  "11:45 AM",
  "12:00 PM",
] as const;

const TimePickerSheet = forwardRef<BottomSheetModal, Props>(
  function TimePickerSheet({ selectedValue, onSelect }, ref) {
    const snapPoints = useMemo(() => ["72%"], []);

    const handleSelect = (value: string) => {
      onSelect(value);

      if (ref && typeof ref !== "function" && ref.current) {
        ref.current.dismiss();
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.28}
            pressBehavior="close"
          />
        )}
      >
        <View style={styles.container}>
          <AppText style={styles.title}>Select time</AppText>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.list}>
              {TIMES.map((time) => {
                const active = selectedValue === time;

                return (
                  <Pressable
                    key={time}
                    onPress={() => handleSelect(time)}
                    style={[styles.row, active && styles.rowActive]}
                  >
                    <AppText
                      style={[styles.rowLabel, active && styles.rowLabelActive]}
                    >
                      {time}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </BottomSheetModal>
    );
  }
);

export default TimePickerSheet;

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
  },
  handle: {
    backgroundColor: "#D1D5DB",
    width: 42,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.semibold,
    marginBottom: 16,
  },
  list: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  row: {
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  rowActive: {
    backgroundColor: "rgba(5,163,156,0.08)",
  },
  rowLabel: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },
  rowLabelActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});