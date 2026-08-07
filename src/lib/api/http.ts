import { getApiAccessToken } from "@/lib/api/authToken";
import { ApiEnv } from "@/lib/api/env";

type ApiErrorPayload = {
  message?: string;
  error?: string;
  errors?: string[] | Record<string, string[] | string>;
};

/**
 * Thrown by apiRequest when the server returns a non-2xx status.
 * Carries the HTTP status code so callers can handle 404 (not implemented)
 * differently from 400 (bad request) or 500 (server error).
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
  timeoutMs?: number;
};

type ParsedResponse<T> = {
  data: T | ApiErrorPayload | null;
  raw: string;
};

const DEFAULT_TIMEOUT_MS = 120_000;
const MULTIPART_TIMEOUT_MS = 180_000;

function buildUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${ApiEnv.baseUrl}${normalizedPath}`;
}

function isFormDataBody(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
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

function parseRawBody<T>(raw: string): ParsedResponse<T> {
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

async function parseFetchResponseBody<T>(
  response: Response
): Promise<ParsedResponse<T>> {
  const raw = await response.text();

  return parseRawBody<T>(raw);
}

function buildHeaders({
  headers,
  isMultipart,
  auth,
}: {
  headers?: Record<string, string>;
  isMultipart: boolean;
  auth?: boolean;
}): Record<string, string> {
  const token = getApiAccessToken();

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    "X-Inhouse-Access-Token": ApiEnv.inhouseAccessToken,
    ...headers,
  };

  /**
   * Never set Content-Type manually for FormData.
   * React Native must generate the multipart boundary.
   */
  if (!isMultipart) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth !== false && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  return requestHeaders;
}

function logRequest({
  method,
  url,
  headers,
  isMultipart,
  body,
}: {
  method: string;
  url: string;
  headers: Record<string, string>;
  isMultipart: boolean;
  body: unknown;
}) {
  // Request logging suppressed — only errors are logged.
}

function logResponse({
  method,
  url,
  status,
  ok,
  data,
  raw,
  transport,
}: {
  method: string;
  url: string;
  status: number;
  ok: boolean;
  data: unknown;
  raw: string;
  transport: "fetch" | "xhr";
}) {
  // Response logging suppressed — only errors are logged.
}

function logNetworkError({
  method,
  url,
  error,
  transport,
}: {
  method: string;
  url: string;
  error: unknown;
  transport: "fetch" | "xhr";
}) {
  if (!__DEV__) return;

  console.log("[API Network Error]", {
    method,
    url,
    transport,
    error,
  });
}

function apiMultipartRequest<T>({
  method,
  url,
  headers,
  body,
  timeoutMs,
}: {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: FormData;
  timeoutMs: number;
}): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url);
    xhr.timeout = timeoutMs;

    Object.entries(headers).forEach(([key, value]) => {
      /**
       * Defensive: never allow multipart Content-Type to be set manually.
       */
      if (key.toLowerCase() === "content-type") return;

      xhr.setRequestHeader(key, value);
    });

    xhr.onload = () => {
      const status = xhr.status;
      const raw =
        typeof xhr.responseText === "string" ? xhr.responseText : "";

      const { data } = parseRawBody<T>(raw);
      const ok = status >= 200 && status < 300;

      logResponse({
        method,
        url,
        status,
        ok,
        data,
        raw,
        transport: "xhr",
      });

      if (!ok) {
        // NOTE: a 401 is NOT treated as session death here. The apiRequest
        // wrapper first tries a silent token refresh and replays the call;
        // only a rejected refresh ends the session.
        reject(new ApiError(getApiErrorMessage(data as ApiErrorPayload | null), status));
        return;
      }

      resolve(data as T);
    };

    xhr.onerror = () => {
      const error = new Error(
        "Unable to reach the server. Please check your connection and try again."
      );

      logNetworkError({
        method,
        url,
        error,
        transport: "xhr",
      });

      reject(error);
    };

    xhr.ontimeout = () => {
      const error = new Error(
        "The upload took too long. Please try again with a stable connection."
      );

      logNetworkError({
        method,
        url,
        error,
        transport: "xhr",
      });

      reject(error);
    };

    xhr.onabort = () => {
      const error = new Error("Upload cancelled.");

      logNetworkError({
        method,
        url,
        error,
        transport: "xhr",
      });

      reject(error);
    };

    xhr.send(body);
  });
}

async function performApiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const method = options.method ?? "GET";
  const url = buildUrl(path);
  const requestBody = options.body;
  const isMultipart = isFormDataBody(requestBody);
  const timeoutMs =
    options.timeoutMs ??
    (isMultipart ? MULTIPART_TIMEOUT_MS : DEFAULT_TIMEOUT_MS);

  const headers = buildHeaders({
    headers: options.headers,
    isMultipart,
    auth: options.auth,
  });

  logRequest({
    method,
    url,
    headers,
    isMultipart,
    body: requestBody,
  });

  if (
    isMultipart &&
    method !== "GET" &&
    method !== "DELETE"
  ) {
    return apiMultipartRequest<T>({
      method,
      url,
      headers,
      body: requestBody,
      timeoutMs,
    });
  }

  let response: Response;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      response = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
        body:
          method === "GET" || method === "DELETE" || requestBody === undefined
            ? undefined
            : JSON.stringify(requestBody),
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    logNetworkError({
      method,
      url,
      error,
      transport: "fetch",
    });

    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  const { data, raw } = await parseFetchResponseBody<T>(response);

  logResponse({
    method,
    url,
    status: response.status,
    ok: response.ok,
    data,
    raw,
    transport: "fetch",
  });

  if (!response.ok) {
    // See note in apiMultipartRequest — 401 recovery is handled by the
    // apiRequest wrapper via silent refresh + replay.
    throw new ApiError(
      getApiErrorMessage(data as ApiErrorPayload | null),
      response.status
    );
  }

  return data as T;
}
/**
 * Public entry point: performs the request and, on a 401, transparently
 * renews the access token once and replays it.
 *
 * The user should never be logged out for an expired 1-hour access token —
 * that's precisely what the refresh token exists to prevent. Only a refresh
 * that is definitively rejected ends the session (handled by
 * `onSessionInvalidated` in sessionRefresh.ts).
 */
export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  try {
    return await performApiRequest<T>(path, options);
  } catch (error) {
    const status = (error as { status?: unknown })?.status;
    const isUnauthorized = status === 401;

    // Unauthenticated calls (sign-in, refresh itself) must never recurse.
    const isRefreshable = isUnauthorized && options.auth !== false;

    if (!isRefreshable) throw error;

    const { refreshAccessToken } = await import("@/lib/auth/sessionRefresh");
    const outcome = await refreshAccessToken();

    if (!outcome.ok) throw error;

    // Fresh Bearer token is already installed — replay the original request.
    return performApiRequest<T>(path, options);
  }
}
