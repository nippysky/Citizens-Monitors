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
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import AppText from "@/components/ui/AppText";
import CollationAnimatedProgressBar from "@/components/collation/CollationAnimatedProgressBar";
import { CollationItem } from "@/data/collation";
import { Theme } from "@/theme";
import NoElection from "@/svgs/app/NoElection";
import Thuggery from "@/svgs/app/collation/Thuggery";
import ElectionNotification from "@/svgs/app/profile/ElectionNotification";
import UnderAge from "@/svgs/app/collation/UnderAge";
import MisConduct from "@/svgs/app/collation/MisConduct";
import ResultAlter from "@/svgs/app/collation/ResultAlter";
import VoterIntimidation from "@/svgs/app/collation/VoterIntimidation";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = { collation: CollationItem };
type ScopeFilter = "all-state" | "my-unit";

const SCOPE_OPTIONS: { value: ScopeFilter; label: string }[] = [
  { value: "all-state", label: "All State" },
  { value: "my-unit", label: "My Unit" },
];

type IncidentAnalyticsItem = {
  id: string;
  label: string;
  count: number;
  percent: number;
  color: string;
  iconKey:
    | "thuggery"
    | "ballot-stuffing"
    | "underage-voting"
    | "inec-misconduct"
    | "result-alteration"
    | "voter-intimidation";
};

type MonitoringCardItem = {
  id: string;
  label: string;
  value: string;
  color: string;
  iconKey:
    | "active-volunteer"
    | "pvc-verified"
    | "active-observers"
    | "avg-submission-time";
};

const INCIDENTS_ALL_STATE: IncidentAnalyticsItem[] = [
  {
    id: "thuggery",
    label: "Thuggery & Violence",
    count: 10,
    percent: 57,
    color: "#DF3F38",
    iconKey: "thuggery",
  },
  {
    id: "ballot-stuffing",
    label: "Ballot Stuffing",
    count: 18,
    percent: 81,
    color: "#BF39B6",
    iconKey: "ballot-stuffing",
  },
  {
    id: "underage-voting",
    label: "Underage Voting",
    count: 67,
    percent: 65,
    color: "#3F63DD",
    iconKey: "underage-voting",
  },
  {
    id: "inec-misconduct",
    label: "INEC Misconduct",
    count: 19,
    percent: 21,
    color: "#EB9446",
    iconKey: "inec-misconduct",
  },
  {
    id: "result-alteration",
    label: "Result Alteration",
    count: 21,
    percent: 39,
    color: "#B685F5",
    iconKey: "result-alteration",
  },
  {
    id: "voter-intimidation",
    label: "Voter Intimidation",
    count: 59,
    percent: 63,
    color: "#DD4137",
    iconKey: "voter-intimidation",
  },
];

function buildMyUnitIncidentAnalytics(
  items: IncidentAnalyticsItem[]
): IncidentAnalyticsItem[] {
  return items.map((item, index) => ({
    ...item,
    count: Math.max(1, Math.round(item.count * 0.22)),
    percent: Math.max(9, Math.min(92, item.percent - (index % 3) * 8)),
  }));
}

function buildMonitoringCards(
  collation: CollationItem,
  scope: ScopeFilter
): MonitoringCardItem[] {
  const base = collation.monitoringActivity;

  if (scope === "my-unit") {
    return [
      {
        id: "active-volunteer",
        label: "Active Volunteer",
        value: "4/6",
        color: "#111827",
        iconKey: "active-volunteer",
      },
      {
        id: "pvc-verified",
        label: "PVC Verified",
        value: "100%",
        color: Theme.colors.primary,
        iconKey: "pvc-verified",
      },
      {
        id: "active-observers",
        label: "Active Observers",
        value: "1/1",
        color: "#111827",
        iconKey: "active-observers",
      },
      {
        id: "avg-submission-time",
        label: "Avg, submission time",
        value: "9 min",
        color: "#111827",
        iconKey: "avg-submission-time",
      },
    ];
  }

  return [
    {
      id: "active-volunteer",
      label: "Active Volunteer",
      value: base[0]?.value ?? "56/79",
      color: "#111827",
      iconKey: "active-volunteer",
    },
    {
      id: "pvc-verified",
      label: "PVC Verified",
      value: base[1]?.value ?? "89%",
      color: Theme.colors.primary,
      iconKey: "pvc-verified",
    },
    {
      id: "active-observers",
      label: "Active Observers",
      value: base[2]?.value ?? "15/19",
      color: "#111827",
      iconKey: "active-observers",
    },
    {
      id: "avg-submission-time",
      label: "Avg, submission time",
      value: base[3]?.value ?? "14 min",
      color: "#111827",
      iconKey: "avg-submission-time",
    },
  ];
}

