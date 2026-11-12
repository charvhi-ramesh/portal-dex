// Favourites store (CARD-06, COL-01, COL-02). React-free so `node --test` can run it.
// Type-only imports use `type` specifiers: Node type stripping does not elide them.
// Storage is injected so tests use fakes and the server never touches `window`.
//
// Contract with Phase 3 Collection: the key and the JSON array-of-IDs format are fixed by
// SPEC 5.5 and COL-01. The only writer is `toggle`; reads, parse failures, storage events
// and unavailable storage never write.
import { displayName } from "../card/card-text.ts";

export const FAVOURITES_KEY = "portal-dex:favourites";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type StorageEventTarget = {
  addEventListener(type: "storage", listener: (event: { key: string | null }) => void): void;
  removeEventListener(type: "storage", listener: (event: { key: string | null }) => void): void;
};

function isValidId(id: unknown): id is number {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

/**
 * Stored JSON to a list of IDs. Anything that is not an array of positive safe integers
 * reads as no favourites (or just the valid entries); duplicates keep their first
 * occurrence. Only array number entries are read, so object keys have no effect (T-02-07).
 */
export function parseFavourites(raw: string | null): number[] {
  if (!raw) return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];
  const seen = new Set<number>();
  const ids: number[] = [];
  for (const entry of value as unknown[]) {
    if (isValidId(entry) && !seen.has(entry)) {
      seen.add(entry);
      ids.push(entry);
    }
  }
  return ids;
}

/** Removes `id` when present, appends it when absent; the same reference for an invalid ID. */
export function toggleFavourite(ids: readonly number[], id: number): readonly number[] {
  if (!isValidId(id)) return ids;
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}

/** Constant accessible name of the star; `aria-pressed` carries the state. */
export function favouriteLabel(name: string): string {
  return `Add ${displayName(name)} to collection`;
}

export type FavouritesStore = {
  subscribe(listener: () => void): () => void;
  getSnapshot(): readonly number[];
  toggle(id: number): void;
};

function sameIds(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function createFavouritesStore(options: {
  getStorage: () => StorageLike | null;
  target: StorageEventTarget | null;
}): FavouritesStore {
  const { getStorage, target } = options;
  const listeners = new Set<() => void>();
  let snapshot: readonly number[] | null = null;
  let memoryOnly = false;

  // Reads storage through the parser. Any failure (no storage, a throwing getter or
  // getItem) switches to memory-only for the session and returns the list held in memory.
  function read(): readonly number[] {
    if (memoryOnly) return snapshot ?? [];
    try {
      const storage = getStorage();
      if (!storage) {
        memoryOnly = true;
        return snapshot ?? [];
      }
      return parseFavourites(storage.getItem(FAVOURITES_KEY));
    } catch {
      memoryOnly = true;
      return snapshot ?? [];
    }
  }

  function publish(next: readonly number[]): void {
    snapshot = Object.freeze([...next]);
    for (const listener of [...listeners]) listener();
  }

  function onStorage(event: { key: string | null }): void {
    if (event.key !== null && event.key !== FAVOURITES_KEY) return;
    // Nothing has read the list yet, so there is nothing to refresh; the first read is fresh.
    if (snapshot === null) return;
    const next = read();
    if (sameIds(next, snapshot)) return;
    publish(next);
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) target?.addEventListener("storage", onStorage);
      return () => {
        if (!listeners.delete(listener)) return;
        if (listeners.size === 0) target?.removeEventListener("storage", onStorage);
      };
    },

    getSnapshot() {
      if (snapshot === null) snapshot = Object.freeze([...read()]);
      return snapshot;
    },

    toggle(id) {
      const current = read();
      const next = toggleFavourite(current, id);
      if (next === current) return;
      if (!memoryOnly) {
        try {
          const storage = getStorage();
          if (!storage) throw new Error("storage unavailable");
          storage.setItem(FAVOURITES_KEY, JSON.stringify(next));
        } catch {
          memoryOnly = true;
        }
      }
      publish(next);
    },
  };
}
