// Browse query options factories.
// Use the non-Suspense hook family with these: Suspense hooks cannot cancel.
// Type-only imports use `type` specifiers: Node type stripping does not elide them.

import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { fetchCharacterPage } from "../api/characters.ts";
import { fetchBrowseStep, type BrowseStep } from "../browse/steps.ts";
import { filtersKey, toListParams, type Filters } from "../browse/filters.ts";

/**
 * One infinite-query page is one load step (see lib/browse/steps.ts): it reads API
 * pages until it holds enough exact-species matches. `pageParam` is the API page
 * number the step starts at.
 */
export function browseOptions(filters: Filters) {
  return infiniteQueryOptions({
    queryKey: ["characters", "browse", filtersKey(filters)] as const,
    // The query's AbortSignal reaches every API sub-request of the step, so a
    // superseded search is cancelled and cannot overwrite newer results (DATA-05).
    queryFn: ({ pageParam, signal }): Promise<BrowseStep> =>
      fetchBrowseStep(filters, pageParam, fetchCharacterPage, signal),
    initialPageParam: 1,
    getNextPageParam: (lastStep: BrowseStep) => lastStep.nextPage,
  });
}

/**
 * Count-only request behind the exact-Human total (BRW-04, D-08): the API's
 * `species=Human` also matches Humanoid, so the Humanoid count under the same other
 * filters is subtracted. Page 1 only; a 404 means nothing matches, so 0.
 */
export function humanoidCountOptions(filters: Filters) {
  const humanoid: Filters = { ...filters, species: "Humanoid" };
  return queryOptions({
    queryKey: ["characters", "count", filtersKey(humanoid)] as const,
    queryFn: async ({ signal }): Promise<number> => {
      const page = await fetchCharacterPage(toListParams(humanoid), 1, signal);
      return page?.info.count ?? 0;
    },
  });
}
