// Exact-species policy (BRW-04). The API's `species=` parameter is a substring
// match, so "Human" also returns "Humanoid". Comparison is exact and
// case-sensitive against canonical chip values only; no user text reaches it
// (T-01-16).

import type { Character } from "../api/types.ts";
import type { Species } from "./filters.ts";

/** Keep only characters whose species equals the chip value; null keeps all. */
export function exactSpecies(
  results: readonly Character[],
  species: Species | null,
): Character[] {
  if (species === null) return [...results];
  return results.filter((character) => character.species === species);
}

/**
 * Total for the count line. Only Human overlaps another chip (Humanoid), so its
 * total is count(species=human) minus count(species=humanoid) under the same
 * other filters (SPEC 5.3). Null means "not known yet": the UI keeps showing
 * "Counting..." and never a guessed number.
 */
export function deriveTotal(input: {
  species: Species | null;
  firstCount: number;
  humanoidCount: number | null;
}): number | null {
  const { species, firstCount, humanoidCount } = input;
  if (firstCount === 0) return 0;
  if (species !== "Human") return firstCount;
  if (humanoidCount === null) return null;
  return Math.max(0, firstCount - humanoidCount);
}
