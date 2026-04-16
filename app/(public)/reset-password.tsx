import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useForm } from "react-hook-form";

import AuthMetaAction from "@/components/auth/AuthMetaAction";
import AuthShell from "@/components/auth/AuthShell";
import ControlledTextField from "@/components/form/ControlledTextField";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { EmailIcon } from "@/components/ui/InputIcons";
import { Paths } from "@/constants/paths";
import { useAppToast } from "@/hooks/useAppToast";
import { Theme } from "@/theme";

type ResetPasswordFormValues = {
  email: string;
};

export default function ResetPasswordScreen() {
  const { showToast } = useAppToast();

  const { control, handleSubmit, formState } = useForm<ResetPasswordFormValues>(
    {
      mode: "onChange",
      defaultValues: {
        email: "",
      },
    }
  );

  const onSubmit = handleSubmit(async (values) => {
    showToast({
      type: "success",
      message: "Verification code sent to your email.",
    });

    router.push({
      pathname: Paths.verifyEmail,
      params: {
        email: values.email,
        flow: "reset-password",
      },
    });
  });

  return (
    <AuthShell
      topSlot={<BackButton />}
      footer={
        <AuthMetaAction
          prefix="Have an account?"
          actionLabel="Sign In Here"
          onPress={() => router.replace(Paths.signIn)}
        />
      }
    >
      <View style={styles.container}>
        <View style={styles.headerBlock}>
          <AppText variant="title">Reset Password</AppText>
          <AppText style={styles.subtitle}>
            You can reset your account password here
          </AppText>
        </View>

        <View style={styles.form}>
          <ControlledTextField
            control={control}
            name="email"
            label="Your Email"
            placeholder="yourname@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            startIcon={<EmailIcon />}
            rules={{
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Enter a valid email address",
              },
            }}
          />

          <AppButton
            title="Reset Password"
            onPress={onSubmit}
            disabled={!formState.isValid || formState.isSubmitting}
            loading={formState.isSubmitting}
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
    gap: 12,
    marginBottom: 34,
    marginTop: 18,
  },
  subtitle: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
});