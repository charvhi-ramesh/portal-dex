// Pure guard mirroring next.config.ts images.remotePatterns, so next/image is never handed a URL
// the optimizer would reject (an unconfigured host makes next/image throw). T-01-13.
export const AVATAR_ORIGIN = "https://rickandmortyapi.com";
export const AVATAR_PATH_PREFIX = "/api/character/avatar/";

export function isAvatarUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "rickandmortyapi.com" &&
      parsed.port === "" &&
      parsed.pathname.startsWith(AVATAR_PATH_PREFIX) &&
      parsed.search === "" &&
      parsed.hash === ""
    );
  } catch {
    return false;
  }
}
