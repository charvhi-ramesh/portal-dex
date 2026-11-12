// RED-phase stub: signatures only, no behaviour yet.
import type { Character, CharacterListParams, CharacterPage } from "./types.ts";

export async function fetchCharacterPage(
  _params: CharacterListParams,
  _page: number,
  _signal?: AbortSignal,
): Promise<CharacterPage | null> {
  return null;
}
export async function fetchCharacter(
  _id: number,
  _signal?: AbortSignal,
): Promise<Character | null> {
  return null;
}
export async function fetchCharactersByIds(
  _ids: readonly number[],
  _signal?: AbortSignal,
): Promise<Character[]> {
  return [];
}
