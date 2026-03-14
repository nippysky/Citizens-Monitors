import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

import AppText from "@/components/ui/AppText";

export default function ElectionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <AppText variant="title">Election Details</AppText>
      <AppText>Election ID: {id}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    gap: 10,
  },
});