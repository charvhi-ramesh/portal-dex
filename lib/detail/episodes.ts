// Episode IDs, labels and chips for the detail page's episode strip (DET-03).
// React-free so `node --test` can run it; relative .ts imports for the same reason.
import type { Episode } from "../api/types.ts";

export type EpisodeChip = { key: string; id: number | null; label: string };

export function episodeIdsOf(urls: readonly string[]): number[] {
  void urls;
  return [];
}

export function episodeLabel(e: Pick<Episode, "episode" | "name">): string {
  void e;
  return "";
}

export function episodeChips(
  urls: readonly string[],
  episodes: readonly Episode[],
): EpisodeChip[] {
  void urls;
  void episodes;
  return [];
}
