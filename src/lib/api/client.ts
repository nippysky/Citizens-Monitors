import { create, isAxiosError, type AxiosError } from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const INHOUSE_ACCESS_TOKEN = process.env.EXPO_PUBLIC_INHOUSE_ACCESS_TOKEN;

if (!API_BASE_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_BASE_URL");
}

if (!INHOUSE_ACCESS_TOKEN) {
  throw new Error("Missing EXPO_PUBLIC_INHOUSE_ACCESS_TOKEN");
}

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Inhouse-Access-Token": INHOUSE_ACCESS_TOKEN,
  },
});

type ApiErrorPayload = {
  message?: string;
  error?: string;
  errors?: string[] | Record<string, string[] | string>;
};

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorPayload>(error)) {
    const axiosError: AxiosError<ApiErrorPayload> = error;
    const data = axiosError.response?.data;

    if (data?.message) return data.message;

    if (data?.error) return data.error;

    if (Array.isArray(data?.errors)) {
      return data.errors[0] ?? "Something went wrong.";
    }

    if (data?.errors && typeof data.errors === "object") {
      const firstError = Object.values(data.errors)[0];

      if (Array.isArray(firstError)) {
        return firstError[0] ?? "Something went wrong.";
      }

      if (typeof firstError === "string") {
        return firstError;
      }
    }

    if (axiosError.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }

    if (!axiosError.response) {
      return "Network error. Please check your internet connection.";
    }
  }

  return "Something went wrong. Please try again.";
}