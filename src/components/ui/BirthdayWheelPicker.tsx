import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";

const ITEM_HEIGHT = 48;
const VISIBLE_ROWS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;

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

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const YEARS = Array.from({ length: 120 }, (_, i) => new Date().getFullYear() - i);

function padData<T>(data: T[]) {
  return [null, null, ...data, null, null] as (T | null)[];
}

type PickerValue = {
  day: number;
  month: string;
  year: number;
  formatted: string;
};

type Props = {
  initialDay?: number;
  initialMonth?: string;
  initialYear?: number;
  onValueChange?: (value: PickerValue) => void;
};

function WheelColumn<T extends string | number>({
  data,
  selectedValue,
  onValueChange,
  label,
}: {
  data: T[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  label: string;
}) {
  const listRef = useRef<FlatList<T | null>>(null);
  const padded = useMemo(() => padData(data), [data]);

  useEffect(() => {
    const index = data.findIndex((item) => item === selectedValue);
    if (index >= 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: index * ITEM_HEIGHT,
          animated: false,
        });
      });
    }
  }, [data, selectedValue]);

  const handleMomentumEnd = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const value = data[index];
    if (value !== undefined) onValueChange(value);
  };

  const renderItem = ({ item }: ListRenderItemInfo<T | null>) => {
    const selected = item === selectedValue;

    return (
      <View style={styles.item}>
        {item !== null ? (
          <View style={[styles.pill, selected && styles.pillSelected]}>
            <AppText style={[styles.itemText, selected && styles.itemTextSelected]}>
              {String(item)}
            </AppText>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.column}>
      <AppText style={styles.columnLabel}>{label}</AppText>
      <FlatList
        ref={listRef}
        data={padded}
        keyExtractor={(_, index) => `${label}-${index}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces={false}
        onMomentumScrollEnd={handleMomentumEnd}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />
    </View>
  );
}

export default function BirthdayWheelPicker({
  initialDay = 1,
  initialMonth = "January",
  initialYear = 2000,
  onValueChange,
}: Props) {
  const [day, setDay] = useState(initialDay);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);

  const formatted = `${day} ${month}, ${year}`;

  useEffect(() => {
    onValueChange?.({
      day,
      month,
      year,
      formatted,
    });
  }, [day, month, year, formatted, onValueChange]);

  return (
    <View style={styles.wrap}>
      <View style={styles.wheelsRow}>
        <WheelColumn data={DAYS} selectedValue={day} onValueChange={setDay} label="DAY" />
        <WheelColumn data={MONTHS} selectedValue={month} onValueChange={setMonth} label="MONTH" />
        <WheelColumn data={YEARS} selectedValue={year} onValueChange={setYear} label="YEAR" />
      </View>

      <View style={styles.centerHighlight} />

      <AppText style={styles.preview}>{formatted}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 18,
  },
  wheelsRow: {
    flexDirection: "row",
    gap: 12,
    height: PICKER_HEIGHT + 28,
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.textSoft,
    fontFamily: Theme.fonts.body.medium,
    marginBottom: 10,
  },
  list: {
    height: PICKER_HEIGHT,
  },
  listContent: {
    paddingVertical: ITEM_HEIGHT * 2,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    minWidth: 58,
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  pillSelected: {
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    backgroundColor: "rgba(25, 183, 176, 0.06)",
  },
  itemText: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
  },
  itemTextSelected: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.medium,
  },
  centerHighlight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 26 + ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(25, 183, 176, 0.12)",
    backgroundColor: "rgba(255,255,255,0.18)",
    pointerEvents: "none",
  },
  preview: {
    textAlign: "center",
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});