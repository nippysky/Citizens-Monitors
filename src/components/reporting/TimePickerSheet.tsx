import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import { Theme } from "@/theme";

type Props = {
  visible: boolean;
  value?: string;
  onClose: () => void;
  onConfirm: (value: string) => void;
};

function parseTimeValue(value?: string): Date {
  const base = new Date();
  base.setSeconds(0);
  base.setMilliseconds(0);

  if (!value) {
    base.setHours(8, 0, 0, 0);
    return base;
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);

  if (!match) {
    base.setHours(8, 0, 0, 0);
    return base;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  base.setHours(hour, minute, 0, 0);
  return base;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TimePickerSheet({
  visible,
  value,
  onClose,
  onConfirm,
}: Props) {
  const [tempDate, setTempDate] = useState<Date>(() => parseTimeValue(value));

  /*
   * Re-seed the wheel whenever the sheet reopens or the incoming value
   * changes. Done during render (React's documented alternative to
   * setState-in-effect) so the picker never briefly shows the previous time.
   */
  const seedKey = `${value ?? ""}|${visible}`;
  const [lastSeedKey, setLastSeedKey] = useState(seedKey);

  if (seedKey !== lastSeedKey) {
    setLastSeedKey(seedKey);
    setTempDate(parseTimeValue(value));
  }

  useEffect(() => {
    if (Platform.OS !== "android" || !visible) return;

    DateTimePickerAndroid.open({
      value: tempDate,
      mode: "time",
      is24Hour: false,
      display: "default",
      // Split listeners replace the deprecated `onChange`: confirmation and
      // dismissal are now distinct callbacks instead of branching on
      // event.type, so cancelling can never be mistaken for a selection.
      onValueChange: (_event, selectedDate) => {
        onConfirm(formatTime(selectedDate));
      },
      onDismiss: onClose,
    });
  }, [visible, tempDate, onClose, onConfirm]);

  if (Platform.OS === "android") {
    return null;
  }

  if (!visible) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <AppText style={styles.title}>Select time</AppText>

        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={18} color={Theme.colors.textMuted} />
        </Pressable>
      </View>

      <AppText style={styles.subtitle}>
        Choose the approximate time voting started at your unit.
      </AppText>

      <View style={styles.previewRow}>
        <Ionicons name="time-outline" size={18} color={Theme.colors.primary} />
        <AppText style={styles.previewText}>{formatTime(tempDate)}</AppText>
      </View>

      <View style={styles.iosPickerCard}>
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="spinner"
          // datetimepicker 9.x: `onChange` is deprecated in favour of the
          // split listeners. `onValueChange` always provides a Date, so no
          // null guard is needed here.
          onValueChange={(_, selectedDate) => {
            setTempDate(selectedDate);
          }}
          style={styles.iosPicker}
        />
      </View>

      <View style={styles.footer}>
        <AppButton
          title="Use Selected Time"
          onPress={() => onConfirm(formatTime(tempDate))}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E3E7EE",
    backgroundColor: "#FFFFFF",
    padding: 14,
    gap: 12,
  },
  headerRow: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  previewRow: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "rgba(5,163,156,0.08)",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.14)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },
  iosPickerCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingVertical: 6,
  },
  iosPicker: {
    width: "100%",
    height: 180,
  },
  footer: {
    paddingTop: 4,
  },
});