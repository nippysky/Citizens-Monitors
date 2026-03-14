import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import AppBottomSheet from "@/components/ui/AppBottomSheet";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  title: string;
  options: string[];
  selectedValue?: string;
  onSelect: (value: string) => void;
};

const MeOptionsSheet = forwardRef<BottomSheetModal, Props>(function MeOptionsSheet(
  { title, options, selectedValue, onSelect },
  ref
) {
  const handleSelect = (value: string) => {
    onSelect(value);

    if (ref && typeof ref !== "function" && ref.current) {
      ref.current.dismiss();
    }
  };

  return (
    <AppBottomSheet ref={ref} title={title} snapPoints={["58%"]}>
      <View style={styles.wrap}>
        {options.map((option, index) => {
          const isLast = index === options.length - 1;
          const isActive = selectedValue === option;

          return (
            <Pressable
              key={option}
              onPress={() => handleSelect(option)}
              style={[
                styles.row,
                !isLast && styles.rowBorder,
                isActive && styles.rowActive,
              ]}
            >
              <AppText style={[styles.label, isActive && styles.labelActive]}>
                {option}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </AppBottomSheet>
  );
});

export default MeOptionsSheet;

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderWidth: 1,
    borderColor: "#D9DEE8",
  },

  row: {
    minHeight: 54,
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#D9DEE8",
  },

  rowActive: {
    backgroundColor: "rgba(5,163,156,0.06)",
  },

  label: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
  },

  labelActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },
});