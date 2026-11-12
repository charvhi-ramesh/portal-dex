"use client";

import { useSyncExternalStore } from "react";
import { createFavouritesStore } from "@/lib/favourites/store";
import type { FavouritesStore } from "@/lib/favourites/store";

// One browser-wide store, created on first use. The server snapshot below is always empty,
// so the server render and the hydration render agree (header reads 0); the store first
// reads localStorage after hydration, when useSyncExternalStore switches to the client
// snapshot (COL-01: read after mount).
const EMPTY: readonly number[] = Object.freeze([]);

let store: FavouritesStore | null = null;

function getStore(): FavouritesStore {
  store ??= createFavouritesStore({
    getStorage: () => window.localStorage,
    target: window,
  });
  return store;
}

function subscribe(onChange: () => void): () => void {
  return getStore().subscribe(onChange);
}

function getSnapshot(): readonly number[] {
  return getStore().getSnapshot();
}

function getServerSnapshot(): readonly number[] {
  return EMPTY;
}

/** The favourite character IDs in insertion order; empty until the browser has mounted. */
export function useFavouriteIds(): readonly number[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Whether `id` is a favourite; false on the server and during hydration. */
export function useIsFavourite(id: number): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getStore().getSnapshot().includes(id),
    () => false,
  );
}

/** Toggles `id` and persists the result; the only way favourites change. */
export function toggleFavouriteId(id: number): void {
  getStore().toggle(id);
}
