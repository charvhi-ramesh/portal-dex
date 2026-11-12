// Resident selection and headings for the "Also found at" row (DET-04).
// React-free so `node --test` can run it; relative .ts imports for the same reason.

export const RESIDENT_LIMIT = 12;

export function locationIdOf(ref: { url: string }): number | null {
  void ref;
  return 0;
}

export function pickResidentIds(
  residentUrls: readonly string[],
  currentId: number,
  limit: number = RESIDENT_LIMIT,
): number[] {
  void residentUrls;
  void currentId;
  void limit;
  return [0];
}

export function alsoFoundHeading(locationName: string): string {
  void locationName;
  return "";
}
