// Card text helpers (CARD-02, CARD-03, CARD-07). Pure and React-free so `node --test` can
// run them. API strings are returned as plain strings, never as markup, and origin and
// location are never turned into URLs (SPEC A6).
import type { Character } from "../api/types.ts";
import { formatCount } from "../browse/announce.ts";
import { labelFor } from "../browse/filters.ts";

export type BackFact = { label: string; value: string };

const UNKNOWN_CHARACTER = "Unknown character";
const UNKNOWN_SPECIES = "Unknown species";
const UNKNOWN = "Unknown";

/** The full trimmed API name, or "Unknown character" when it is empty. */
export function displayName(name: string): string {
  return name.trim() || UNKNOWN_CHARACTER;
}

/** Accessible name of the flip button: name, status, species, then the fixed hint. */
export function cardLabel(c: Pick<Character, "name" | "status" | "species">): string {
  const species = c.species.trim() || UNKNOWN_SPECIES;
  return `${displayName(c.name)}, ${labelFor(c.status)}, ${species} card, press to flip`;
}

/** "0 episodes", "1 episode", "1,000 episodes": the exact count, never rounded or capped. */
export function episodeCountText(count: number): string {
  return `${formatCount(count)} ${count === 1 ? "episode" : "episodes"}`;
}

function textOrUnknown(value: string): string {
  return labelFor(value.trim()) || UNKNOWN;
}

/** Back-face rows in display order; Type only appears when the trimmed type is non-empty. */
export function backFacts(
  c: Pick<Character, "species" | "type" | "gender" | "origin" | "location" | "episode">,
): BackFact[] {
  const facts: BackFact[] = [{ label: "Species", value: textOrUnknown(c.species) }];
  const type = c.type.trim();
  if (type) facts.push({ label: "Type", value: type });
  facts.push(
    { label: "Gender", value: labelFor(c.gender) },
    { label: "Origin", value: textOrUnknown(c.origin.name) },
    { label: "Last location", value: textOrUnknown(c.location.name) },
    { label: "Appears in", value: episodeCountText(c.episode.length) },
  );
  return facts;
}
