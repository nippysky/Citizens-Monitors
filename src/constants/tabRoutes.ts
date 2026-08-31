// expo-router's usePathname() returns pathnames WITHOUT group segments —
// e.g. "/home", never "/(app)/(tabs)/home" — so any check like
// pathname.includes("/(tabs)/") silently never matches. Always use this
// helper to know whether the user is on a bottom-tab screen.

export const TAB_PATHNAMES = new Set([
  "/home",
  "/elections",
  "/collation",
  "/pulse",
  "/me",
]);

export function isTabPathname(pathname: string): boolean {
  return TAB_PATHNAMES.has(pathname);
}
