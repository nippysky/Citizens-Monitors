import { FlatList, ListRenderItem, StyleSheet } from "react-native";

import PressCoverageFeedCard from "@/components/press-coverage/PressCoverageFeedCard";
import { PressCoverageItem } from "@/data/pressCoverage";

type Props = {
  items: PressCoverageItem[];
};

export default function PressCoverageFeedList({ items }: Props) {
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