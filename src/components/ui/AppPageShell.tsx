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
  scroll?: boolean;
  footer?: ReactNode;
  /**
   * Change this value to force the ScrollView to remount and reset
   * its scroll offset back to the top.  Typically pass the current
   * step number so every navigation resets the position.
   */
  scrollKey?: string | number;
};

export default function AppPageShell({
  children,
  scroll = true,
  footer,
  scrollKey,
}: Props) {
  const content = scroll ? (
    <ScrollView
      key={scrollKey}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      <View style={styles.inner}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </ScrollView>
  ) : (
    <View style={styles.inner}>
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <LinearGradient
        colors={["#F8F4DE", "#FBFAF3", "#FEFEFC", "#FEFEFC"]}
        locations={[0, 0.2, 0.48, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FEFEFC",
    paddingVertical: 10,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 18,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});