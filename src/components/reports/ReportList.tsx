import { FlatList, ListRenderItem, StyleSheet } from "react-native";

import ReportElectionCard from "@/components/reports/ReportElectionCard";
import { ReportElectionItem } from "@/data/myReports";

type Props = {
  items: ReportElectionItem[];
};

export default function ReportsList({ items }: Props) {
  const renderItem: ListRenderItem<ReportElectionItem> = ({ item, index }) => {
    const isLast = index === items.length - 1;

    return <ReportElectionCard item={item} isLast={isLast} />;
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
    paddingBottom: 20,
  },
});