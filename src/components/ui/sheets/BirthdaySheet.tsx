import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
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

type WheelValue = string | number;

type WheelOption<T extends WheelValue> = {
  label: string;
  value: T;
};

type WheelPickerProps<T extends WheelValue> = {
  options: WheelOption<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
};

const PICKER_ITEM_HEIGHT = 44;
const PICKER_VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = PICKER_ITEM_HEIGHT * PICKER_VISIBLE_ITEMS;
const PICKER_CENTER_OFFSET =
  PICKER_ITEM_HEIGHT * Math.floor(PICKER_VISIBLE_ITEMS / 2);

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

const YEARS = Array.from(
  { length: 120 },
  (_, index) => new Date().getFullYear() - index
);

function formatBirthday(day: number, month: string, year: number): string {
  return `${day} ${month}, ${year}`;
}

function getMonthIndex(month: string): number {
  const index = MONTHS.findIndex((item) => item === month);
  return index >= 0 ? index : 0;
}

function getDaysInMonth(month: string, year: number): number {
  return new Date(year, getMonthIndex(month) + 1, 0).getDate();
}

function clampDay(day: number, month: string, year: number): number {
  const maxDay = getDaysInMonth(month, year);
  return Math.min(Math.max(day, 1), maxDay);
}

function WheelPicker<T extends WheelValue>({
  options,
  selectedValue,
  onValueChange,
}: WheelPickerProps<T>) {
  const listRef = useRef<FlatList<WheelOption<T>> | null>(null);

  const selectedIndex = useMemo(() => {
    const index = options.findIndex((item) => item.value === selectedValue);
    return index >= 0 ? index : 0;
  }, [options, selectedValue]);

  const scrollToIndex = useCallback((index: number, animated = true) => {
    listRef.current?.scrollToOffset({
      offset: index * PICKER_ITEM_HEIGHT,
      animated,
    });
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollToIndex(selectedIndex, false);
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedIndex, scrollToIndex, options.length]);

  const handleScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (options.length === 0) return;

      const rawIndex = Math.round(
        event.nativeEvent.contentOffset.y / PICKER_ITEM_HEIGHT
      );

      const nextIndex = Math.min(Math.max(rawIndex, 0), options.length - 1);
      const nextOption = options[nextIndex];

      if (!nextOption) return;
      if (nextOption.value === selectedValue) return;

      onValueChange(nextOption.value);
    },
    [onValueChange, options, selectedValue]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: WheelOption<T>; index: number }) => {
      const isSelected = item.value === selectedValue;

      return (
        <Pressable
          onPress={() => {
            onValueChange(item.value);
            scrollToIndex(index);
          }}
          style={styles.wheelItem}
        >
          <AppText
            style={[
              styles.wheelItemText,
              isSelected && styles.wheelItemTextSelected,
            ]}
          >
            {item.label}
          </AppText>
        </Pressable>
      );
    },
    [onValueChange, scrollToIndex, selectedValue]
  );

  return (
    <View style={styles.wheelShell}>
      <View pointerEvents="none" style={styles.wheelSelectionBand} />

      <FlatList
        ref={listRef}
        data={options}
        keyExtractor={(item) => String(item.value)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        bounces={false}
        nestedScrollEnabled
        overScrollMode="never"
        snapToInterval={PICKER_ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={styles.wheelContent}
        getItemLayout={(_, index) => ({
          length: PICKER_ITEM_HEIGHT,
          offset: PICKER_ITEM_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
}

const BirthdaySheet = forwardRef<BottomSheetModal, Props>(function BirthdaySheet(
  { value, onChange, onConfirm },
  ref
) {
  const insets = useSafeAreaInsets();

  const dayOptions = useMemo(() => {
    const daysInMonth = getDaysInMonth(value.month, value.year);

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;

      return {
        label: String(day),
        value: day,
      };
    });
  }, [value.month, value.year]);

  const monthOptions = useMemo(
    () =>
      MONTHS.map((month) => ({
        label: month,
        value: month,
      })),
    []
  );

  const yearOptions = useMemo(
    () =>
      YEARS.map((year) => ({
        label: String(year),
        value: year,
      })),
    []
  );

  const updateBirthday = useCallback(
    (next: Partial<Pick<BirthdayValue, "day" | "month" | "year">>) => {
      const nextMonth = next.month ?? value.month;
      const nextYear = next.year ?? value.year;
      const nextDay = clampDay(next.day ?? value.day, nextMonth, nextYear);

      onChange({
        day: nextDay,
        month: nextMonth,
        year: nextYear,
        formatted: formatBirthday(nextDay, nextMonth, nextYear),
      });
    },
    [onChange, value.day, value.month, value.year]
  );

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
      enableContentPanningGesture={false}
      enableOverDrag={false}
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
          <AppText variant="title" numberOfLines={1} style={styles.title}>
            Your Birthday
          </AppText>

          <Pressable onPress={dismiss} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={Theme.colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View
          style={[
            styles.content,
            {
              paddingBottom: Math.max(20, insets.bottom + 14),
            },
          ]}
        >
          <View style={styles.labelsRow}>
            <AppText style={styles.label}>DAY</AppText>
            <AppText style={styles.label}>MONTH</AppText>
            <AppText style={styles.label}>YEAR</AppText>
          </View>

          <View style={styles.pickerRow}>
            <View style={styles.pickerCol}>
              <WheelPicker
                options={dayOptions}
                selectedValue={value.day}
                onValueChange={(day) => updateBirthday({ day })}
              />
            </View>

            <View style={styles.pickerCol}>
              <WheelPicker
                options={monthOptions}
                selectedValue={value.month}
                onValueChange={(month) => updateBirthday({ month })}
              />
            </View>

            <View style={styles.pickerCol}>
              <WheelPicker
                options={yearOptions}
                selectedValue={value.year}
                onValueChange={(year) => updateBirthday({ year })}
              />
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
    alignItems: "center",
    gap: 12,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 18,
    lineHeight: 24,
    color: Theme.colors.text,
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
    gap: 18,
  },
  labelsRow: {
    flexDirection: "row",
    gap: 10,
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
    height: PICKER_HEIGHT,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.38)",
    borderWidth: 1,
    borderColor: "rgba(17, 26, 50, 0.06)",
  },
  wheelShell: {
    height: PICKER_HEIGHT,
    overflow: "hidden",
  },
  wheelContent: {
    paddingVertical: PICKER_CENTER_OFFSET,
  },
  wheelSelectionBand: {
    position: "absolute",
    left: 6,
    right: 6,
    top: PICKER_CENTER_OFFSET,
    height: PICKER_ITEM_HEIGHT,
    borderRadius: 14,
    backgroundColor: "rgba(17, 26, 50, 0.055)",
    borderWidth: 1,
    borderColor: "rgba(17, 26, 50, 0.08)",
    zIndex: 0,
  },
  wheelItem: {
    height: PICKER_ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  wheelItemText: {
    textAlign: "center",
    fontSize: 15,
    lineHeight: 20,
    color: "rgba(17, 26, 50, 0.42)",
    fontFamily: Theme.fonts.body.medium,
  },
  wheelItemTextSelected: {
    fontSize: 17,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  preview: {
    textAlign: "center",
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});