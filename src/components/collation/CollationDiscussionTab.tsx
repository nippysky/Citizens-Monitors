import { Ionicons } from "@expo/vector-icons";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import AppText from "@/components/ui/AppText";
import { CollationItem } from "@/data/collation";
import NoElection from "@/svgs/app/NoElection";
import { Theme } from "@/theme";

type Props = {
  collation: CollationItem;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export default function CollationDiscussionsTab({
  collation,
  refreshing = false,
  onRefresh,
}: Props) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]}
          />
        ) : undefined
      }
    >
      <View style={styles.header}>
        <AppText style={styles.title}>Election Discussion</AppText>
        <AppText style={styles.subtitle}>
          Discussions for {collation.electionTitle}.
        </AppText>
      </View>

      <View style={styles.emptyWrap}>
        <NoElection width={112} height={112} />
        <AppText style={styles.emptyTitle}>No discussions yet</AppText>
        <AppText style={styles.emptyText}>
          This collation endpoint does not currently return discussion threads.
          Once the backend exposes election discussion posts, they can be shown
          here without dummy data.
        </AppText>

        <View style={styles.infoCard}>
          <Ionicons
            name="chatbubbles-outline"
            size={19}
            color={Theme.colors.primary}
          />
          <AppText style={styles.infoText}>
            Active election discourse is already available from the Pulse API.
            This tab is kept clean until the dedicated collation discussion
            endpoint is provided.
          </AppText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 16,
  },
  header: { gap: 5 },
  title: {
    fontSize: 22,
    lineHeight: 28,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: Theme.colors.textMuted,
  },
  emptyWrap: {
    minHeight: 360,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 21,
    lineHeight: 26,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.heading.bold,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 21,
    color: Theme.colors.textMuted,
    textAlign: "center",
    maxWidth: 300,
  },
  infoCard: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: "rgba(25,183,176,0.08)",
    borderWidth: 1,
    borderColor: "rgba(25,183,176,0.16)",
    padding: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: Theme.colors.textMuted,
  },
});