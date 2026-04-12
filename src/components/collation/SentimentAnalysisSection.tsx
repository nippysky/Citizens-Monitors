// ─── src/components/collation/SentimentAnalysisSection.tsx ────────────────────
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import { CollationItem } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { collation: CollationItem };
type ScopeFilter = "all-state" | "my-unit";

const SCOPE_OPTIONS: { value: ScopeFilter; label: string }[] = [
  { value: "all-state", label: "All State" },
  { value: "my-unit", label: "My Unit" },
];

export default function SentimentAnalysisSection({ collation }: Props) {
  const empty = !collation.isAssignedToPollingUnit;

  const [ratingScope, setRatingScope] = useState<ScopeFilter>("all-state");
  const [buyingScope, setBuyingScope] = useState<ScopeFilter>("all-state");
  const [intimidationScope, setIntimidationScope] = useState<ScopeFilter>("all-state");

  if (empty) {
    return (
      <View style={styles.emptyWrap}>
        <NoElection width={86} height={86} />
        <AppText style={styles.emptyTitle}>No Election Report yet</AppText>
        <AppText style={styles.emptySubtitle}>Citizen Monitor have not commenced operation yet.</AppText>
      </View>
    );
  }

  const { sentiment } = collation;

  return (
    <View style={styles.wrap}>
      <View style={styles.section}>
        <AppText style={styles.title}>Sentiment Analysis</AppText>
        <AppText style={styles.subtitle}>
          Captured from real reports of this election from {collation.resultsUploaded} results
          and {collation.incidentsReported} incidents reported from {collation.coveredUnits}/
          {collation.totalUnits} polling units in Alimosho.
        </AppText>
      </View>

      {/* ── Rating card ── */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <AppText style={styles.cardTitle}>Rating of today&apos;s election</AppText>
          <ScopeSelect value={ratingScope} onChange={setRatingScope} />
        </View>

        <AnimatedDonut score={sentiment.score} segments={sentiment.legend} />

        <View style={styles.legend}>
          {sentiment.legend.map((item) => (
            <View key={item.label} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <AppText style={styles.legendLabel}>
                  {item.label}{" "}
                  {item.label === "Good" ? "😍" : item.label === "Manageable" ? "🤨" : "😡"}
                </AppText>
              </View>
              <View style={styles.legendRight}>
                <AppText style={styles.legendCount}>{item.count} Observers</AppText>
                <AppText style={styles.legendPercent}>{item.value}%</AppText>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── Vote buying ── */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <AppText style={styles.cardTitle}>Instances of vote buying?</AppText>
          <ScopeSelect value={buyingScope} onChange={setBuyingScope} />
        </View>
        <AppText style={styles.smallMuted}>
          Observer(s) submission for instances of voting buying activity at their polling unit(s).
        </AppText>

        <CollationAnimatedProgressBar
          progress={(sentiment.voteBuyingSubmitted / (sentiment.voteBuyingSubmitted + sentiment.voteBuyingObserverSubmitted || 1)) * 100}
          height={14} color={Theme.colors.primary} trackColor="#F04A1D" flat
        />

        <View style={styles.legendRow}>
          <View style={styles.legendLeft}>
            <View style={[styles.legendDot, { backgroundColor: Theme.colors.primary }]} />
            <AppText style={styles.legendLabel}>Observers</AppText>
          </View>
          <AppText style={styles.legendCount}>{sentiment.voteBuyingSubmitted} Submissions</AppText>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendLeft}>
            <View style={[styles.legendDot, { backgroundColor: "#F04A1D" }]} />
            <AppText style={styles.legendLabel}>Observers</AppText>
          </View>
          <AppText style={styles.legendCount}>{sentiment.voteBuyingObserverSubmitted} Submissions</AppText>
        </View>
      </View>

      {/* ── Intimidation ── */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <AppText style={styles.cardTitle}>Instances of voter intimidation?</AppText>
          <ScopeSelect value={intimidationScope} onChange={setIntimidationScope} />
        </View>
        <AppText style={styles.smallMuted}>
          Observer(s) submission of instances of voting activity at their polling unit(s).
        </AppText>

        <View style={styles.intimidationGrid}>
          <MiniStat value={sentiment.intimidation.total} label="Total" />
          <MiniStat value={sentiment.intimidation.occurred} label="Occurred" color={Theme.colors.primary} />
          <MiniStat value={sentiment.intimidation.notOccurred} label="Not Occurred" color="#F04A1D" />
        </View>

        <CollationAnimatedProgressBar
          progress={sentiment.intimidationBarPercent}
          height={14} color={Theme.colors.primary} trackColor="#F04A1D" flat
        />
      </View>

      {/* ── Monitoring Activity ── */}
      <View style={styles.section}>
        <AppText style={styles.title}>Monitoring Activity</AppText>
      </View>
      <View style={styles.monitoringGrid}>
        {collation.monitoringActivity.map((m) => (
          <View key={m.label} style={styles.monitoringCard}>
            <View style={[styles.monitoringIcon, { backgroundColor: `${m.color}18` }]}>
              <Ionicons name={m.icon as any} size={18} color={m.color} />
            </View>
            <AppText style={[styles.monitoringValue, { color: m.color }]}>{m.value}</AppText>
            <AppText style={styles.monitoringLabel}>{m.label}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ───── Dropdown select ───── */

function ScopeSelect({
  value,
  onChange,
}: {
  value: ScopeFilter;
  onChange: (v: ScopeFilter) => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<View>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 16 });

  const handleOpen = () => {
    anchorRef.current?.measureInWindow((x, y, w, h) => {
      setMenuPos({ top: y + h + 4, right: 16 });
      setOpen(true);
    });
  };

  const select = (v: ScopeFilter) => {
    onChange(v);
    setOpen(false);
  };

  const currentLabel = SCOPE_OPTIONS.find((o) => o.value === value)?.label ?? "All State";

  return (
    <>
      <Pressable ref={anchorRef} onPress={handleOpen} style={styles.selectBtn} hitSlop={6}>
        <AppText style={styles.selectText}>{currentLabel}</AppText>
        <Ionicons name="chevron-down" size={14} color={Theme.colors.primary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.dropdownOverlay} onPress={() => setOpen(false)}>
          <View style={[styles.dropdownMenu, { top: menuPos.top, right: menuPos.right }]}>
            {SCOPE_OPTIONS.map((opt) => {
              const active = opt.value === value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => select(opt.value)}
                  style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                  activeOpacity={0.7}
                >
                  <AppText style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>
                    {opt.label}
                  </AppText>
                  {active ? (
                    <Ionicons name="checkmark" size={16} color={Theme.colors.primary} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

/* ───── Donut chart ───── */

function AnimatedDonut({
  score,
  segments,
}: {
  score: number;
  segments: { label: string; value: number; color: string }[];
}) {
  const SIZE = 130;
  const STROKE = 14;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;

  return (
    <View style={styles.chartWrap}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke="#EEF2F6" strokeWidth={STROKE} fill="none" />
        {(() => {
          let offset = 0;
          return segments.map((seg) => {
            const dash = (seg.value / 100) * C;
            const currentOffset = offset;
            offset += dash;
            return (
              <AnimatedArc key={seg.label} cx={SIZE / 2} cy={SIZE / 2} r={R}
                color={seg.color} strokeWidth={STROKE} circumference={C}
                dashLength={dash} dashOffset={-currentOffset} />
            );
          });
        })()}
      </Svg>
      <View style={styles.chartCenter}>
        <AppText style={styles.chartLabel}>Good</AppText>
        <AppText style={styles.chartValue}>{score}%</AppText>
      </View>
    </View>
  );
}

function AnimatedArc({ cx, cy, r, color, strokeWidth, circumference, dashLength, dashOffset }: {
  cx: number; cy: number; r: number; color: string; strokeWidth: number;
  circumference: number; dashLength: number; dashOffset: number;
}) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(dashLength, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, [dashLength, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${progress.value} ${circumference - progress.value}`,
  }));

  return (
    <AnimatedCircle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={strokeWidth}
      fill="none" strokeLinecap="round" strokeDashoffset={dashOffset}
      rotation={-90} origin={`${cx}, ${cy}`} animatedProps={animatedProps} />
  );
}

function MiniStat({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <View style={styles.miniStat}>
      <AppText style={[styles.miniValue, color ? { color } : null]}>{value}</AppText>
      <AppText style={styles.miniLabel}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  section: { gap: 6 },
  title: { fontSize: 15, lineHeight: 20, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  subtitle: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted },
  card: { borderRadius: 18, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.surface, padding: 14, gap: 14 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardTitle: { flex: 1, fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },

  /* Dropdown select button */
  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 30,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(5,163,156,0.06)",
    borderWidth: 1,
    borderColor: "rgba(5,163,156,0.15)",
  },
  selectText: { fontSize: 12, lineHeight: 16, color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },

  /* Dropdown menu */
  dropdownOverlay: { flex: 1, backgroundColor: "transparent" },
  dropdownMenu: {
    position: "absolute",
    minWidth: 150,
    borderRadius: 14,
    backgroundColor: Theme.colors.surface,
    paddingVertical: 6,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  dropdownItemActive: { backgroundColor: "rgba(5,163,156,0.06)" },
  dropdownItemText: { fontSize: 14, lineHeight: 18, color: Theme.colors.text, fontFamily: Theme.fonts.body.medium },
  dropdownItemTextActive: { color: Theme.colors.primary, fontFamily: Theme.fonts.body.semibold },

  /* Chart */
  chartWrap: { alignSelf: "center", width: 130, height: 130, alignItems: "center", justifyContent: "center" },
  chartCenter: { position: "absolute", alignItems: "center", justifyContent: "center" },
  chartLabel: { fontSize: 13, lineHeight: 16, color: Theme.colors.text, fontFamily: Theme.fonts.body.medium },
  chartValue: { fontSize: 20, lineHeight: 24, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },

  legend: { gap: 10 },
  legendRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  legendLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  legendRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  legendDot: { width: 10, height: 10, borderRadius: 999 },
  legendLabel: { fontSize: 13, lineHeight: 18, color: Theme.colors.text },
  legendCount: { fontSize: 12, lineHeight: 16, color: Theme.colors.textMuted },
  legendPercent: { fontSize: 12, lineHeight: 16, color: Theme.colors.text, fontFamily: Theme.fonts.body.semibold },
  smallMuted: { fontSize: 12, lineHeight: 17, color: Theme.colors.textMuted },

  intimidationGrid: { flexDirection: "row", gap: 10 },
  miniStat: { flex: 1, minHeight: 76, borderRadius: 14, borderWidth: 1, borderColor: Theme.colors.border, backgroundColor: Theme.colors.background, alignItems: "center", justifyContent: "center", gap: 4 },
  miniValue: { fontSize: 26, lineHeight: 26, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold },
  miniLabel: { fontSize: 11, lineHeight: 14, color: Theme.colors.textMuted, textAlign: "center" },

  monitoringGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  monitoringCard: {
    width: "47%", minHeight: 100, borderRadius: 16, borderWidth: 1, borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface, paddingHorizontal: 12, paddingVertical: 12, gap: 6,
    ...Platform.select({ ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }, android: { elevation: 1 } }),
  },
  monitoringIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  monitoringValue: { fontSize: 20, lineHeight: 22, fontFamily: Theme.fonts.heading.bold },
  monitoringLabel: { fontSize: 11, lineHeight: 14, color: Theme.colors.textMuted },

  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 18, gap: 6 },
  emptyTitle: { fontSize: 20, lineHeight: 24, color: Theme.colors.text, fontFamily: Theme.fonts.heading.bold, textAlign: "center" },
  emptySubtitle: { fontSize: 13, lineHeight: 18, color: Theme.colors.textMuted, textAlign: "center", maxWidth: 220 },
});