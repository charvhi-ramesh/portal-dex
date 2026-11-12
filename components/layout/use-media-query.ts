import { useSyncExternalStore } from "react";

// matchMedia subscription without setState in effects (RESEARCH Pitfall 1).
// The server snapshot is `serverValue`; the client corrects it right after hydration.
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
