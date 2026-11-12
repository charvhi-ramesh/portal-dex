// Detail page query options and cache seeding (DET-02, DET-03, DET-04).
// Type-only imports use `type` specifiers: Node type stripping does not elide them.

import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { fetchCharactersByIds } from "../api/characters.ts";
import { toIdList } from "../api/normalize.ts";
import { fetchEpisodesByIds, fetchLocation } from "../api/resources.ts";
import type { Character } from "../api/types.ts";
import { characterOptions } from "./portal.ts";

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

/** One location by ID; null for HTTP 404. */
export function locationOptions(id: number) {
  return queryOptions({
    queryKey: ["locations", "detail", id] as const,
    queryFn: ({ signal }) => fetchLocation(id, signal),
  });
}

/** Residents of a location in one multi-ID request, keyed by the sorted ID list. */
export function residentsOptions(ids: readonly number[]) {
  return queryOptions({
    queryKey: ["characters", "residents", toIdList(ids).join(",")] as const,
    queryFn: ({ signal }) => fetchCharactersByIds(ids, signal),
  });
}

/**
 * Puts a character the page already shows into the detail query so the destination renders in
 * the same commit as the navigation (needed for the view-transition morph). Existing data,
 * including a cached null, is never replaced and its staleTime clock never restarts: this only
 * writes when the key is absent.
 */
export function seedCharacter(client: QueryClient, character: Character): void {
  const key = characterOptions(character.id).queryKey;
  if (client.getQueryData(key) !== undefined) return;
  client.setQueryData(key, character);
}
