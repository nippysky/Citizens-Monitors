// Donations, backed by Stripe Checkout (a hosted payment page) — confirmed
// and implemented by the backend team:
// POST /donations/checkout → creates a donation + Stripe Checkout
// Session, returns a hosted page URL.
// GET /donations/session/:sessionId → the source of truth for whether that
// session was actually paid.
// The app never touches a Stripe key of any kind. It asks the backend for a
// checkout link, opens it in the system browser (Safari View Controller on
// iOS, Chrome Custom Tabs on Android — not an embedded WebView), and once
// that closes, asks the backend whether the donor actually paid.

import { apiRequest } from "@/lib/api/http";

export type CreateDonationCheckoutPayload = {
  /** Donation amount in the major currency unit, e.g. 2500 = ₦2,500. */
  amount: number;
  /** ISO 4217 currency code, lowercase. */
  currency?: string;
};

export type CreateDonationCheckoutResponse = {
  donationId: string;
  /** Stripe-hosted checkout page — open in the system browser, not a WebView. */
  checkoutUrl: string;
  sessionId: string;
};

export async function createDonationCheckout(
  payload: CreateDonationCheckoutPayload
): Promise<CreateDonationCheckoutResponse> {
  return apiRequest<CreateDonationCheckoutResponse>("/donations/checkout", {
    method: "POST",
    body: payload,
  });
}

export type DonationSessionStatus = {
  donationId: string;
  sessionId: string;
  /** Stripe Checkout Session status, e.g. "pending" | "complete" | "expired". */
  status: string;
  /** Stripe payment_status, e.g. "unpaid" | "paid" | "no_payment_required". */
  paymentStatus: string;
  /** Authoritative "did this actually get paid" flag — trust this over status strings. */
  paid: boolean;
  amount: number;
  currency: string;
  source: string;
};

export async function getDonationSession(
  sessionId: string
): Promise<DonationSessionStatus> {
  return apiRequest<DonationSessionStatus>(
    `/donations/session/${encodeURIComponent(sessionId)}`,
    { method: "GET" }
  );
}
