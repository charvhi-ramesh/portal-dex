import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

// `navigator.onLine` is only a hint: it can report online while requests fail (captive
// portals), so it only picks the wording of the error panel, never whether to show it.
// The server snapshot is `true`, so the first client render matches the prerendered HTML.
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