function buildHealthLegend(
  collation: CollationItem,
  scope: ScopeFilter
): { label: string; value: number; color: string }[] {
  if (scope === "my-unit") {
    return [
      { label: "Good", value: 72, color: "#58B8AB" },
      { label: "Manageable", value: 19, color: "#4B7BE7" },
      { label: "Poor", value: 9, color: "#E45125" },
    ];
  }

  return collation.sentiment.legend.map((item) => ({
    label: item.label,
    value: item.value,
    color: item.color,
  }));
}

function buildVerificationStats(
  collation: CollationItem,
  scope: ScopeFilter
) {
  if (scope === "my-unit") {
    return {
      totalReports: 8,
      confirmedReports: 6,
      flaggedReports: 2,
    };
  }

  return {
    totalReports: collation.resultsUploaded + collation.incidentsReported,
    confirmedReports: collation.resultsUploaded,
    flaggedReports: collation.incidentsReported,
  };
}

export default function SentimentAnalysisSection({ collation }: Props) {
  const empty = !collation.isAssignedToPollingUnit;

  const [healthScope, setHealthScope] = useState<ScopeFilter>("all-state");
  const [verificationScope, setVerificationScope] =
    useState<ScopeFilter>("all-state");
  const [incidentScope, setIncidentScope] = useState<ScopeFilter>("all-state");
  const [activityScope, setActivityScope] = useState<ScopeFilter>("all-state");

  if (empty) {
    return (
      <View style={styles.emptyWrap}>
        <NoElection width={86} height={86} />
        <AppText style={styles.emptyTitle}>No Election Report yet</AppText>
        <AppText style={styles.emptySubtitle}>
          Citizen Monitor have not commenced operation yet.
        </AppText>
      </View>
    );
  }

  const healthLegend = buildHealthLegend(collation, healthScope);
  const healthScore =
    healthLegend.find((item) => item.label === "Good")?.value ??
    collation.sentiment.score;

  const verificationStats = buildVerificationStats(
    collation,
    verificationScope
  );

  const verificationPercent =
    verificationStats.totalReports > 0
      ? Math.round(
          (verificationStats.confirmedReports / verificationStats.totalReports) *
            100
        )
      : 0;

  const incidentItems =
    incidentScope === "all-state"
      ? INCIDENTS_ALL_STATE
      : buildMyUnitIncidentAnalytics(INCIDENTS_ALL_STATE);

  const monitoringCards = buildMonitoringCards(collation, activityScope);

  return (
    <View style={styles.wrap}>
      <View style={styles.section}>
        <AppText style={styles.title}>Sentiment Analysis</AppText>
        <AppText style={styles.subtitle}>
          Captured from real reports of this election from {collation.resultsUploaded}{" "}
          results and {collation.incidentsReported} incidents reported from{" "}
          {collation.coveredUnits}/{collation.totalUnits} polling units in
          Alimosho.
        </AppText>
      </View>

      {/* Overall process health */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <AppText style={styles.cardTitle}>Overall process health</AppText>
          <ScopeSelect value={healthScope} onChange={setHealthScope} />
        </View>

        <View style={styles.healthRow}>
          <AnimatedDonut score={healthScore} segments={healthLegend} />

          <View style={styles.healthLegend}>
            {healthLegend.map((item) => (
              <View key={item.label} style={styles.healthLegendRow}>
                <View style={styles.healthLegendLeft}>
                  <View
                    style={[styles.legendDot, { backgroundColor: item.color }]}
                  />
                  <AppText style={styles.healthLegendLabel}>
                    {item.label}{" "}
                    {item.label === "Good"
                      ? "😍"
                      : item.label === "Manageable"
                        ? "😎"
                        : "😡"}
                  </AppText>
                </View>

                <AppText style={styles.healthLegendValue}>
                  {item.value}%
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Report verification analysis */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <AppText style={styles.cardTitle}>Report Verification Analysis</AppText>
          <ScopeSelect value={verificationScope} onChange={setVerificationScope} />
        </View>

        <AppText style={styles.smallMuted}>
          Community confirmation & flagging activity across all submitted reports
        </AppText>

        <View style={styles.statMiniGrid}>
          <MiniFigure
            value={String(verificationStats.totalReports)}
            label="Total Reports"
            color="#111827"
            hideRightBorder={false}
          />
          <MiniFigure
            value={String(verificationStats.confirmedReports)}
            label="Confirmed"
            color={Theme.colors.primary}
            hideRightBorder={false}
          />
          <MiniFigure
            value={String(verificationStats.flaggedReports)}
            label="Flagged"
            color="#E45125"
            hideRightBorder
          />
        </View>

        <CollationAnimatedProgressBar
          progress={verificationPercent}
          height={16}
          color={Theme.colors.primary}
          trackColor="#E45125"
          flat
        />

        <View style={styles.verificationLegend}>
          <View style={styles.legendRow}>
            <View style={styles.legendLeft}>
              <View
                style={[
                  styles.legendDotLarge,
                  { backgroundColor: Theme.colors.primary },
                ]}
              />
              <AppText style={styles.legendLabel}>Confirmed</AppText>
            </View>

            <AppText style={styles.legendCount}>
              {verificationStats.confirmedReports} Volunteers
            </AppText>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendLeft}>
              <View
                style={[styles.legendDotLarge, { backgroundColor: "#E45125" }]}
              />
              <AppText style={styles.legendLabel}>Flagged</AppText>
            </View>

            <AppText style={styles.legendCount}>
              {verificationStats.flaggedReports} Volunteers
            </AppText>
          </View>
        </View>
      </View>

      {/* Instances of incidents reported */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <AppText style={styles.cardTitleLarge}>
            Instants of incidents Reported
          </AppText>
          <ScopeSelect value={incidentScope} onChange={setIncidentScope} />
        </View>

        <View style={styles.incidentsWrap}>
          {incidentItems.map((item) => (
            <View key={item.id} style={styles.incidentItem}>
              <View style={styles.incidentLabelRow}>
                <View style={styles.incidentLeft}>
                  <IncidentTypeIcon iconKey={item.iconKey} />
                  <AppText style={styles.incidentLabel}>
                    {item.label} ({item.count})
                  </AppText>
                </View>

                <AppText style={styles.incidentPercent}>
                  {item.percent}%
                </AppText>
              </View>

              <CollationAnimatedProgressBar
                progress={item.percent}
                height={10}
                color={item.color}
                trackColor="#E2E2E2"
                flat
              />
            </View>
          ))}
        </View>
      </View>

      {/* Monitoring activity */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <AppText style={styles.cardTitleLarge}>Monitoring Activity</AppText>
          <ScopeSelect value={activityScope} onChange={setActivityScope} />
        </View>

        <View style={styles.monitoringGrid}>
          {monitoringCards.map((item) => (
            <View key={item.id} style={styles.monitoringCard}>
              <View style={styles.monitoringTopRow}>
                <MonitoringMetricIcon iconKey={item.iconKey} />
                <AppText style={[styles.monitoringValue, { color: item.color }]}>
                  {item.value}
                </AppText>
              </View>

              <AppText style={styles.monitoringLabel}>{item.label}</AppText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/* ───── SVG SWAP SLOTS ─────
   Replace each return block with your real SVG component once you confirm
   the exact component names/paths. Everything else can stay unchanged.
*/

function IncidentTypeIcon({
  iconKey,
}: {
  iconKey: IncidentAnalyticsItem["iconKey"];
}) {
  switch (iconKey) {
    case "thuggery":
      return (
        <View style={styles.svgIconWrap}>
          <Thuggery/>
        </View>
      );

    case "ballot-stuffing":
      return (
        <View style={styles.svgIconWrap}>
         <ElectionNotification/>
        </View>
      );

    case "underage-voting":
      return (
        <View style={styles.svgIconWrap}>
          <UnderAge/>
        </View>
      );

    case "inec-misconduct":
      return (
        <View style={styles.svgIconWrap}>
        <MisConduct/>
        </View>
      );

    case "result-alteration":
      return (
        <View style={styles.svgIconWrap}>
          <ResultAlter/>
        </View>
      );

    case "voter-intimidation":
      return (
        <View style={styles.svgIconWrap}>
        <VoterIntimidation/>
        </View>
      );

    default:
      return (
        <View style={styles.svgIconWrap}>
          <AppText style={styles.svgFallbackEmoji}>•</AppText>
        </View>
      );
  }
}

function MonitoringMetricIcon({
  iconKey,
}: {
  iconKey: MonitoringCardItem["iconKey"];
}) {
  switch (iconKey) {
    case "active-volunteer":
      return (
        <View style={styles.metricIconWrap}>
          <AppText style={styles.metricFallbackEmoji}>🫶🏾</AppText>
        </View>
      );

    case "pvc-verified":
      return (
        <View style={styles.metricIconWrap}>
          <AppText style={styles.metricFallbackEmoji}>📋</AppText>
        </View>
      );

    case "active-observers":
      return (
        <View style={styles.metricIconWrap}>
          <AppText style={styles.metricFallbackEmoji}>🧑🏾‍🌾</AppText>
        </View>
      );

    case "avg-submission-time":
      return (
        <View style={styles.metricIconWrap}>
          <AppText style={styles.metricFallbackEmoji}>🕘</AppText>
        </View>
      );

    default:
      return (
        <View style={styles.metricIconWrap}>
          <AppText style={styles.metricFallbackEmoji}>•</AppText>
        </View>
      );
  }
}

/* ───── Independent dropdown select ───── */

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
      setMenuPos({ top: y + h + 6, right: 16 });
      setOpen(true);
    });
  };

  const select = (nextValue: ScopeFilter) => {
    onChange(nextValue);
    setOpen(false);
  };

  const currentLabel =
    SCOPE_OPTIONS.find((item) => item.value === value)?.label ?? "All State";

  return (
    <>
      <Pressable
        ref={anchorRef}
        onPress={handleOpen}
        style={styles.selectBtn}
        hitSlop={6}
      >
        <AppText style={styles.selectText}>{currentLabel}</AppText>
        <Ionicons name="chevron-down" size={18} color={Theme.colors.primary} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.dropdownOverlay}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              styles.dropdownMenu,
              { top: menuPos.top, right: menuPos.right },
            ]}
          >
            {SCOPE_OPTIONS.map((option) => {
              const active = option.value === value;

              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => select(option.value)}
                  style={[
                    styles.dropdownItem,
                    active && styles.dropdownItemActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <AppText
                    style={[
                      styles.dropdownItemText,
                      active && styles.dropdownItemTextActive,
                    ]}
                  >
                    {option.label}
                  </AppText>

                  {active ? (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={Theme.colors.primary}
                    />
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
  const size = 108;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.chartWrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E9EDF2"
          strokeWidth={stroke}
          fill="none"
        />

        {(() => {
          let offset = 0;

          return segments.map((segment) => {
            const dash = (segment.value / 100) * circumference;
            const currentOffset = offset;
            offset += dash;

            return (
              <AnimatedArc
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                color={segment.color}
                strokeWidth={stroke}
                circumference={circumference}
                dashLength={dash}
                dashOffset={-currentOffset}
              />
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

function AnimatedArc({
  cx,
  cy,
  r,
  color,
  strokeWidth,
  circumference,
  dashLength,
  dashOffset,
}: {
  cx: number;
  cy: number;
  r: number;
  color: string;
  strokeWidth: number;
  circumference: number;
  dashLength: number;
  dashOffset: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(dashLength, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [dashLength, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${progress.value} ${circumference - progress.value}`,
  }));

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={r}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="butt"
      strokeDashoffset={dashOffset}
      rotation={-90}
      origin={`${cx}, ${cy}`}
      animatedProps={animatedProps}
    />
  );
}

function MiniFigure({
  value,
  label,
  color,
  hideRightBorder = false,
}: {
  value: string;
  label: string;
  color: string;
  hideRightBorder?: boolean;
}) {
  return (
    <View
      style={[
        styles.miniFigure,
        hideRightBorder ? styles.miniFigureLast : null,
      ]}
    >
      <AppText style={[styles.miniFigureValue, { color }]}>{value}</AppText>
      <AppText style={styles.miniFigureLabel}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },

  section: {
    gap: 8,
  },

  title: {
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },

  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
    padding: 14,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  cardTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  cardTitleLarge: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  smallMuted: {
    fontSize: 12,
    lineHeight: 17,
    color: Theme.colors.textMuted,
  },

  selectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingBottom: 2,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.primary,
  },

  selectText: {
    fontSize: 12,
    lineHeight: 16,
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: "transparent",
  },

  dropdownMenu: {
    position: "absolute",
    minWidth: 150,
    borderRadius: 14,
    backgroundColor: Theme.colors.surface,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },

  dropdownItemActive: {
    backgroundColor: "rgba(5,163,156,0.06)",
  },

  dropdownItemText: {
    fontSize: 14,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  dropdownItemTextActive: {
    color: Theme.colors.primary,
    fontFamily: Theme.fonts.body.semibold,
  },

  healthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },

  chartWrap: {
    width: 108,
    height: 108,
    alignItems: "center",
    justifyContent: "center",
  },

  chartCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  chartLabel: {
    fontSize: 12,
    lineHeight: 15,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  chartValue: {
    fontSize: 20,
    lineHeight: 22,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  healthLegend: {
    flex: 1,
    gap: 10,
  },

  healthLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  healthLegendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  healthLegendLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
  },

  healthLegendValue: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.semibold,
  },

  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },

  legendDotLarge: {
    width: 16,
    height: 16,
    borderRadius: 999,
  },

  statMiniGrid: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },

  miniFigure: {
    flex: 1,
    minHeight: 74,
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: "center",
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.border,
  },

  miniFigureLast: {
    borderRightWidth: 0,
  },

  miniFigureValue: {
    fontSize: 20,
    lineHeight: 22,
    fontFamily: Theme.fonts.heading.bold,
  },

  miniFigureLabel: {
    fontSize: 11,
    lineHeight: 14,
    color: Theme.colors.textMuted,
    fontFamily: Theme.fonts.body.medium,
  },

  verificationLegend: {
    gap: 10,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  legendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },

  legendLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
  },

  legendCount: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  incidentsWrap: {
    gap: 18,
  },

  incidentItem: {
    gap: 8,
  },

  incidentLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  incidentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },

  incidentLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.body.medium,
  },

  incidentPercent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5D6666",
    fontFamily: Theme.fonts.body.semibold,
  },

  monitoringGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  monitoringCard: {
    width: "48.4%",
    minHeight: 128,
    borderRadius: 18,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
    gap: 10,
  },

  monitoringTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  monitoringValue: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Theme.fonts.heading.bold,
  },

  monitoringLabel: {
    fontSize: 13,
    lineHeight: 18,
    color: "#586162",
    fontFamily: Theme.fonts.body.medium,
  },

  svgIconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  svgFallbackEmoji: {
    fontSize: 22,
    lineHeight: 24,
  },

  metricIconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  metricFallbackEmoji: {
    fontSize: 22,
    lineHeight: 24,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 6,
  },

  emptyTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 220,
  },
});