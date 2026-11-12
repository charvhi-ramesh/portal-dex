// Route ID validation and page-title helpers for the detail route (DATA-04, DET-05, DET-06).
// React-free so `node --test` can run it; relative .ts imports for the same reason.
import { parseId } from "../api/normalize.ts";
import { displayName } from "../card/card-text.ts";

export const SITE_NAME = "Portal Dex";

/** "{text} · Portal Dex" with a U+00B7 middle dot and single spaces. */
export function pageTitle(text: string): string {
  return `${text} · ${SITE_NAME}`;
}

/** Tab title of a detail page: the full trimmed name, or "Unknown character" when empty. */
export function detailTitle(name: string): string {
  return pageTitle(displayName(name));
}

/**
 * The route segment as a character ID, or null. Only canonical positive safe-integer strings
 * pass, so nothing else reaches the client component or the API (DATA-04).
 */
export function routeCharacterId(raw: string | undefined): number | null {
  return typeof raw === "string" ? parseId(raw) : null;
}

export const NOT_FOUND_HEADING = "Page not found";
export const NOT_FOUND_TITLE = pageTitle(NOT_FOUND_HEADING);
