import { ApiEnv } from "@/lib/api/env";

type ApiErrorPayload = {
  message?: string;
  error?: string;
  errors?: string[] | Record<string, string[] | string>;
};

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${ApiEnv.baseUrl}${normalizedPath}`;
}

function getApiErrorMessage(data: ApiErrorPayload | null): string {
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

  return "Something went wrong. Please try again.";
}

async function parseResponseBody<T>(response: Response): Promise<{
  data: T | ApiErrorPayload | null;
  raw: string;
}> {
  const raw = await response.text();

  if (!raw) {
    return {
      data: null,
      raw,
    };
  }

  try {
    return {
      data: JSON.parse(raw) as T | ApiErrorPayload,
      raw,
    };
  } catch {
    return {
      data: null,
      raw,
    };
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const method = options.method ?? "GET";
  const url = buildUrl(path);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Inhouse-Access-Token": ApiEnv.inhouseAccessToken,
    ...options.headers,
  };

  if (__DEV__) {
    console.log("[API Fetch Request]", {
      method,
      url,
      hasInhouseToken: Boolean(ApiEnv.inhouseAccessToken),
      tokenPreview: `${ApiEnv.inhouseAccessToken.slice(
        0,
        6
      )}...${ApiEnv.inhouseAccessToken.slice(-6)}`,
      body: options.body,
    });
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body:
        method === "GET" || method === "DELETE" || options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
    });
  } catch (error) {
    if (__DEV__) {
      console.log("[API Fetch Network Error]", {
        method,
        url,
        error,
      });
    }

    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  const { data, raw } = await parseResponseBody<T>(response);

  if (__DEV__) {
    console.log("[API Fetch Response]", {
      method,
      url,
      status: response.status,
      ok: response.ok,
      data,
      raw,
    });
  }

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data as ApiErrorPayload | null));
  }

  return data as T;
}