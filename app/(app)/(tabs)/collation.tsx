import AppText from "@/components/ui/AppText";
import { StyleSheet, View } from "react-native";

export default function LiveScreen() {
  return (
    <View style={styles.container}>
      <AppText variant="title">Live</AppText>
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