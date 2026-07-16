import { router } from "expo-router";
import { useState } from "react";
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
import { useGoogleAuthMutation } from "@/hooks/api/useGoogleAuthMutation";
import { useSignInMutation } from "@/hooks/api/useSignInMutation";
import { useAppToast } from "@/hooks/useAppToast";
import { useSignInForm } from "@/hooks/useSignInForms";
import { signInWithGoogle } from "@/lib/auth/googleAuth";
import { mapMobileUserToAuthUser } from "@/lib/auth/mapMobileUserToAuthUser";
import { markFreshBiometricLogin } from "@/hooks/useBiometricGate";
import { Theme } from "@/theme";

export default function SignInScreen() {
  const { control, handleSubmit, formState } = useSignInForm();
  const { signIn } = useAuth();
  const { showToast } = useAppToast();

  const signInMutation = useSignInMutation();
  const googleMutation = useGoogleAuthMutation();

  // Tracks the time spent inside the native Google sheet before our backend
  // mutation begins. Without this, the screen loader would flicker off
  // between the sheet closing and the API call starting.
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const isLoading =
    formState.isSubmitting ||
    signInMutation.isPending ||
    isGoogleSigningIn ||
    googleMutation.isPending;

  // ---------------------------------------------------------------------------
  // Email + password sign-in (unchanged)
  // ---------------------------------------------------------------------------

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

      // Mark this as a fresh password login so the biometric gate skips once.
      await markFreshBiometricLogin();

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

      showToast({ type: "error", message });
      console.log("Sign in error:", error);
    }
  });

  // ---------------------------------------------------------------------------
  // Google sign-in
  //
  // Same endpoint as sign-up. Backend tells us via `requiresPasswordSetup`
  // whether to send the user to the set-password screen (first-time Google
  // user) or straight to app home (returning user).
  // ---------------------------------------------------------------------------

  const handleGoogleContinue = async (): Promise<void> => {
    setIsGoogleSigningIn(true);

    try {
      const result = await signInWithGoogle();

      if (result.kind === "cancelled") {
        return;
      }

      if (result.kind === "error") {
        showToast({ type: "error", message: result.message });
        return;
      }

      const response = await googleMutation.mutateAsync({
        idToken: result.idToken,
      });

      if (!response.token) {
        throw new Error(
          "Sign-in succeeded with Google but no session token was returned."
        );
      }

      // Persist the session so the set-password screen can use the token
      // for any authenticated calls it needs to make.
      await markFreshBiometricLogin();
      await signIn(mapMobileUserToAuthUser(response.user, result.email), {
        token: response.token,
        hasCompletedOnboarding: !response.requiresPasswordSetup,
      });

      if (response.requiresPasswordSetup) {
        showToast({
          type: "success",
          message:
            response.message ??
            "Welcome! Set a password to finish creating your account.",
        });
        router.replace({
          pathname: Paths.setPassword,
          params: { email: result.email },
        });
        return;
      }

      showToast({
        type: "success",
        message: response.message ?? "Signed in with Google.",
      });
      router.replace(Paths.appHome);
    } catch (error) {
      const raw =
        error instanceof Error ? error.message : "Unable to sign in with Google.";

      // If the backend says the account needs email/password, guide the user
      // rather than showing the raw error.
      const isPasswordAccount =
        raw.toLowerCase().includes("already registered") ||
        raw.toLowerCase().includes("already exists") ||
        raw.toLowerCase().includes("please sign in");

      showToast({
        type: "error",
        message: isPasswordAccount
          ? "This account uses email and password. Please enter your credentials below."
          : raw,
      });

      console.log("Google sign-in error:", error);
    } finally {
      setIsGoogleSigningIn(false);
    }
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
              disabled={isLoading}
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