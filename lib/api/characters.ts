import { getJson } from "./client.ts";
import { toArray, toIdList } from "./normalize.ts";
import type { Character, CharacterListParams, CharacterPage } from "./types.ts";

/**
 * One page of the character list. Resolves to null for HTTP 404 (no results on
 * page 1, no more pages later). All user text goes through URLSearchParams with
 * a fixed key order: name, status, gender, species, page.
 */
export async function fetchCharacterPage(
  params: CharacterListParams,
  page: number,
  signal?: AbortSignal,
): Promise<CharacterPage | null> {
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new RangeError("page must be a positive integer");
  }

  const query = new URLSearchParams();
  const name = params.name?.trim();
  if (name) query.set("name", name);
  if (params.status) query.set("status", params.status);
  if (params.gender) query.set("gender", params.gender);
  if (params.species) query.set("species", params.species);
  query.set("page", String(page));

  return getJson<CharacterPage>(`/character?${query}`, signal);
}

export async function fetchCharacter(
  id: number,
  signal?: AbortSignal,
): Promise<Character | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null;
  return getJson<Character>(`/character/${id}`, signal);
}

/** One request for many characters. Missing IDs are omitted; 404 gives []. */
export async function fetchCharactersByIds(
  ids: readonly number[],
  signal?: AbortSignal,
): Promise<Character[]> {
  const list = toIdList(ids);
  if (list.length === 0) return [];
  const result = await getJson<Character | Character[]>(
    `/character/${list.join(",")}`,
    signal,
  );
  return toArray(result);
}
