// One infinite-query page is one "load step" (RESEARCH Pattern 3, assumption A4).
// A step reads API pages sequentially until it holds at least STEP_TARGET exact
// items, the API has no next page, or STEP_MAX_API_PAGES requests were made.
// The cap bounds request bursts far below the Cloudflare 429 threshold
// (Pitfall 4, T-01-15). `fetchPage` is injected so `node --test` can stub it.

import type { Character, CharacterListParams, CharacterPage } from "../api/types.ts";
import { toListParams, type Filters } from "./filters.ts";
import { exactSpecies } from "./species.ts";

export const STEP_TARGET = 20 as const;
export const STEP_MAX_API_PAGES = 4 as const;

/** `count` is meaningful on the first step; later steps repeat the last known value. */
export type BrowseStep = {
  items: Character[];
  count: number;
  nextPage: number | undefined;
};

/** Resolves to null for HTTP 404. */
export type FetchPage = (
  params: CharacterListParams,
  page: number,
  signal: AbortSignal,
) => Promise<CharacterPage | null>;

export async function fetchBrowseStep(
  filters: Filters,
  startPage: number,
  fetchPage: FetchPage,
  signal: AbortSignal,
): Promise<BrowseStep> {
  if (!Number.isSafeInteger(startPage) || startPage < 1) {
    throw new RangeError("startPage must be a positive integer");
  }

  const params = toListParams(filters);
  const items: Character[] = [];
  let page = startPage;
  let count = 0;
  let calls = 0;

  for (;;) {
    // Re-check between sub-requests so a superseded step stops hitting the API.
    if (calls > 0 && signal.aborted) throw signal.reason;

    const res = await fetchPage(params, page, signal);
    calls += 1;

    if (res === null) {
      // DATA-03: a 404 on page 1 is the empty state; later it ends the list.
      if (startPage === 1 && calls === 1) {
        return { items: [], count: 0, nextPage: undefined };
      }
      return { items, count, nextPage: undefined };
    }

    count = res.info.count;
    items.push(...exactSpecies(res.results, filters.species));

    if (res.info.next === null) return { items, count, nextPage: undefined };
    if (items.length >= STEP_TARGET || calls >= STEP_MAX_API_PAGES) {
      return { items, count, nextPage: page + 1 };
    }
    page += 1;
  }
}

/** Concatenate steps, dropping repeated ids (first occurrence wins, order kept). */
export function flattenSteps(steps: readonly BrowseStep[]): Character[] {
  const seen = new Set<number>();
  const out: Character[] = [];
  for (const step of steps) {
    for (const character of step.items) {
      if (seen.has(character.id)) continue;
      seen.add(character.id);
      out.push(character);
    }
  }
  return out;
}
