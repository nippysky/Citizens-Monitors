import { FlatList, ListRenderItem, RefreshControl, StyleSheet, View } from "react-native";

import NotificationListItem from "@/components/notifications/NotificationListItem";
import { AppNotification } from "@/lib/api/notifications.api";
import { Theme } from "@/theme";

type Props = {
  items: AppNotification[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onPressItem: (item: AppNotification) => void;
  ListFooterComponent?: React.ReactElement | null;
};

export default function NotificationList({
  items,
  refreshing = false,
  onRefresh,
  onEndReached,
  onPressItem,
  ListFooterComponent,
}: Props) {
  const renderItem: ListRenderItem<AppNotification> = ({ item, index }) => {
    const isLast = index === items.length - 1;

    return (
      <NotificationListItem
        item={item}
        isLast={isLast}
        onPress={onPressItem}
      />
    );
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
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
      ListFooterComponent={ListFooterComponent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  separator: {
    height: 2,
  },
});