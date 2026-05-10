import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import AuthMetaAction from "@/components/auth/AuthMetaAction";
import AuthShell from "@/components/auth/AuthShell";
import AuthTermsNotice from "@/components/auth/AuthTermsNotice";
import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import ControlledTextField from "@/components/form/ControlledTextField";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import DividerText from "@/components/ui/DividerText";
import { EmailIcon, LockIcon } from "@/components/ui/InputIcons";
import SocialButton from "@/components/ui/SocialButton";
import { Paths } from "@/constants/paths";
import { useAppToast } from "@/hooks/useAppToast";
import { useRegisterMutation } from "@/hooks/api/useRegisterMutation";
import { useSignUpForm } from "@/hooks/useSignUpForms";
import { Theme } from "@/theme";

export default function SignUpScreen() {
  const { control, handleSubmit, formState } = useSignUpForm();
  const { showToast } = useAppToast();
  const registerMutation = useRegisterMutation();

  const isLoading = formState.isSubmitting || registerMutation.isPending;

  const onSubmit = handleSubmit(async (values) => {
    const email = values.email.trim().toLowerCase();

    try {
      const response = await registerMutation.mutateAsync({
        email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      showToast({
        type: "success",
        message:
          response.message ??
          "Registration successful! Please check your email for the verification code.",
      });

      router.push({
        pathname: Paths.verifyEmail,
        params: { email },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to continue sign up.";

      showToast({
        type: "error",
        message,
      });

      console.log("Register error:", error);
    }
  });

  const handleGoogleContinue = (): void => {
    showToast({
      type: "error",
      message: "Google sign up is not available yet.",
    });
  };

  return (
    <>
      <AuthShell
        topSlot={<BackButton />}
        footer={
          <AuthMetaAction
            prefix="Have an account?"
            actionLabel="Sign In Here"
            onPress={() => router.push(Paths.signIn)}
          />
        }
      >
        <View style={styles.container}>
          <View style={styles.headerBlock}>
            <AppText variant="title">Create An Account</AppText>
            <AppText style={styles.subtitle}>
              Join the community of vigilant citizens today.
            </AppText>
          </View>

          <View style={styles.form}>
            <SocialButton
              title="Continue With Google"
              onPress={handleGoogleContinue}
            />

            <DividerText text="OR SIGN UP WITH EMAIL" />

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
              label="Set Password"
              placeholder="Your password"
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
              placeholder="Confirm your password"
              secureTextEntry
              secureToggle
              autoCapitalize="none"
              autoCorrect={false}
              startIcon={<LockIcon />}
            />

            <AppButton
              title="Sign Up"
              onPress={onSubmit}
              loading={isLoading}
              disabled={!formState.isValid || isLoading}
            />
          </View>

          <View style={styles.termsBlock}>
            <AuthTermsNotice />
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
  termsBlock: {
    marginTop: 28,
  },
});