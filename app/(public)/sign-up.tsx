import { router } from "expo-router";
import { useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { useGoogleAuthMutation } from "@/hooks/api/useGoogleAuthMutation";
import { useRegisterMutation } from "@/hooks/api/useRegisterMutation";
import { useAppToast } from "@/hooks/useAppToast";
import { useSignUpForm } from "@/hooks/useSignUpForms";
import { signInWithGoogle } from "@/lib/auth/googleAuth";
import { mapMobileUserToAuthUser } from "@/lib/auth/mapMobileUserToAuthUser";
import { Theme } from "@/theme";

export default function SignUpScreen() {
  const { control, handleSubmit, formState } = useSignUpForm();
  const { signIn } = useAuth();
  const { showToast } = useAppToast();

  const registerMutation = useRegisterMutation();
  const googleMutation = useGoogleAuthMutation();

  // Tracks the time spent inside the native Google sheet before our backend
  // mutation begins. Without this, the screen loader would flicker off
  // between the sheet closing and the API call starting.
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  const isLoading =
    formState.isSubmitting ||
    registerMutation.isPending ||
    isGoogleSigningIn ||
    googleMutation.isPending;

  // ---------------------------------------------------------------------------
  // Email + password sign-up (unchanged)
  // ---------------------------------------------------------------------------

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
        error instanceof Error ? error.message : "Unable to continue sign up.";

      showToast({ type: "error", message });
      console.log("Register error:", error);
    }
  });

  // ---------------------------------------------------------------------------
  // Google sign-up / sign-in
  //
  // One endpoint handles both. Backend tells us which via `requiresPasswordSetup`:
  //   - true  → first-time Google user → set-password screen
  //   - false → returning user         → app home
  //
  // In both cases we call signIn() first so the auth token is persisted in
  // SecureStore. The set-password screen can then make authenticated requests
  // using the token from AuthContext.
  // ---------------------------------------------------------------------------

  const handleGoogleContinue = async (): Promise<void> => {
    setIsGoogleSigningIn(true);

    try {
      const result = await signInWithGoogle();

      // User dismissed the Google sheet — stay silent, no toast.
      if (result.kind === "cancelled") {
        return;
      }

      // Library-level error (no Play Services, missing idToken, etc.)
      if (result.kind === "error") {
        showToast({ type: "error", message: result.message });
        return;
      }

      // result.kind === "success" — we have a Google idToken.
      // Exchange it with our backend for a session token.
      const response = await googleMutation.mutateAsync({
        idToken: result.idToken,
      });

      if (!response.token) {
        throw new Error(
          "Sign-in succeeded with Google but no session token was returned."
        );
      }

      // Hand the session to AuthContext. Even if password setup is pending,
      // we persist the token now so the set-password screen can call the
      // backend with a valid Authorization header.
      await signIn(mapMobileUserToAuthUser(response.user, result.email), {
        token: response.token,
        refreshToken: response.refreshToken ?? null,
        hasCompletedOnboarding: !response.requiresPasswordSetup,
      });

      if (response.requiresPasswordSetup) {
        // First-time Google user. Send them to set-password.
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

      // Returning user — straight to the app.
      showToast({
        type: "success",
        message: response.message ?? "Signed in with Google.",
      });
      router.replace(Paths.appHome);
    } catch (error) {
      const raw =
        error instanceof Error ? error.message : "Unable to continue with Google.";

      // Backend returns "already registered" when the Google email matches an
      // existing email/password account. Guide the user to sign in instead of
      // showing a confusing raw error message.
      const isExistingAccount =
        raw.toLowerCase().includes("already registered") ||
        raw.toLowerCase().includes("already exists") ||
        raw.toLowerCase().includes("please sign in");

      if (isExistingAccount) {
        showToast({
          type: "success",
          message:
            "You already have an account with this email. Signing you in…",
        });
        // Brief pause so the user can read the toast, then go to sign-in.
        setTimeout(() => router.replace(Paths.signIn), 1400);
      } else {
        showToast({ type: "error", message: raw });
      }

      console.log("Google sign-up error:", error);
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
              disabled={isLoading}
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
  flexGrow: 1,
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