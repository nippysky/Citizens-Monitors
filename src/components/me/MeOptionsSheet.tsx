import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  title: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
};

const MeOptionsSheet = forwardRef<BottomSheetModal, Props>(
  function MeOptionsSheet({ title, options, selectedValue, onSelect }, ref) {
    const snapPoints = useMemo(() => ["50%", "75%"], []);

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
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <View style={styles.container}>
          <AppText style={styles.title}>{title}</AppText>

          <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.wrap}>
              {options.map((option, index) => {
                const isActive = selectedValue === option;

                return (
                  <Pressable
                    key={option}
                    onPress={() => handleSelect(option)}
                    style={[
                      styles.row,
                      isActive && styles.rowActive,
                    ]}
                  >
                    <AppText
                      style={[
                        styles.label,
                        isActive && styles.labelActive,
                      ]}
                    >
                      {option}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </BottomSheetScrollView>
        </View>
      </BottomSheetModal>
    );
  }
);

export default MeOptionsSheet;

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
  },
  handle: {
    backgroundColor: "#D1D5DB",
    width: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 17,
    marginBottom: 14,
    fontFamily: Theme.fonts.body.semibold,
  },
  wrap: {
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
  label: {
    fontSize: 15,
    color: Theme.colors.text,
  },
  labelActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});