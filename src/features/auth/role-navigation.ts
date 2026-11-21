import type { ProfileType } from "@/features/auth/types";

export function getProfileHomeRoute(profileType: ProfileType): "/animals" | "/animals/manage" {
  return profileType === "doador_ong" ? "/animals/manage" : "/animals";
}

export function getRoleRedirect(profileType: ProfileType, pathname: string): "/animals" | "/animals/manage" | null {
  if (profileType === "doador_ong") {
    if (pathname === "/animals") return "/animals/manage";
    if (pathname.startsWith("/animals/") && pathname !== "/animals/manage" && pathname !== "/animals/new") {
      return "/animals/manage";
    }
    return null;
  }

  if (pathname === "/animals/manage" || pathname === "/animals/new") return "/animals";
  return null;
}
