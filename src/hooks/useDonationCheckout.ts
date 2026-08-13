// ─── src/hooks/useDonationCheckout.ts ────────────────────────────────────────
//
// Drives the Stripe Checkout donation flow end to end:
//   1. Ask the backend to create a donation + Checkout Session.
//   2. Open the hosted checkout page in the system browser sheet.
//   3. Once the donor closes it (paid, cancelled, or just backed out), ask
//      the backend what actually happened — the browser closing tells us
//      nothing on its own, only the session status is authoritative.

import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";

import {
  createDonationCheckout,
  getDonationSession,
} from "@/lib/api/donations.api";

export type DonationOutcome =
  | { status: "success"; amount: number }
  | { status: "pending" }
  | { status: "cancelled" }
  | { status: "error"; message: string };

// A donor can finish paying a beat before the backend's Stripe webhook has
// updated the record. A few short retries absorb that lag instead of
// reporting "pending" for a payment that actually went through.
const SESSION_POLL_ATTEMPTS = 3;
const SESSION_POLL_DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useDonationCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);

  const donate = useCallback(
    async (amount: number): Promise<DonationOutcome> => {
      if (isProcessing) return { status: "cancelled" };

      setIsProcessing(true);

      try {
        const checkout = await createDonationCheckout({
          amount,
          currency: "ngn",
        });

        // Blocks until the donor closes the sheet — this is a native system
        // browser (SFSafariViewController / Custom Tabs), not an embedded
        // WebView component living in the app's view tree.
        await WebBrowser.openBrowserAsync(checkout.checkoutUrl);

        let session = await getDonationSession(checkout.sessionId);

        for (
          let attempt = 0;
          attempt < SESSION_POLL_ATTEMPTS && session.status === "pending";
          attempt++
        ) {
          await delay(SESSION_POLL_DELAY_MS);
          session = await getDonationSession(checkout.sessionId);
        }

        if (session.paid) {
          return { status: "success", amount: session.amount };
        }

        if (session.status === "pending") {
          // Still not confirmed after retrying — most likely the donor
          // closed the sheet without finishing. Not an error, just unpaid.
          return { status: "pending" };
        }

        return { status: "cancelled" };
      } catch (error) {
        return {
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing]
  );

  return { donate, isProcessing };
}
