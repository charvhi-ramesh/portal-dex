import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FAVOURITES_KEY,
  createFavouritesStore,
  favouriteLabel,
  parseFavourites,
  toggleFavourite,
} from "./store.ts";
import type { StorageEventTarget, StorageLike } from "./store.ts";

type FakeStorage = StorageLike & {
  data: Map<string, string>;
  sets: number;
  failGet: boolean;
  failSet: boolean;
};

function fakeStorage(initial?: string): FakeStorage {
  const storage: FakeStorage = {
    data: new Map(),
    sets: 0,
    failGet: false,
    failSet: false,
    getItem(key) {
      if (storage.failGet) throw new Error("getItem failed");
      return storage.data.get(key) ?? null;
    },
    setItem(key, value) {
      if (storage.failSet) throw new Error("QuotaExceededError");
      storage.sets += 1;
      storage.data.set(key, value);
    },
  };
  if (initial !== undefined) storage.data.set(FAVOURITES_KEY, initial);
  return storage;
}

type Listener = (event: { key: string | null }) => void;

function fakeTarget() {
  const listeners = new Set<Listener>();
  const target: StorageEventTarget & {
    listeners: Set<Listener>;
    adds: number;
    removes: number;
    dispatch(key: string | null): void;
  } = {
    listeners,
    adds: 0,
    removes: 0,
    addEventListener(_type, listener) {
      target.adds += 1;
      listeners.add(listener);
    },
    removeEventListener(_type, listener) {
      target.removes += 1;
      listeners.delete(listener);
    },
    dispatch(key) {
      for (const listener of [...listeners]) listener({ key });
    },
  };
  return target;
}

function setup(initial?: string) {
  const storage = fakeStorage(initial);
  const target = fakeTarget();
  const store = createFavouritesStore({ getStorage: () => storage, target });
  let notified = 0;
  const unsubscribe = store.subscribe(() => {
    notified += 1;
  });
  return { storage, target, store, unsubscribe, notifications: () => notified };
}

test("parseFavourites reads a missing key, empty string and [] as no favourites", () => {
  assert.deepEqual(parseFavourites(null), []);
  assert.deepEqual(parseFavourites(""), []);
  assert.deepEqual(parseFavourites("[]"), []);
});

test("parseFavourites keeps a valid list", () => {
  assert.deepEqual(parseFavourites("[7]"), [7]);
});

test("parseFavourites reads corrupt or non-array JSON as no favourites", () => {
  for (const raw of ["{", "nope", '{"a":1}', "7", "null"]) {
    assert.deepEqual(parseFavourites(raw), [], raw);
  }
});

test("parseFavourites de-duplicates keeping the first occurrence", () => {
  assert.deepEqual(parseFavourites("[3, 3, 5]"), [3, 5]);
  assert.deepEqual(parseFavourites("[5, 3, 5, 3]"), [5, 3]);
});

test("parseFavourites drops everything but positive safe integer numbers", () => {
  assert.deepEqual(parseFavourites('["5", 1.5, 0, -3, 1e21, null, true, {}, 8]'), [8]);
});

test("toggleFavourite appends an absent ID and removes a present one", () => {
  assert.deepEqual(toggleFavourite([3, 5], 9), [3, 5, 9]);
  assert.deepEqual(toggleFavourite([3, 5, 9], 3), [5, 9]);
});

test("toggleFavourite re-adding an ID appends it at the end", () => {
  assert.deepEqual(toggleFavourite([5, 9], 3), [5, 9, 3]);
});

test("toggleFavourite twice returns the original list", () => {
  assert.deepEqual(toggleFavourite(toggleFavourite([3, 5], 9), 9), [3, 5]);
});

test("toggleFavourite returns the same reference for an invalid ID", () => {
  const list = [3, 5];
  assert.equal(toggleFavourite(list, 0), list);
  assert.equal(toggleFavourite(list, 1.5), list);
  assert.equal(toggleFavourite(list, -2), list);
  assert.equal(toggleFavourite(list, Number.NaN), list);
});

test("favouriteLabel uses the trimmed name or the unknown fallback", () => {
  assert.equal(favouriteLabel("  Rick Sanchez "), "Add Rick Sanchez to collection");
  assert.equal(favouriteLabel(""), "Add Unknown character to collection");
});

test("getSnapshot reads lazily, returns the identical reference and never writes", () => {
  const { storage, store } = setup("[1,2]");
  const first = store.getSnapshot();
  assert.deepEqual(first, [1, 2]);
  assert.equal(store.getSnapshot(), first);
  assert.equal(storage.sets, 0);
});

test("getSnapshot of an empty store is [] and writes nothing", () => {
  const { storage, store } = setup();
  assert.deepEqual(store.getSnapshot(), []);
  assert.equal(storage.sets, 0);
});

test("a corrupt stored value is not rewritten by a read", () => {
  const { storage, store } = setup("{oops");
  assert.deepEqual(store.getSnapshot(), []);
  assert.equal(storage.sets, 0);
  assert.equal(storage.data.get(FAVOURITES_KEY), "{oops");
});

test("toggle writes the JSON list, changes the snapshot and notifies once", () => {
  const { storage, store, notifications } = setup();
  const before = store.getSnapshot();
  store.toggle(4);
  assert.equal(storage.data.get(FAVOURITES_KEY), "[4]");
  assert.deepEqual(store.getSnapshot(), [4]);
  assert.notEqual(store.getSnapshot(), before);
  assert.equal(notifications(), 1);
});

