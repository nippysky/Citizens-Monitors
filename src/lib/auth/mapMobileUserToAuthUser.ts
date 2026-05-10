import { MobileUser } from "@/lib/api/auth.api";
import { AuthRole, AuthUser } from "@/types/auth";

type ProfileImageLike = {
  url?: unknown;
};

function getProfileImageUrl(profileImage: unknown): string | undefined {
  if (
    profileImage &&
    typeof profileImage === "object" &&
    "url" in profileImage
  ) {
    const image = profileImage as ProfileImageLike;

    if (typeof image.url === "string") {
      return image.url;
    }
  }

  return undefined;
}

function isAuthRole(role: unknown): role is AuthRole {
  return (
    role === "observer" || role === "volunteer" || role === "public-viewer"
  );
}

export function mapMobileUserToAuthUser(
  user: MobileUser | undefined,
  fallbackEmail: string
): AuthUser {
  const email = user?.email ?? fallbackEmail.trim().toLowerCase();

  return {
    id: user?._id ?? email,
    email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    role: isAuthRole(user?.role) ? user.role : undefined,
    profileImageUrl: getProfileImageUrl(user?.profileImage),
    pendingObserverVerification:
      typeof user?.pendingObserverVerification === "boolean"
        ? user.pendingObserverVerification
        : undefined,
  };
}