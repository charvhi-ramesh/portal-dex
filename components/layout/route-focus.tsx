"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const MAX_RETRIES = 5;

// Hidden (Activity) routes stay in the DOM, so only a rendered h1 counts (RESEARCH Pitfall 12).
function findVisibleH1(): HTMLElement | null {
  const headings = document.querySelectorAll<HTMLElement>("#main-content h1");
  for (const heading of headings) {
    if (heading.getClientRects().length > 0) return heading;
  }
  return null;
}

// FND-06: after a client-side navigation, move focus to the new page's h1. Keyed on the
// pathname only, so typing and chip changes on a page never steal focus (RESEARCH anti-patterns).
export function RouteFocus(): null {
  const pathname = usePathname();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false; // never move focus on the initial page load
      return;
    }

    let frame = 0;
    let attempts = 0;

    const attempt = () => {
      const heading = findVisibleH1();
      heading?.focus({ preventScroll: true });
      if (heading && document.activeElement === heading) return;
      if (attempts >= MAX_RETRIES) return;
      attempts += 1;
      frame = requestAnimationFrame(attempt);
    };

    attempt();
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
