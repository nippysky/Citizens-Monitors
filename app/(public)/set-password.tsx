import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
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
import { useResetPasswordMutation } from "@/hooks/api/useResetPasswordMutation";
import { useSetPasswordMutation } from "@/hooks/api/useSetPasswordMutation";
import { useAppToast } from "@/hooks/useAppToast";
import { useSetPasswordForm } from "@/hooks/useSetPasswordForm";
import { Theme } from "@/theme";

type FlowType = "sign-up" | "reset-password";

export default function SetPasswordScreen() {
  const params = useLocalSearchParams<{
    email?: string;
    otp?: string;
    flow?: FlowType;
  }>();

  const email = typeof params.email === "string" ? params.email : "";
  const otp = typeof params.otp === "string" ? params.otp : "";

  const flow: FlowType =
    params.flow === "reset-password" ? "reset-password" : "sign-up";

  const { control, handleSubmit, formState } = useSetPasswordForm();
  const { showToast } = useAppToast();

  const resetPasswordMutation = useResetPasswordMutation();
  const setPasswordMutation = useSetPasswordMutation();

  const isLoading =
    formState.isSubmitting ||
    resetPasswordMutation.isPending ||
    setPasswordMutation.isPending;

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
      // -----------------------------------------------------------------------
      // Reset-password flow (OTP-based) — UNCHANGED
      // -----------------------------------------------------------------------
      if (flow === "reset-password") {
        if (!email || !otp) {
          showToast({
            type: "error",
            message: "Reset session expired. Please request a new code.",
          });

          router.replace(Paths.resetPassword);
          return;
        }

        const response = await resetPasswordMutation.mutateAsync({
          email,
          otp,
          password: values.password,
        });

        showToast({
          type: "success",
          message: response.message ?? copy.successMessage,
        });

        router.replace(Paths.signIn);
        return;
      }

      // -----------------------------------------------------------------------
      // Sign-up flow (Google OAuth password setup)
      //
      // User is already authenticated — apiRequest auto-attaches the Bearer
      // token from SecureStore. After success, send them to the onboarding
      // wizard with their email so it can drive submitDetails/selectRole/etc.
      // -----------------------------------------------------------------------
      const response = await setPasswordMutation.mutateAsync({
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      showToast({
        type: "success",
        message: response.message ?? copy.successMessage,
      });

      // Forward email so the onboarding screen can use it for backend calls.
      // Without this, onboarding's requireEmailOrRestart() would bounce the
      // user back to sign-up.
      router.replace({
        pathname: Paths.onboarding,
        params: { email },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";

      showToast({
        type: "error",
        message,
      });

      console.log("Set password error:", error);
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
              placeholder={
                flow === "reset-password" ? "Password" : "Your password"
              }
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
              loading={isLoading}
              disabled={!formState.isValid || isLoading}
            />
          </View>

          {flow === "sign-up" ? (
            <View style={styles.termsBlock}>
              <AuthTermsSetPassword />
            </View>
          ) : null}
        </View>
      </AuthShell>

      <AppScreenLoader visible={isLoading} />
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