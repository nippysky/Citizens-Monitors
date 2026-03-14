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
import VerifyEmailIntro from "@/components/auth/VerifyEmailIntor";
import AppScreenLoader from "@/components/feedback/AppScreenLoader";
import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import { Paths } from "@/constants/paths";
import { useAppToast } from "@/hooks/useAppToast";
import CheckIcon from "@/svgs/CheckIcon";

const OTP_LENGTH = 5;
const INITIAL_SECONDS = 60;

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email ?? "yourname@gmail.com";

  const { showToast } = useAppToast();

  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  const isComplete = useMemo(() => code.every((digit) => digit.length === 1), [code]);
  const joinedCode = code.join("");
  const canResend = secondsLeft === 0;

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

  const handleChangeDigit = (index: number, rawValue: string): void => {
    const value = rawValue.replace(/[^0-9]/g, "").slice(0, 1);

    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyPressDigit = (
    index: number,
    e: NativeSyntheticEvent<{ key: string }>
  ): void => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handleResend = async (): Promise<void> => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
    setCode(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(INITIAL_SECONDS);

    showToast({
      type: "success",
      message: "OTP resent to your email.",
    });

    focusInput(0);
  };

  const handleVerify = async (): Promise<void> => {
    if (!isComplete) return;

    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 1800));

      setLoading(false);

      if (joinedCode === "12345") {
        showToast({
          type: "success",
          message: "Email verified. Let’s complete your profile.",
        });

        setTimeout(() => {
          router.replace({
            pathname: Paths.onboarding,
            params: { email },
          });
        }, 450);
      } else {
        showToast({
          type: "error",
          message: "Wrong verification code.",
        });
      }
    } catch {
      setLoading(false);
      showToast({
        type: "error",
        message: "Unable to verify code.",
      });
    }
  };

  return (
    <>
      <AuthShell topSlot={<BackButton />} scroll={false}>
        <View style={styles.container}>
          <View style={styles.headerBlock}>
            <CheckIcon width={54} height={54} />
            <VerifyEmailIntro email={email} />
          </View>

          <View style={styles.formBlock}>
            <OtpInputRow
              values={code}
              onChangeDigit={handleChangeDigit}
              onKeyPressDigit={handleKeyPressDigit}
              inputRefs={inputRefs}
            />

            <AppButton
              title="Verify Email"
              onPress={handleVerify}
              disabled={!isComplete || loading}
              loading={loading}
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

      <AppScreenLoader visible={loading} />
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
  formBlock: {
    gap: 22,
  },
  footerBlock: {
    marginTop: 42,
    alignItems: "center",
  },
});