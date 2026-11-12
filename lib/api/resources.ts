// RED-phase stub: signatures only, no behaviour yet.
import type { Episode, LocationResource } from "./types.ts";

export async function fetchEpisodesByIds(
  _ids: readonly number[],
  _signal?: AbortSignal,
): Promise<Episode[]> {
  return [];
}
export async function fetchLocation(
  _id: number,
  _signal?: AbortSignal,
): Promise<LocationResource | null> {
  return null;
}
export async function fetchLocationsByIds(
  _ids: readonly number[],
  _signal?: AbortSignal,
): Promise<LocationResource[]> {
  return [];
}
