// Collection query options (COL-04): one multi-ID request keyed by the sorted ID list.
// Type-only imports use `type` specifiers: Node type stripping does not elide them.

import { queryOptions } from "@tanstack/react-query";
import { fetchCharactersByIds } from "../api/characters.ts";
import { toIdList } from "../api/normalize.ts";
import type { Character } from "../api/types.ts";

/**
 * The key is the sorted, deduped ID list, so re-ordering favourites never refetches and
 * a response for an older list can never fill the current list's key (concurrency).
 * IDs reach the request path only through toIdList inside fetchCharactersByIds (T-03-05).
 */
export function collectionOptions(ids: readonly number[]) {
  return queryOptions({
    queryKey: ["characters", "collection", toIdList(ids).join(",")] as const,
    queryFn: ({ signal }): Promise<Character[]> =>
      fetchCharactersByIds(ids, signal),
  });
}
