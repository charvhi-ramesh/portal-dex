// Portal helpers and state machine. React-free so `node --test` can run it.
// Type-only imports use `type` specifiers: Node type stripping does not elide them.

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

// RED stubs: signatures only, behaviour arrives in the GREEN commit.
export function pickRandomId(
  _count: number,
  _previousId: number | null,
  _random: () => number = Math.random,
): number | null {
  return null;
}

export function revealAnnouncement(_name: string): string {
  return "";
}

export function parseStoredCount(_raw: string | null): number | null {
  return null;
}

export function readLastKnownCount(): number | null {
  return -1;
}

export function rememberCount(_count: number): void {}

export function portalReducer(state: PortalState, _event: PortalEvent): PortalState {
  return state;
}
