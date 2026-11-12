// Browse infinite-query options factory.
// Use the non-Suspense hook family with these: Suspense hooks cannot cancel.

import { infiniteQueryOptions } from "@tanstack/react-query";
import { fetchCharacterPage } from "../api/characters.ts";
import type { CharacterListParams } from "../api/types.ts";

export function browseOptions(params: CharacterListParams) {
  return infiniteQueryOptions({
    queryKey: ["characters", "browse", params] as const,
    // The query's AbortSignal cancels superseded requests (DATA-05).
    queryFn: ({ pageParam, signal }) =>
      fetchCharacterPage(params, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage?.info.next ? lastPageParam + 1 : undefined,
  });
}
