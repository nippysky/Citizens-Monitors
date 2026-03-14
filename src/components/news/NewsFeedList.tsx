import { FlatList, ListRenderItem, StyleSheet } from "react-native";

import NewsFeedCard from "@/components/news/NewsFeedCard";
import { NewsFeedItem } from "@/data/news";

type Props = {
  items: NewsFeedItem[];
};

export default function NewsFeedList({ items }: Props) {
  const renderItem: ListRenderItem<NewsFeedItem> = ({ item, index }) => {
    const isLast = index === items.length - 1;

    return <NewsFeedCard item={item} isLast={isLast} />;
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
    paddingTop: 4,
    paddingBottom: 10,
  },
});