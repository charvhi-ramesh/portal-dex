// RED-phase skeleton: exports exist so the tests link and fail on assertions.
import type {
  Character,
  CharacterListParams,
  CharacterPage,
} from "../api/types.ts";
import type { Filters } from "./filters.ts";

export const STEP_TARGET = 20 as const;
export const STEP_MAX_API_PAGES = 4 as const;

export type BrowseStep = {
  items: Character[];
  count: number;
  nextPage: number | undefined;
};

export type FetchPage = (
  params: CharacterListParams,
  page: number,
  signal: AbortSignal,
) => Promise<CharacterPage | null>;

export async function fetchBrowseStep(
  _filters: Filters,
  _startPage: number,
  _fetchPage: FetchPage,
  _signal: AbortSignal,
): Promise<BrowseStep> {
  return { items: [], count: 0, nextPage: undefined };
}

export function flattenSteps(steps: readonly BrowseStep[]): Character[] {
  return steps.flatMap((step) => step.items);
}
