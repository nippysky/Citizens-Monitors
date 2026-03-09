import AuthBackground from "@/components/auth/AuthBackground";
import { Theme } from "@/theme";
import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  topSlot?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
};

export default function AuthShell({
  topSlot,
  children,
  footer,
  scroll = true,
}: Props) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.inner}>
        {topSlot ? <View style={styles.top}>{topSlot}</View> : null}
        <View style={styles.body}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </ScrollView>
  ) : (
    <View style={styles.inner}>
      {topSlot ? <View style={styles.top}>{topSlot}</View> : null}
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AuthBackground>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      </AuthBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 14,
  },
  top: {
    zIndex: 2,
    marginBottom: 18,
  },
  body: {
    flex: 1,
    zIndex: 2,
  },
  footer: {
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
  },
});