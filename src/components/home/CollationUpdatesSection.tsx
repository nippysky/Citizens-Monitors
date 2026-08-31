import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";
import { Paths } from "@/constants/paths";
import { Theme } from "@/theme";
import { ElectionUpdateItem } from "@/types/home";

type Props = {
  items: ElectionUpdateItem[];
};

/**
 * Tries to detect the pattern "ISO_DATE - ISO_DATE" in the info string and
 * formats it as a human-readable date range. Falls back to returning the
 * original string unchanged so any non-date info still renders.
 *
 * Input:  "2026-07-01T23:00:00.000Z - 2026-07-03T22:59:00.000Z"
 * Output: "Jul 2 – Jul 4, 2026 · WAT"
 */
function formatInfo(info?: string): string | undefined {
  if (!info) return undefined;

  const parts = info.split(" - ");
  if (parts.length !== 2) return info;

  const start = new Date(parts[0].trim());
  const end = new Date(parts[1].trim());

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return info;
  }

  const fmt = new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    timeZone: "Africa/Lagos",
  });
  const yearFmt = new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    timeZone: "Africa/Lagos",
  });

  const sameYear = yearFmt.format(start) === yearFmt.format(end);
  if (sameYear) {
    return `${fmt.format(start)} – ${fmt.format(end)}, ${yearFmt.format(end)} · WAT`;
  }
  return `${fmt.format(start)} – ${fmt.format(end)} · WAT`;
}

function getTagConfig(tag: ElectionUpdateItem["tag"]): {
  label: string;
  color: string;
  bgColor: string;
  gradientColors: [string, string];
  iconName: keyof typeof Ionicons.glyphMap;
} {
  if (tag === "INCIDENT") {
    return {
      label: "INCIDENT",
      color: "#DC2626",
      bgColor: "rgba(220,38,38,0.10)",
      gradientColors: ["#FEF2F2", "#FFFFFF"],
      iconName: "warning-outline",
    };
  }
  return {
    label: "RESULT",
    color: Theme.colors.primary,
    bgColor: "rgba(5,163,156,0.10)",
    gradientColors: ["#F0FDFB", "#FFFFFF"],
    iconName: "checkmark-done-outline",
  };
}

function UpdateCard({ item }: { item: ElectionUpdateItem }) {
  const cfg = getTagConfig(item.tag);
  const formattedInfo = formatInfo(item.info);

  const handlePress = () => {
    router.push({
      pathname: Paths.appCollation as never,
      params: {
        tab: item.tag === "INCIDENT" ? "review-reports" : "overview",
        collationId: item.collationId,
        activeElectionId: item.collationId,
        electionId: item.collationId,
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Subtle tinted gradient background */}
      <LinearGradient
        colors={cfg.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: cfg.color }]} />

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: cfg.bgColor }]}>
        <Ionicons name={cfg.iconName} size={20} color={cfg.color} />
      </View>

      {/* Text content */}
      <View style={styles.textBlock}>
        {/* Tag pill + time ago */}
        <View style={styles.metaRow}>
          <View style={[styles.tagPill, { backgroundColor: cfg.bgColor }]}>
            <AppText style={[styles.tagText, { color: cfg.color }]}>
              {cfg.label}
            </AppText>
          </View>
          <AppText style={styles.dot}>·</AppText>
          <AppText style={styles.timeText}>{item.timeAgo}</AppText>
        </View>

        {/* Title */}
        <AppText style={styles.title} numberOfLines={2}>
          {item.title}
        </AppText>

        {/* Formatted date range */}
        {formattedInfo ? (
          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={11}
              color={Theme.colors.textMuted}
            />
            <AppText style={styles.infoText} numberOfLines={1}>
              {formattedInfo}
            </AppText>
          </View>
        ) : null}
      </View>

      <Ionicons
        name="chevron-forward"
        size={16}
        color={Theme.colors.textMuted}
        style={styles.chevron}
      />
    </Pressable>
  );
}

export default function CollationUpdatesSection({ items }: Props) {
  if (!items.length) return null;

  return (
    <View style={styles.wrap}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <View style={styles.liveDot} />
          <AppText style={styles.sectionTitle}>Election Updates</AppText>
        </View>

        <Pressable onPress={() => router.push(Paths.appCollation)} hitSlop={8}>
          <AppText style={styles.seeAll}>SEE ALL</AppText>
        </Pressable>
      </View>

      {/* Cards */}
      <View style={styles.list}>
        {items.slice(0, 4).map((item) => (
          <UpdateCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    paddingHorizontal: 16,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
  },

  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: Theme.fonts.heading.bold,
    color: Theme.colors.text,
  },

  seeAll: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Theme.fonts.body.semibold,
    color: Theme.colors.primary,
    letterSpacing: 0.4,
  },

  list: {
    gap: 10,
  },

  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(17,26,50,0.08)",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    overflow: "hidden",
    // Shadow
    shadowColor: "#111A32",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.78,
  },

  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  textBlock: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },

  tagText: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: Theme.fonts.body.semibold,
    letterSpacing: 0.5,
  },

  dot: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    opacity: 0.5,
  },

  timeText: {
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.textMuted,
  },

  title: {
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    color: Theme.colors.textMuted,
  },

  chevron: {
    flexShrink: 0,
  },
});
