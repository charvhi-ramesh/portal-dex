// Favourites store (CARD-06, COL-01, COL-02). React-free so `node --test` can run it.
// Stub: signatures only (TDD RED).

export const FAVOURITES_KEY = "portal-dex:favourites";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type StorageEventTarget = {
  addEventListener(type: "storage", listener: (event: { key: string | null }) => void): void;
  removeEventListener(type: "storage", listener: (event: { key: string | null }) => void): void;
};

export function parseFavourites(_raw: string | null): number[] {
  return [-1];
}

export function toggleFavourite(ids: readonly number[], _id: number): readonly number[] {
  return ids;
}

export function favouriteLabel(_name: string): string {
  return "";
}

export type FavouritesStore = {
  subscribe(listener: () => void): () => void;
  getSnapshot(): readonly number[];
  toggle(id: number): void;
};

export function createFavouritesStore(_options: {
  getStorage: () => StorageLike | null;
  target: StorageEventTarget | null;
}): FavouritesStore {
  return {
    subscribe: () => () => {},
    getSnapshot: () => [],
    toggle: () => {},
  };
}
