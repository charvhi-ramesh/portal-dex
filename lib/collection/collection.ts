// Collection helpers (COL-04, COL-05). Pure and React-free so `node --test` can run them.
import type { Character } from "../api/types.ts";

// RED stubs: signatures only, wrong values on purpose.
export function orderByFavourites(
  _ids: readonly number[],
  characters: readonly Character[],
): Character[] {
  return [...characters];
}

export function nextFocusIndex(
  _removedIndex: number,
  _remainingCount: number,
): number | null {
  return 0;
}

export function removalAnnouncement(_names: readonly string[]): string {
  return "";
}
