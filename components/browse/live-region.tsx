"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

// One polite, atomic live region for the settled result count (BRW-07, D-08).
// Text is written straight to the element through a ref, never through React state
// (RESEARCH Pitfall 1): state would re-render Browse on every announcement and a
// re-mounted region is not reliably announced.

/** Rapid filter changes announce once, for the final state (UI-SPEC). */
export const ANNOUNCE_SETTLE_MS = 500;
/** Gap between clearing and rewriting, so an identical string is announced again. */
export const ANNOUNCE_REWRITE_MS = 100;

type Timer = ReturnType<typeof setTimeout>;

export function useAnnouncer(): {
  regionRef: RefObject<HTMLDivElement | null>;
  announce(text: string): void;
} {
  const regionRef = useRef<HTMLDivElement | null>(null);
  const settleTimer = useRef<Timer | undefined>(undefined);
  const rewriteTimer = useRef<Timer | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(settleTimer.current);
      clearTimeout(rewriteTimer.current);
    },
    [],
  );

  // Stable identity, so callers can list it as an effect dependency.
  const announce = useCallback((text: string) => {
    if (text === "") return;
    // A newer announcement supersedes both a waiting one and a half-written one.
    clearTimeout(settleTimer.current);
    clearTimeout(rewriteTimer.current);
    settleTimer.current = setTimeout(() => {
      const region = regionRef.current;
      if (region === null) return;
      region.textContent = "";
      rewriteTimer.current = setTimeout(() => {
        const current = regionRef.current;
        if (current !== null) current.textContent = text;
      }, ANNOUNCE_REWRITE_MS);
    }, ANNOUNCE_SETTLE_MS);
  }, []);

  return { regionRef, announce };
}

export function LiveRegion({
  regionRef,
}: {
  regionRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={regionRef}
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
