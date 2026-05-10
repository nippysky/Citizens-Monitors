import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  generateAnonymousUsername,
  MobileNotificationSettingsState,
  submitFeedback,
  SubmitFeedbackPayload,
  updateAnonymousIdentity,
  updateMobileNotificationSettings,
  updateMyPassword,
  UpdateAnonymousIdentityPayload,
  UpdatePasswordPayload,
} from "@/lib/api/profile.api";

export function useUpdatePasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => updateMyPassword(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
}

export function useUpdateNotificationSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MobileNotificationSettingsState) =>
      updateMobileNotificationSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      void queryClient.invalidateQueries({
        queryKey: ["profile", "notifications"],
      });
    },
  });
}

export function useGenerateAnonymousUsernameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateAnonymousUsername,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
}

export function useUpdateAnonymousIdentityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAnonymousIdentityPayload) =>
      updateAnonymousIdentity(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
}

export function useSubmitFeedbackMutation() {
  return useMutation({
    mutationFn: (payload: SubmitFeedbackPayload) => submitFeedback(payload),
  });
}