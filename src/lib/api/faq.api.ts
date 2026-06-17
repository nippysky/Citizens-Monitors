import { apiRequest } from "@/lib/api/http";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqCategory = {
  category: string;
  title: string;
  items: FaqItem[];
};

/**
 * Shape returned by GET /faq
 * Contains all categories (e.g. "general", "observer") under `categories`.
 */
export type FaqResponse = {
  title: string;
  subtitle: string;
  categories: FaqCategory[];
};

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * GET /faq
 * Returns all FAQ categories. The `categories` array contains both general
 * and observer items. Use `category === "general"` to filter for the
 * General FAQ tab.
 */
export async function getGeneralFaq(): Promise<FaqResponse> {
  return apiRequest<FaqResponse>("/faq", {
    method: "GET",
    auth: false,
  });
}

/**
 * GET /faq/observer
 * Returns a SINGLE FaqCategory object (NOT a FaqResponse).
 * Shape: { category: "observer", title: "...", items: [...] }
 */
export async function getObserverFaq(): Promise<FaqCategory> {
  return apiRequest<FaqCategory>("/faq/observer", {
    method: "GET",
    auth: true,
  });
}
