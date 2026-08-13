// ─── src/constants/donations.ts ──────────────────────────────────────────────

/** Preset donation amounts in NGN (major units, e.g. 1000 = ₦1,000). */
export const DONATION_PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000] as const;

/** Smallest and largest amounts a donor can enter via the custom field. */
export const DONATION_MIN_AMOUNT = 100;
export const DONATION_MAX_AMOUNT = 5_000_000;
