// ID parsing and response normalisation. React-free so `node --test` can run it.

/** Accepts only canonical positive integer strings ("1", "826"); never "0", "007", "1.5", " 1". */
export function parseId(raw: string): number | null {
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isSafeInteger(n) ? n : null;
}

/** Reads the id from the last non-empty path segment of a resource URL. Empty URLs give null. */
export function extractId(url: string): number | null {
  const last = url.split("/").filter(Boolean).pop() ?? "";
  return parseId(last);
}

/** Positive safe integers only, deduped and sorted ascending, so multi-ID paths are deterministic. */
export function toIdList(ids: readonly number[]): number[] {
  const valid = ids.filter((n) => Number.isSafeInteger(n) && n > 0);
  return [...new Set(valid)].sort((a, b) => a - b);
}

/** The API returns an object for one ID and an array for several; normalise to an array. */
export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}
