// Collection helpers (COL-04, COL-05). Pure and React-free so `node --test` can run them.
import type { Character } from "../api/types.ts";
import { displayName } from "../card/card-text.ts";

/**
 * The returned characters in the order the user favourited them. IDs the API did not
 * return are skipped, a repeated ID is emitted once, and characters that are not in
 * `ids` are dropped.
 */
export function orderByFavourites(
  ids: readonly number[],
  characters: readonly Character[],
): Character[] {
  const byId = new Map<number, Character>();
  for (const character of characters) {
    if (!byId.has(character.id)) byId.set(character.id, character);
  }
  const emitted = new Set<number>();
  const ordered: Character[] = [];
  for (const id of ids) {
    const character = byId.get(id);
    if (character === undefined || emitted.has(id)) continue;
    emitted.add(id);
    ordered.push(character);
  }
  return ordered;
}

/**
 * Index (in the list after the removal) of the card that should take focus: the one that
 * took the removed card's place, or the new last card when the removed one was last.
 * null means no card remains, so focus goes to the page heading.
 */
export function nextFocusIndex(
  removedIndex: number,
  remainingCount: number,
): number | null {
  if (remainingCount <= 0) return null;
  return Math.min(Math.max(removedIndex, 0), remainingCount - 1);
}

/** Polite live-region text for one or more removals made in quick succession. */
export function removalAnnouncement(names: readonly string[]): string {
  const shown = names.map(displayName);
  if (shown.length === 0) return "";
  if (shown.length === 1) return `${shown[0]} removed from collection`;
  const last = shown[shown.length - 1];
  const rest = shown.slice(0, -1).join(", ");
  return `${rest} and ${last} removed from collection`;
}
