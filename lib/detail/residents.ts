// Resident selection and headings for the "Also found at" row (DET-04).
// React-free so `node --test` can run it; relative .ts imports for the same reason.
import { extractId } from "../api/normalize.ts";

export const RESIDENT_LIMIT = 12;

/** The location ID of a resource ref, or null for an empty or unparsable URL (SPEC A6). */
export function locationIdOf(ref: { url: string }): number | null {
  return extractId(ref.url);
}

/**
 * The first `limit` resident IDs in the location's order, without the current character, without
 * duplicates and without URLs that carry no canonical ID. Only these IDs ever build a request
 * path; the URLs themselves are never requested (T-03-08).
 */
export function pickResidentIds(
  residentUrls: readonly string[],
  currentId: number,
  limit: number = RESIDENT_LIMIT,
): number[] {
  const picked: number[] = [];
  if (limit <= 0) return picked;
  const seen = new Set<number>();
  for (const url of residentUrls) {
    const id = extractId(url);
    if (id === null || id === currentId || seen.has(id)) continue;
    seen.add(id);
    picked.push(id);
    if (picked.length >= limit) break;
  }
  return picked;
}

export function alsoFoundHeading(locationName: string): string {
  return `Also found at ${locationName.trim() || "this location"}`;
}
