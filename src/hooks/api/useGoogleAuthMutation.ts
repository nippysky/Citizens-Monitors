// React Query mutation wrapping the Google OAuth exchange.
//
// Mirrors the pattern of useSignInMutation / useRegisterMutation:
//  - No automatic onSuccess / onError; the caller handles routing, toasts,
//    and auth-context updates.
//  - Returns the raw mutation so screens can read isPending, mutateAsync,
//    etc. directly.

import { useMutation } from "@tanstack/react-query";

import {
  googleAuth,
  type GoogleAuthPayload,
  type GoogleAuthResponse,
} from "@/lib/api/auth.api";

export function useGoogleAuthMutation() {
  return useMutation<GoogleAuthResponse, Error, GoogleAuthPayload>({
    mutationFn: googleAuth,
  });
}