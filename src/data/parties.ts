// ─── src/data/parties.ts ──────────────────────────────────────────────────────
// Single source of truth for Nigerian political parties used by the election
// report submission flow. To switch to production data:
//   → replace PARTY_CATALOG below with the live INEC-registered list
//   → keep the shape ({ code, fullName }) and helpers intact
// ─────────────────────────────────────────────────────────────────────────────

export type PartyInfo = {
  code: string; // e.g. "APC" — canonical short identifier used in the draft
  fullName: string; // e.g. "All Progressives Congress" — user-facing label
};

/**
 * Parties that are ALWAYS visible in the vote entry table, in this order.
 * They cannot be removed by the user.
 */
export const POPULAR_PARTY_CODES = ["APC", "PDP", "LP", "NNPP"] as const;
export type PopularPartyCode = (typeof POPULAR_PARTY_CODES)[number];

/**
 * Full catalog. Popular 4 come first, the rest are alphabetized for
 * predictable ordering in the picker.
 */
export const PARTY_CATALOG: PartyInfo[] = [
  { code: "APC", fullName: "All Progressives Congress" },
  { code: "PDP", fullName: "Peoples Democratic Party" },
  { code: "LP", fullName: "Labour Party" },
  { code: "NNPP", fullName: "New Nigeria Peoples Party" },
  { code: "AA", fullName: "Action Alliance" },
  { code: "AAC", fullName: "African Action Congress" },
  { code: "ADC", fullName: "African Democratic Congress" },
  { code: "ADP", fullName: "Action Democratic Party" },
  { code: "APGA", fullName: "All Progressives Grand Alliance" },
  { code: "APM", fullName: "Allied Peoples Movement" },
  { code: "BP", fullName: "Boot Party" },
  { code: "NRM", fullName: "National Rescue Movement" },
  { code: "PRP", fullName: "Peoples Redemption Party" },
  { code: "SDP", fullName: "Social Democratic Party" },
  { code: "YPP", fullName: "Young Progressives Party" },
  { code: "ZLP", fullName: "Zenith Labour Party" },
];

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

export function getPartyInfo(code: string): PartyInfo | undefined {
  if (!code) return undefined;
  const normalized = code.trim().toUpperCase();
  return PARTY_CATALOG.find((p) => p.code.toUpperCase() === normalized);
}

export function isPopularParty(code: string): boolean {
  if (!code) return false;
  const normalized = code.trim().toUpperCase();
  return (POPULAR_PARTY_CODES as readonly string[]).includes(normalized);
}

/**
 * Detects the legacy "Other Parties" catch-all row that may exist in drafts
 * built by older versions of buildInitialResultDraft. We hide these from the
 * new UI and strip them on hydrate so the picker is the single add path.
 */
export function isGenericOthersEntry(code: string): boolean {
  if (!code) return false;
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  return (
    normalized === "OTHERS" ||
    normalized === "OTHERPARTIES" ||
    normalized === "OTHER"
  );
}

/* ─── Picker label formatting ─────────────────────────────────────────────── */

// The SelectPickerSheet renders each option as a single string — so we pack
// both code and full name into the label, and parse the code back out on
// selection. An em-dash is used because it won't collide with party names.
const LABEL_SEPARATOR = " — ";

export function formatPartyPickerLabel(party: PartyInfo): string {
  return `${party.code}${LABEL_SEPARATOR}${party.fullName}`;
}

export function parsePartyPickerLabel(label: string): string | null {
  const idx = label.indexOf(LABEL_SEPARATOR);
  if (idx <= 0) return null;
  return label.slice(0, idx).trim();
}