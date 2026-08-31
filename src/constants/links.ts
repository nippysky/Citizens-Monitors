// Shareable link builders.
// WhatsApp, SMS and most chat apps only linkify https:// URLs — a custom
// scheme like citizenmonitors://... renders as dead text. So everything we
// share externally must be an https link on the real website.
// Verified against the live site (Next.js at www.citizenmonitors.com):
// News/insights articles → /insights/<slug>
// Press coverage → /press/<slug>
// These links open the app directly once the website hosts the two
// well-known files:
// /.well-known/assetlinks.json → Android App Links
// /.well-known/apple-app-site-association → iOS Universal Links
// Until then they open the website article page — still a good experience.

export const WEB_BASE_URL = "https://www.citizenmonitors.com";

export function buildNewsShareUrl(slugOrId: string): string {
  return `${WEB_BASE_URL}/insights/${encodeURIComponent(slugOrId)}`;
}

export function buildPressCoverageShareUrl(slugOrId: string): string {
  return `${WEB_BASE_URL}/press/${encodeURIComponent(slugOrId)}`;
}
