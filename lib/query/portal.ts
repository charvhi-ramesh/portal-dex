// Portal query options factories.
// Type-only imports use `type` specifiers: Node type stripping does not elide them.

import { queryOptions } from "@tanstack/react-query";
import { fetchCharacter, fetchCharacterPage } from "../api/characters.ts";
import { rememberCount } from "../portal/portal.ts";

/** The unfiltered member of the ["characters", "count", ...] namespace humanoidCountOptions uses. */
export const TOTAL_COUNT_KEY = ["characters", "count", ""] as const;

/**
 * Total number of characters (info.count of page 1); a 404 means nothing is there, so 0.
 * A positive count is remembered in localStorage as the portal's last-known count.
 */
export function totalCountOptions() {
  return queryOptions({
    queryKey: TOTAL_COUNT_KEY,
    queryFn: async ({ signal }): Promise<number> => {
      const page = await fetchCharacterPage({}, 1, signal);
      const count = page?.info.count ?? 0;
      if (count > 0) rememberCount(count);
      return count;
    },
  });
}

/** One character by ID; null for HTTP 404. Phase 3's detail page can reuse this key. */
export function characterOptions(id: number) {
  return queryOptions({
    queryKey: ["characters", "detail", id] as const,
    queryFn: ({ signal }) => fetchCharacter(id, signal),
  });
}
