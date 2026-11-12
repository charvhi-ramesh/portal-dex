// Episode IDs, labels and chips for the detail page's episode strip (DET-03).
// React-free so `node --test` can run it; relative .ts imports for the same reason.
import { extractId } from "../api/normalize.ts";
import type { Episode } from "../api/types.ts";

export type EpisodeChip = { key: string; id: number | null; label: string };

const UNKNOWN_EPISODE = "Unknown episode";

/** Valid episode IDs in URL order, not de-duplicated. */
export function episodeIdsOf(urls: readonly string[]): number[] {
  const ids: number[] = [];
  for (const url of urls) {
    const id = extractId(url);
    if (id !== null) ids.push(id);
  }
  return ids;
}

/** "S01E01 · Pilot" (U+00B7, single spaces); whichever part exists when one is empty. */
export function episodeLabel(e: Pick<Episode, "episode" | "name">): string {
  const code = e.episode.trim();
  const name = e.name.trim();
  if (code && name) return `${code} · ${name}`;
  return code || name || UNKNOWN_EPISODE;
}

/**
 * One chip per URL (so the count always equals the character's episode count), ordered by
 * numeric episode ID ascending with unparsable URLs last. The sort is stable: equal IDs keep
 * URL order. A valid ID missing from the response is still a chip ("Episode 7").
 */
export function episodeChips(
  urls: readonly string[],
  episodes: readonly Episode[],
): EpisodeChip[] {
  const byId = new Map<number, Episode>();
  for (const episode of episodes) byId.set(episode.id, episode);

  const chips = urls.map((url, index): EpisodeChip => {
    const id = extractId(url);
    const match = id === null ? undefined : byId.get(id);
    const label =
      id === null
        ? UNKNOWN_EPISODE
        : match
          ? episodeLabel(match)
          : `Episode ${id}`;
    return { key: `${id ?? "unknown"}-${index}`, id, label };
  });

  // Array.prototype.sort is stable, so ties keep their URL order.
  return chips.sort((a, b) => {
    if (a.id === b.id) return 0;
    if (a.id === null) return 1;
    if (b.id === null) return -1;
    return a.id - b.id;
  });
}
