import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";

import AuthMetaAction from "@/components/auth/AuthMetaAction";
import AuthTermsNotice from "@/components/auth/AuthTermsNotice";
import BackButton from "@/components/ui/BackButton";
import DividerText from "@/components/ui/DividerText";
import SocialButton from "@/components/ui/SocialButton";

import AuthShell from "@/components/auth/AuthShell";
import AppScreenLoader from "@/components/feedback/AppScreenLaoder";
import ControlledTextField from "@/components/form/ControlledTextField";
import { EmailIcon, LockIcon } from "@/components/ui/InputIcons";
import { Paths } from "@/constants/paths";
import { useAppToast } from "@/hooks/useAppToast";
import { useSignUpForm } from "@/hooks/useSignUpForms";
import { Theme } from "@/theme";

export default function SignUpScreen() {
  const { control, handleSubmit, formState } = useSignUpForm();
  const { showToast } = useAppToast();
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1800));

      setLoading(false);

      showToast({
        type: "success",
        message: "Account created. Verify your email.",
      });

      setTimeout(() => {
        router.push({
          pathname: Paths.verifyEmail,
          params: { email: values.email },
        });
      }, 450);
    } catch (error) {
      setLoading(false);

      showToast({
        type: "error",
        message: "Unable to continue sign up.",
      });

      console.log("Sign up simulation error:", error);
    }
  });

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
              onPress={() => router.push(Paths.setPassword)}
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

            <AppButton
              title="Sign Up"
              onPress={onSubmit}
              loading={formState.isSubmitting || loading}
              disabled={!formState.isValid || loading}
            />
          </View>

          <View style={styles.termsBlock}>
            <AuthTermsNotice />
          </View>
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