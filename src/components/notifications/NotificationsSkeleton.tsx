import { StyleSheet, View } from "react-native";

function SkeletonItem() {
  return (
    <View style={styles.item}>
      <View style={styles.icon} />

      <View style={styles.content}>
        <View style={styles.title} />
        <View style={styles.message} />
        <View style={styles.time} />
      </View>
    </View>
  );
}

export default function NotificationsSkeleton() {
  return (
    <View style={styles.wrap}>
      {Array.from({ length: 7 }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 12,
  },
  item: {
    minHeight: 88,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(17,26,50,0.07)",
  },
  content: {
    flex: 1,
    gap: 9,
  },
  title: {
    width: "78%",
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(17,26,50,0.07)",
  },
  message: {
    width: "94%",
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(17,26,50,0.055)",
  },
  time: {
    width: 78,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(17,26,50,0.045)",
  },
});