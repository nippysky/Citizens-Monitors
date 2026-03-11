import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";

import AuthMetaAction from "@/components/auth/AuthMetaAction";
import BackButton from "@/components/ui/BackButton";
import DividerText from "@/components/ui/DividerText";
import SocialButton from "@/components/ui/SocialButton";

import AuthShell from "@/components/auth/AuthShell";
import ControlledTextField from "@/components/form/ControlledTextField";
import { EmailIcon, LockIcon } from "@/components/ui/InputIcons";
import { Paths } from "@/constants/paths";
import { useAppToast } from "@/hooks/useAppToast";
import { useSignInForm } from "@/hooks/useSignInForms";
import { Theme } from "@/theme";

export default function SignInScreen() {
  const { control, handleSubmit, formState } = useSignInForm();
  const { showToast } = useAppToast();

  const onSubmit = handleSubmit(async (values) => {
    console.log("Sign in values:", values);

    showToast({
      type: "success",
      message: "Signed in successfully.",
    });
  });

  return (
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
            onPress={() => router.push(Paths.setPassword)}
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
            loading={formState.isSubmitting}
            disabled={!formState.isValid || formState.isSubmitting}
          />
        </View>

        <View style={styles.metaBlock}>
          <AuthMetaAction
            prefix="Forgot your password?"
            actionLabel="Reset Password"
            underline
            stacked
          />
        </View>
      </View>
    </AuthShell>
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