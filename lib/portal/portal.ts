// Portal helpers and state machine. React-free so `node --test` can run it.
// Type-only imports use `type` specifiers: Node type stripping does not elide them.

import { parseId } from "../api/normalize.ts";
import type { Character } from "../api/types.ts";

export const SPIN_MS = 1200;
export const COUNT_STORAGE_KEY = "portal-dex:character-count";

export type PortalSource = "portal" | "again" | "retry";

export type PortalState = {
  phase: "idle" | "spinning" | "revealed" | "error";
  token: number;
  source: PortalSource | null;
  character: Character | null;
  previousId: number | null;
};

export type PortalEvent =
  | { type: "start"; token: number; source: PortalSource }
  | { type: "success"; token: number; character: Character }
  | { type: "failure"; token: number }
  | { type: "cancel"; token: number };

export const INITIAL_PORTAL_STATE: PortalState = {
  phase: "idle",
  token: 0,
  source: null,
  character: null,
  previousId: null,
};

const isPositiveSafeInteger = (n: number): boolean => Number.isSafeInteger(n) && n > 0;

/**
 * A random character ID in [1, count], never `previousId` when there is a choice.
 * Returns null unless `count` is a positive safe integer (no character to draw).
 * With a valid previous ID the draw is uniform over the other count - 1 IDs, so
 * there is no retry loop; with count 1 the only ID is returned even if it repeats.
 */
export function pickRandomId(
  count: number,
  previousId: number | null,
  random: () => number = Math.random,
): number | null {
  if (!isPositiveSafeInteger(count)) return null;
  if (count === 1) return 1;

  const previous =
    previousId !== null && Number.isInteger(previousId) && previousId >= 1 && previousId <= count
      ? previousId
      : null;

  if (previous === null) {
    return Math.min(count, Math.max(1, 1 + Math.floor(random() * count)));
  }

  const k = Math.min(count - 1, Math.max(1, 1 + Math.floor(random() * (count - 1))));
  return k >= previous ? k + 1 : k;
}

/** Live-region text for a reveal; uses the full trimmed API name. */
export function revealAnnouncement(name: string): string {
  const trimmed = name.trim();
  return `Portal opened: ${trimmed === "" ? "Unknown character" : trimmed}`;
}

/** A stored count is accepted only as a canonical positive safe integer string. */
export function parseStoredCount(raw: string | null): number | null {
  return raw === null ? null : parseId(raw);
}

/** The count remembered from an earlier visit; null without a browser or when storage throws. */
export function readLastKnownCount(): number | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredCount(window.localStorage.getItem(COUNT_STORAGE_KEY));
  } catch {
    return null;
  }
}

/** Remembers a positive count for the next visit; a hint only, so failures are swallowed. */
export function rememberCount(count: number): void {
  if (typeof window === "undefined" || !isPositiveSafeInteger(count)) return;
  try {
    window.localStorage.setItem(COUNT_STORAGE_KEY, String(count));
  } catch {
    // Private mode or quota: dropping the hint is harmless.
  }
}

/**
 * Portal state machine. Every event carries the spin token it belongs to; events
 * from a superseded spin, or arriving when no spin is running, return the same state.
 */
export function portalReducer(state: PortalState, event: PortalEvent): PortalState {
  switch (event.type) {
    case "start":
      if (state.phase === "spinning") return state;
      return {
        phase: "spinning",
        token: event.token,
        source: event.source,
        character: null,
        previousId: state.previousId,
      };
    case "success":
      if (state.phase !== "spinning" || event.token !== state.token) return state;
      return {
        ...state,
        phase: "revealed",
        character: event.character,
        previousId: event.character.id,
      };
    case "failure":
      if (state.phase !== "spinning" || event.token !== state.token) return state;
      return { ...state, phase: "error", character: null };
    case "cancel":
      if (state.phase !== "spinning" || event.token !== state.token) return state;
      return { ...state, phase: "idle", character: null };
  }
}
