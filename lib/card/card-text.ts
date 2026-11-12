// Card text helpers (CARD-02, CARD-03, CARD-07). Pure and React-free so `node --test` can
// run them. API strings are returned as plain strings, never as markup.
import type { Character } from "../api/types.ts";

export type BackFact = { label: string; value: string };

export function displayName(name: string): string {
  return name;
}

export function cardLabel(c: Pick<Character, "name" | "status" | "species">): string {
  return c.name;
}

export function episodeCountText(count: number): string {
  return String(count);
}

export function backFacts(
  c: Pick<Character, "species" | "type" | "gender" | "origin" | "location" | "episode">,
): BackFact[] {
  void c;
  return [];
}