test("toggle of an invalid ID changes nothing and notifies nobody", () => {
  const { storage, store, notifications } = setup("[1]");
  const before = store.getSnapshot();
  store.toggle(0);
  store.toggle(1.5);
  assert.equal(store.getSnapshot(), before);
  assert.equal(storage.sets, 0);
  assert.equal(notifications(), 0);
});

test("toggle re-reads storage first, so another tab's ID is kept", () => {
  const { storage, store } = setup();
  store.getSnapshot();
  storage.data.set(FAVOURITES_KEY, "[1]");
  store.toggle(2);
  assert.equal(storage.data.get(FAVOURITES_KEY), "[1,2]");
  assert.deepEqual(store.getSnapshot(), [1, 2]);
});

test("toggle writes a clean list over a corrupt value", () => {
  const { storage, store } = setup("{oops");
  store.toggle(6);
  assert.equal(storage.data.get(FAVOURITES_KEY), "[6]");
});

test("a storage event for the key with a changed value updates the snapshot and notifies", () => {
  const { storage, target, store, notifications } = setup("[1]");
  assert.deepEqual(store.getSnapshot(), [1]);
  storage.data.set(FAVOURITES_KEY, "[1,2]");
  target.dispatch(FAVOURITES_KEY);
  assert.deepEqual(store.getSnapshot(), [1, 2]);
  assert.equal(notifications(), 1);
  assert.equal(storage.sets, 0);
});

test("a storage clear (key null) gives [] and notifies", () => {
  const { storage, target, store, notifications } = setup("[1]");
  assert.deepEqual(store.getSnapshot(), [1]);
  storage.data.clear();
  target.dispatch(null);
  assert.deepEqual(store.getSnapshot(), []);
  assert.equal(notifications(), 1);
});

test("a storage event for another key does not notify", () => {
  const { storage, target, store, notifications } = setup("[1]");
  store.getSnapshot();
  storage.data.set(FAVOURITES_KEY, "[1,2]");
  target.dispatch("something-else");
  assert.deepEqual(store.getSnapshot(), [1]);
  assert.equal(notifications(), 0);
});

test("a storage event with an unchanged list does not notify or change the reference", () => {
  const { target, store, notifications } = setup("[1,2]");
  const before = store.getSnapshot();
  target.dispatch(FAVOURITES_KEY);
  assert.equal(store.getSnapshot(), before);
  assert.equal(notifications(), 0);
});

test("a throwing getStorage never throws and toggles work in memory", () => {
  const target = fakeTarget();
  const store = createFavouritesStore({
    getStorage: () => {
      throw new Error("SecurityError");
    },
    target,
  });
  let notified = 0;
  store.subscribe(() => {
    notified += 1;
  });
  assert.deepEqual(store.getSnapshot(), []);
  store.toggle(3);
  store.toggle(4);
  assert.deepEqual(store.getSnapshot(), [3, 4]);
  store.toggle(3);
  assert.deepEqual(store.getSnapshot(), [4]);
  assert.equal(notified, 3);
});

test("a null storage works in memory", () => {
  const store = createFavouritesStore({ getStorage: () => null, target: null });
  store.toggle(2);
  assert.deepEqual(store.getSnapshot(), [2]);
});

test("a throwing getItem never throws and toggles work in memory", () => {
  const { storage, store } = setup();
  storage.failGet = true;
  assert.deepEqual(store.getSnapshot(), []);
  store.toggle(5);
  assert.deepEqual(store.getSnapshot(), [5]);
  store.toggle(6);
  assert.deepEqual(store.getSnapshot(), [5, 6]);
});

test("a throwing setItem keeps the list in memory and does not lose the current list", () => {
  const { storage, store, notifications } = setup("[1]");
  assert.deepEqual(store.getSnapshot(), [1]);
  storage.failSet = true;
  store.toggle(2);
  assert.deepEqual(store.getSnapshot(), [1, 2]);
  store.toggle(3);
  assert.deepEqual(store.getSnapshot(), [1, 2, 3]);
  assert.equal(notifications(), 2);
});

test("the storage listener is attached for the first subscriber and removed after the last", () => {
  const storage = fakeStorage();
  const target = fakeTarget();
  const store = createFavouritesStore({ getStorage: () => storage, target });
  assert.equal(target.listeners.size, 0);
  const unsubA = store.subscribe(() => {});
  const unsubB = store.subscribe(() => {});
  assert.equal(target.adds, 1);
  assert.equal(target.listeners.size, 1);
  unsubA();
  assert.equal(target.listeners.size, 1);
  unsubB();
  assert.equal(target.listeners.size, 0);
  assert.equal(target.removes, 1);
});

test("an unsubscribed listener is no longer notified", () => {
  const { store, unsubscribe, notifications } = setup();
  unsubscribe();
  store.toggle(1);
  assert.equal(notifications(), 0);
});

test("toggle with a null event target still works", () => {
  const storage = fakeStorage();
  const store = createFavouritesStore({ getStorage: () => storage, target: null });
  const unsubscribe = store.subscribe(() => {});
  store.toggle(8);
  assert.equal(storage.data.get(FAVOURITES_KEY), "[8]");
  unsubscribe();
});
