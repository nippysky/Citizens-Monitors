import { FlatList, ListRenderItem, StyleSheet } from "react-native";

import NotificationListItem from "@/components/notifications/NotificationListItem";
import { NotificationItem } from "@/data/notifications";

type Props = {
  items: NotificationItem[];
};

export default function NotificationList({ items }: Props) {
  const renderItem: ListRenderItem<NotificationItem> = ({ item, index }) => {
    const isLast = index === items.length - 1;

    return <NotificationListItem item={item} isLast={isLast} />;
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
});