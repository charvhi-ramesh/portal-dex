// Detail page query options and cache seeding (DET-02, DET-03, DET-04).
// Type-only imports use `type` specifiers: Node type stripping does not elide them.

import { queryOptions } from "@tanstack/react-query";
import { toIdList } from "../api/normalize.ts";
import { fetchEpisodesByIds } from "../api/resources.ts";

/**
 * Episodes for a set of IDs in one request. The key is the sorted, deduped ID list, so a
 * response can never fill another character's key. IDs reach the path only through toIdList
 * inside fetchEpisodesByIds (T-03-08).
 */
export function episodesOptions(ids: readonly number[]) {
  return queryOptions({
    queryKey: ["episodes", toIdList(ids).join(",")] as const,
    queryFn: ({ signal }) => fetchEpisodesByIds(ids, signal),
  });
}
