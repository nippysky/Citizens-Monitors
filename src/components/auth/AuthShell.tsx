import AuthBackground from "@/components/auth/AuthBackground";
import { Theme } from "@/theme";
import { ReactNode } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: Math.max(insets.bottom + 24, 36),
        },
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
    >
      <Pressable onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.inner}>
          {topSlot ? <View style={styles.top}>{topSlot}</View> : null}

          <View style={styles.body}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </Pressable>
    </ScrollView>
  ) : (
    <Pressable
      style={styles.flex}
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <View style={styles.inner}>
        {topSlot ? <View style={styles.top}>{topSlot}</View> : null}

        <View style={styles.body}>{children}</View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AuthBackground>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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