import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import AuthMetaAction from "@/components/auth/AuthMetaAction";
import AuthShell from "@/components/auth/AuthShell";
import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import ControlledTextField from "@/components/form/ControlledTextField";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import DividerText from "@/components/ui/DividerText";
import { EmailIcon, LockIcon } from "@/components/ui/InputIcons";
import SocialButton from "@/components/ui/SocialButton";
import { Paths } from "@/constants/paths";
import { useAuth } from "@/context/AuthContext";
import { useSignInMutation } from "@/hooks/api/useSignInMutation";
import { useAppToast } from "@/hooks/useAppToast";
import { useSignInForm } from "@/hooks/useSignInForms";
import { mapMobileUserToAuthUser } from "@/lib/auth/mapMobileUserToAuthUser";
import { Theme } from "@/theme";

export default function SignInScreen() {
  const { control, handleSubmit, formState } = useSignInForm();
  const { signIn } = useAuth();
  const { showToast } = useAppToast();
  const signInMutation = useSignInMutation();

  const isLoading = formState.isSubmitting || signInMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    const email = values.email.trim().toLowerCase();

    try {
      const response = await signInMutation.mutateAsync({
        email,
        password: values.password,
      });

      if (!response.token) {
        throw new Error("Login succeeded but no session token was returned.");
      }

      await signIn(mapMobileUserToAuthUser(response.user, email), {
        token: response.token,
        hasCompletedOnboarding: true,
      });

      showToast({
        type: "success",
        message: response.message ?? "Login successfully",
      });

      router.replace(Paths.appHome);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";

      showToast({
        type: "error",
        message,
      });

      console.log("Sign in error:", error);
    }
  });

  const handleGoogleContinue = (): void => {
    showToast({
      type: "error",
      message: "Google sign in is not available yet.",
    });
  };

  return (
    <>
      <AuthShell
        topSlot={<BackButton />}
        footer={
          <AuthMetaAction
            prefix="Don’t have an account?"
            actionLabel="Sign Up Here"
            onPress={() => router.push(Paths.signUp)}
          />
        }
      >
        <View style={styles.container}>
          <View style={styles.headerBlock}>
            <AppText variant="title">Welcome Back, Sign In</AppText>
            <AppText style={styles.subtitle}>
              Sign in to continue monitoring your right.
            </AppText>
          </View>

          <View style={styles.form}>
            <SocialButton
              title="Continue With Google"
              onPress={handleGoogleContinue}
            />

            <DividerText text="OR SIGN IN WITH" />

            <ControlledTextField
              control={control}
              name="email"
              label="Your Email"
              placeholder="yourname@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              startIcon={<EmailIcon />}
            />

            <ControlledTextField
              control={control}
              name="password"
              label="Your Password"
              placeholder="Your password"
              secureTextEntry
              secureToggle
              autoCapitalize="none"
              autoCorrect={false}
              startIcon={<LockIcon />}
            />

            <AppButton
              title="Sign In"
              onPress={onSubmit}
              loading={isLoading}
              disabled={!formState.isValid || isLoading}
            />
          </View>

          <View style={styles.metaBlock}>
            <AuthMetaAction
              prefix="Forgot your password?"
              actionLabel="Reset Password"
              underline
              stacked
              onPress={() => router.push(Paths.resetPassword)}
            />
          </View>
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
    marginBottom: 30,
    marginTop: 20,
  },
  subtitle: {
    color: Theme.colors.textMuted,
    fontSize: 17,
    lineHeight: 25,
  },
  form: {
    gap: 16,
  },
  metaBlock: {
    alignItems: "center",
    marginTop: 26,
  },
});