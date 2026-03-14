import { StyleSheet, View } from "react-native";

import type { MeMenuItem } from "@/data/me";
import MeSectionItem from "./MeSectionItem";

type Props = {
  items: MeMenuItem[];
  onItemPress?: (item: MeMenuItem) => void;
};

export default function MeSection({ items, onItemPress }: Props) {
  return (
    <View style={styles.wrap}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <MeSectionItem
            key={item.id}
            item={item}
            isLast={isLast}
            onPress={() => onItemPress?.(item)}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "transparent",
  },
});