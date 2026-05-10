let apiAccessToken: string | null = null;

export function setApiAccessToken(token: string | null | undefined): void {
  apiAccessToken = token || null;
}

export function getApiAccessToken(): string | null {
  return apiAccessToken;
}

export function clearApiAccessToken(): void {
  apiAccessToken = null;
}