import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import AuthShell from "@/components/auth/AuthShell";
import AuthTermsSetPassword from "@/components/auth/AuthTermsSetpassword";
import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import ControlledTextField from "@/components/form/ControlledTextField";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { LockIcon } from "@/components/ui/InputIcons";
import { Paths } from "@/constants/paths";
import { useAppToast } from "@/hooks/useAppToast";
import { useSetPasswordForm } from "@/hooks/useSetPasswordForm";
import { Theme } from "@/theme";

type FlowType = "sign-up" | "reset-password";

export default function SetPasswordScreen() {
  const params = useLocalSearchParams<{
    email?: string;
    flow?: FlowType;
  }>();

  const flow: FlowType =
    params.flow === "reset-password" ? "reset-password" : "sign-up";

  const { control, handleSubmit, formState } = useSetPasswordForm();
  const [loading, setLoading] = useState(false);
  const { showToast } = useAppToast();

  const copy = useMemo(() => {
    if (flow === "reset-password") {
      return {
        title: "Set New Password",
        subtitle: "You can reset your account password here",
        buttonLabel: "Set Password",
        successMessage: "Password reset successful.",
      };
    }

    return {
      title: "Set Password",
      subtitle:
        "Create a password so you can also sign in with your email next time — without needing Google.",
      buttonLabel: "Set Password",
      successMessage: "Password set successfully.",
    };
  }, [flow]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1800));

      showToast({
        type: "success",
        message: copy.successMessage,
      });

      console.log("Set password values:", {
        ...values,
        email: params.email,
        flow,
      });

      setTimeout(() => {
        if (flow === "reset-password") {
          router.replace(Paths.signIn);
          return;
        }

        router.replace(Paths.onboarding);
      }, 400);
    } catch {
      showToast({
        type: "error",
        message: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      <AuthShell topSlot={<BackButton />}>
        <View style={styles.container}>
          <View style={styles.headerBlock}>
            <AppText variant="title">{copy.title}</AppText>
            <AppText style={styles.subtitle}>{copy.subtitle}</AppText>
          </View>

          <View style={styles.form}>
            <ControlledTextField
              control={control}
              name="password"
              label={flow === "reset-password" ? "New Password" : "Set Password"}
              placeholder={flow === "reset-password" ? "Password" : "Your password"}
              secureTextEntry
              secureToggle
              autoCapitalize="none"
              autoCorrect={false}
              startIcon={<LockIcon />}
            />

            <ControlledTextField
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter your password"
              secureTextEntry
              secureToggle
              autoCapitalize="none"
              autoCorrect={false}
              startIcon={<LockIcon />}
            />

            <AppButton
              title={copy.buttonLabel}
              onPress={onSubmit}
              loading={formState.isSubmitting || loading}
              disabled={!formState.isValid || loading}
            />
          </View>

          {flow === "sign-up" ? (
            <View style={styles.termsBlock}>
              <AuthTermsSetPassword />
            </View>
          ) : null}
        </View>
      </AuthShell>

      <AppScreenLoader visible={loading} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    gap: 20,
    marginBottom: 34,
    marginTop: 20,
  },
  subtitle: {
    color: Theme.colors.text,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 330,
  },
  form: {
    gap: 16,
  },
  termsBlock: {
    marginTop: 30,
  },
});