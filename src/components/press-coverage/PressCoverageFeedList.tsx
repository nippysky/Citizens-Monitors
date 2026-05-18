import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import PressCoverageFeedCard from "@/components/press-coverage/PressCoverageFeedCard";
import { PressCoverageItem } from "@/data/pressCoverage";
import { Theme } from "@/theme";

type Props = {
  items: PressCoverageItem[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  ListFooterComponent?: React.ReactElement | null;
};

export default function PressCoverageFeedList({
  items,
  refreshing = false,
  onRefresh,
  onEndReached,
  ListFooterComponent,
}: Props) {
  const renderItem: ListRenderItem<PressCoverageItem> = ({ item, index }) => {
    const isLast = index === items.length - 1;
    return <PressCoverageFeedCard item={item} isLast={isLast} />;
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      bounces
      style={styles.list}
      contentContainerStyle={styles.content}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.45}
      ListFooterComponent={ListFooterComponent ?? <View style={{ height: 20 }} />}
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
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
});