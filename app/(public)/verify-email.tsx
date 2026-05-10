import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import AuthShell from "@/components/auth/AuthShell";
import OtpInputRow from "@/components/auth/OtpInputRow";
import VerifyEmailFooter from "@/components/auth/VerifyEmailFooter";
import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import AppButton from "@/components/ui/AppButton";
import AppText from "@/components/ui/AppText";
import BackButton from "@/components/ui/BackButton";
import { Paths } from "@/constants/paths";
import { useResendForgotPasswordOtpMutation } from "@/hooks/api/useResendForgotPasswordOtpMutation";
import { useResendVerificationTokenMutation } from "@/hooks/api/useResendVerificationTokenMutation";
import { useVerifyEmailMutation } from "@/hooks/api/useVerifyEmailMutation";
import { useAppToast } from "@/hooks/useAppToast";
import CheckIcon from "@/svgs/app/CheckIcon";
import { Theme } from "@/theme";

const OTP_LENGTH = 6;
const INITIAL_SECONDS = 60;

type VerifyFlow = "sign-up" | "reset-password";

function getRestartPath(flow: VerifyFlow) {
  return flow === "reset-password" ? Paths.resetPassword : Paths.signUp;
}

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{
    email?: string;
    flow?: VerifyFlow;
  }>();

  const email = typeof params.email === "string" ? params.email : "";
  const flow: VerifyFlow =
    params.flow === "reset-password" ? "reset-password" : "sign-up";

  const { showToast } = useAppToast();

  const verifyEmailMutation = useVerifyEmailMutation();
  const resendVerificationTokenMutation = useResendVerificationTokenMutation();
  const resendForgotPasswordOtpMutation = useResendForgotPasswordOtpMutation();

  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const joinedCode = useMemo(() => code.join(""), [code]);

  const isComplete = useMemo(
    () => code.every((digit) => digit.length === 1),
    [code]
  );

  const isResending =
    resendVerificationTokenMutation.isPending ||
    resendForgotPasswordOtpMutation.isPending;

  const isVerifying = verifyEmailMutation.isPending;

  const isLoading = isVerifying || isResending;

  const canResend = secondsLeft === 0 && !isLoading;

  const title = flow === "reset-password" ? "Verify Reset Code" : "Verify Email";

  const intro =
    flow === "reset-password"
      ? `Enter the ${OTP_LENGTH}-digit password reset code sent to`
      : `Check your inbox & spam folder. We just sent a ${OTP_LENGTH}-digit code to`;

  useEffect(() => {
    if (secondsLeft === 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const focusInput = (index: number): void => {
    inputRefs.current[index]?.focus();
  };

  const resetCode = (): void => {
    setCode(Array(OTP_LENGTH).fill(""));
    requestAnimationFrame(() => focusInput(0));
  };

  const restartFlow = (): void => {
    router.replace(getRestartPath(flow));
  };

  const handleChangeDigit = (index: number, rawValue: string): void => {
    const digits = rawValue.replace(/[^0-9]/g, "");

    if (!digits) {
      const next = [...code];
      next[index] = "";
      setCode(next);
      return;
    }

    const next = [...code];

    digits
      .slice(0, OTP_LENGTH - index)
      .split("")
      .forEach((digit, offset) => {
        next[index + offset] = digit;
      });

    setCode(next);

    const nextFocusIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
    focusInput(nextFocusIndex);
  };

  const handleKeyPressDigit = (
    index: number,
    event: NativeSyntheticEvent<{ key: string }>
  ): void => {
    if (event.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleResend = async (): Promise<void> => {
    if (!canResend) return;

    if (!email) {
      showToast({
        type: "error",
        message: "Email address is missing. Please start again.",
      });

      restartFlow();
      return;
    }

    try {
      const response =
        flow === "reset-password"
          ? await resendForgotPasswordOtpMutation.mutateAsync({ email })
          : await resendVerificationTokenMutation.mutateAsync({ email });

      resetCode();
      setSecondsLeft(INITIAL_SECONDS);

      showToast({
        type: "success",
        message:
          response.message ??
          (flow === "reset-password"
            ? "Password reset OTP resent to your email."
            : "Verification code resent successfully"),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to resend verification code.";

      showToast({
        type: "error",
        message,
      });

      console.log("Resend verification code error:", error);
    }
  };

  const handleVerify = async (): Promise<void> => {
    if (!isComplete || isLoading) return;

    if (!email) {
      showToast({
        type: "error",
        message: "Email address is missing. Please start again.",
      });

      restartFlow();
      return;
    }

    try {
      if (flow === "reset-password") {
        router.replace({
          pathname: Paths.setPassword,
          params: {
            email,
            flow: "reset-password",
            otp: joinedCode,
          },
        });

        return;
      }

      const response = await verifyEmailMutation.mutateAsync({
        email,
        verificationCode: joinedCode,
      });

      showToast({
        type: "success",
        message:
          response.message ??
          "Email verified successfully. Let’s complete your profile.",
      });

      router.replace({
        pathname: Paths.onboarding,
        params: { email },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to verify code.";

      showToast({
        type: "error",
        message,
      });

      console.log("Verify email error:", error);
    }
  };

  return (
    <>
      <AuthShell topSlot={<BackButton />} scroll={false}>
        <View style={styles.container}>
          <View style={styles.headerBlock}>
            <CheckIcon width={54} height={54} />

            <View style={styles.introBlock}>
              <AppText variant="title">{title}</AppText>
              <AppText style={styles.introText}>
                {intro}{" "}
                <AppText style={styles.emailText}>
                  {email || "your email"}
                </AppText>
                .
              </AppText>
            </View>
          </View>

          <View style={styles.formBlock}>
            <OtpInputRow
              values={code}
              onChangeDigit={handleChangeDigit}
              onKeyPressDigit={handleKeyPressDigit}
              inputRefs={inputRefs}
            />

            <AppButton
              title={flow === "reset-password" ? "Continue" : "Verify Email"}
              onPress={handleVerify}
              disabled={!isComplete || isLoading}
              loading={flow === "sign-up" && isVerifying}
            />
          </View>

          <View style={styles.footerBlock}>
            <VerifyEmailFooter
              secondsLeft={secondsLeft}
              canResend={canResend}
              onResend={handleResend}
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
    gap: 18,
    marginTop: 18,
    marginBottom: 26,
  },
  introBlock: {
    gap: 10,
  },
  introText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  emailText: {
    color: Theme.colors.primary,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Theme.fonts.body.medium,
  },
  formBlock: {
    gap: 22,
  },
  footerBlock: {
    marginTop: 42,
    alignItems: "center",
  },
});