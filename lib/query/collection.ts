// Collection query options (COL-04): one multi-ID request keyed by the sorted ID list.
// Type-only imports use `type` specifiers: Node type stripping does not elide them.

import { queryOptions } from "@tanstack/react-query";
import { fetchCharactersByIds } from "../api/characters.ts";
import type { Character } from "../api/types.ts";

// RED stub: the key ignores the IDs.
export function collectionOptions(ids: readonly number[]) {
  return queryOptions({
    queryKey: ["characters", "collection", ""] as const,
    queryFn: ({ signal }): Promise<Character[]> =>
      fetchCharactersByIds(ids, signal),
  });
}
