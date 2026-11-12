// RED-phase skeleton: exports exist so the tests link and fail on assertions.
export const EMPTY_HEADING = "No characters in this dimension" as const;

export function formatCount(n: number): string {
  return String(n);
}

export function countText(n: number): string {
  return String(n);
}

export function countAnnouncement(n: number): string {
  return String(n);
}

export function moreLoadedAnnouncement(added: number): string {
  return String(added);
}
