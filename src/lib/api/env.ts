function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export const ApiEnv = {
  baseUrl: normalizeBaseUrl(
    requireEnv(
      process.env.EXPO_PUBLIC_API_BASE_URL,
      "EXPO_PUBLIC_API_BASE_URL"
    )
  ),
  inhouseAccessToken: requireEnv(
    process.env.INHOUSE_ACCESS_TOKEN,
    "INHOUSE_ACCESS_TOKEN"
  ),
} as const;