import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  generateAnonymousUsername,
  MobileNotificationSettingsState,
  submitFeedback,
  SubmitFeedbackPayload,
  updateAnonymousIdentity,
  UpdateAnonymousIdentityPayload,
  updateMyProfile,
  UpdateMyProfilePayload,
  updateNotificationSettings,
  updatePassword,
  UpdatePasswordPayload,
} from "@/lib/api/profile.api";

export const profileQueryKeys = {
  me: ["profile", "me"] as const,
  notifications: ["profile", "notifications"] as const,
  banks: ["profile", "banks"] as const,
};

export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMyProfilePayload) => updateMyProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me,
      });
    },
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => updatePassword(payload),
  });
}

export function useUpdateNotificationSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MobileNotificationSettingsState) =>
      updateNotificationSettings(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: profileQueryKeys.notifications,
      });
      await queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me,
      });
    },
  });
}

export function useGenerateAnonymousUsernameMutation() {
  /**
   * Important:
   * Do NOT invalidate/refetch profile here.
   * The generated name is treated as a local draft inside the profile sheet
   * until the user taps "Save Changes".
   */
  return useMutation({
    mutationFn: generateAnonymousUsername,
  });
}

export function useUpdateAnonymousIdentityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAnonymousIdentityPayload) =>
      updateAnonymousIdentity(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: profileQueryKeys.me,
      });
    },
  });
}

export function useSubmitFeedbackMutation() {
  return useMutation({
    mutationFn: (payload: SubmitFeedbackPayload) => submitFeedback(payload),
  });
}