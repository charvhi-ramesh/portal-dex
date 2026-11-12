// RED-phase skeleton: exports exist so the tests link and fail on assertions.
import type { Character } from "../api/types.ts";
import type { Species } from "./filters.ts";

export function exactSpecies(
  results: readonly Character[],
  _species: Species | null,
): Character[] {
  return [...results];
}

export function deriveTotal(input: {
  species: Species | null;
  firstCount: number;
  humanoidCount: number | null;
}): number | null {
  return input.firstCount;
}
