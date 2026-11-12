import { getJson } from "./client.ts";
import { toArray, toIdList } from "./normalize.ts";
import type { Episode, LocationResource } from "./types.ts";

/** One request for many episodes. Missing IDs are omitted; 404 gives []. */
export async function fetchEpisodesByIds(
  ids: readonly number[],
  signal?: AbortSignal,
): Promise<Episode[]> {
  const list = toIdList(ids);
  if (list.length === 0) return [];
  const result = await getJson<Episode | Episode[]>(
    `/episode/${list.join(",")}`,
    signal,
  );
  return toArray(result);
}

export async function fetchLocation(
  id: number,
  signal?: AbortSignal,
): Promise<LocationResource | null> {
  if (!Number.isSafeInteger(id) || id < 1) return null;
  return getJson<LocationResource>(`/location/${id}`, signal);
}

/** One request for many locations. Missing IDs are omitted; 404 gives []. */
export async function fetchLocationsByIds(
  ids: readonly number[],
  signal?: AbortSignal,
): Promise<LocationResource[]> {
  const list = toIdList(ids);
  if (list.length === 0) return [];
  const result = await getJson<LocationResource | LocationResource[]>(
    `/location/${list.join(",")}`,
    signal,
  );
  return toArray(result);
}
