"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  buildBrowseUrl,
  parseFilters,
  type Filters,
} from "@/lib/browse/filters";

// The single seam for Browse URL state. Reads go through useSearchParams; writes use
// the native History API, which Next integrates with useSearchParams (planning
// decision 3). Switching to router.push/replace later touches only this file.
// Only URLs built by buildBrowseUrl from the current pathname are ever written (T-01-08).
export function useBrowseUrl(): {
  filters: Filters;
  pushFilters(next: Filters): void;
  replaceFilters(next: Filters): void;
} {
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const filters = useMemo(
    () => parseFilters(new URLSearchParams(search)),
    [search],
  );

  const pushFilters = useCallback((next: Filters) => {
    window.history.pushState(
      null,
      "",
      buildBrowseUrl(window.location.pathname, next),
    );
  }, []);

  const replaceFilters = useCallback((next: Filters) => {
    window.history.replaceState(
      null,
      "",
      buildBrowseUrl(window.location.pathname, next),
    );
  }, []);

  return { filters, pushFilters, replaceFilters };
}
