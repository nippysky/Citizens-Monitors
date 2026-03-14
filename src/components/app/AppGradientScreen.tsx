import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
};

export default function AppGradientScreen({
  children,
  footer,
  scroll = true,
}: Props) {
  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      bounces
    >
      <View style={styles.contentWrapper}>{children}</View>
    </ScrollView>
  ) : (
    <View style={styles.contentWrapper}>{children}</View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={styles.root}>
        <LinearGradient
          colors={["#F4F1D9", "#F8F7EC", "#FCFCF8", "#FFFFFF"]}
          locations={[0, 0.18, 0.48, 1]}
          style={StyleSheet.absoluteFill}
        />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {content}

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F1D9",
  },

  root: {
    flex: 1,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  contentWrapper: {
    flex: 1,
    backgroundColor: "transparent",
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(25,183,176,0.15)",
    backgroundColor: "rgba(255,255,255,0.96)",
  },
});