// Count and live-region strings (BRW-07, BRW-08). Pure so `node --test` can run
// them. Copy comes from UI-SPEC "Copywriting Contract". A fixed "en" locale keeps
// 1234 reading "1,234" whatever the browser locale is.

export const EMPTY_HEADING = "No characters in this dimension" as const;

const numberFormat = new Intl.NumberFormat("en");

export function formatCount(n: number): string {
  return numberFormat.format(n);
}

/** Visible count line: "0 characters", "1 character", "1,234 characters". */
export function countText(n: number): string {
  return `${formatCount(n)} ${n === 1 ? "character" : "characters"}`;
}

/** Live-region text once the total is final; zero announces the empty state. */
export function countAnnouncement(n: number): string {
  return n === 0 ? EMPTY_HEADING : countText(n);
}

/**
 * Announcement after "Load more". `added` is the number of cards really added,
 * not a fixed 20, because exact-species filtering changes the yield per step.
 */
export function moreLoadedAnnouncement(added: number): string {
  if (added <= 0) return "";
  return `${formatCount(added)} more ${added === 1 ? "character" : "characters"} loaded`;
}
