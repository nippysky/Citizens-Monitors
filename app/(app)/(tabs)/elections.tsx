import AppText from "@/components/ui/AppText";
import { StyleSheet, View } from "react-native";

export default function ElectionsScreen() {
  return (
    <View style={styles.container}>
      <AppText variant="title">Elections</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
});