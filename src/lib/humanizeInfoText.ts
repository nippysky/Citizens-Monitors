// ─── src/lib/humanizeInfoText.ts ─────────────────────────────────────────────

const ISO_DATE_REGEX =
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/g;

export function formatReadableDateTime(value?: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Backend "info"/context fields can contain raw ISO timestamps, e.g.
 * "2026-07-01T23:00:00.000Z - 2026-07-03T23:00:00.000Z".
 * Replaces every ISO timestamp with a human-readable local date and tidies
 * the range separator: "Thu, Jul 2, 2026, 12:00 AM – Sat, Jul 4, 2026, 12:00 AM".
 * Non-date text is left untouched.
 */
export function humanizeInfoText(value: string): string {
  const humanized = value.replace(ISO_DATE_REGEX, (match) => {
    return formatReadableDateTime(match) || match;
  });

  if (humanized === value) {
    // No dates found — leave the original text exactly as-is.
    return value;
  }

  return humanized.replace(/\s+-\s+/g, " – ");
}
