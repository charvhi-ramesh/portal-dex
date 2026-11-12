import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  nextFocusIndex,
  orderByFavourites,
  removalAnnouncement,
} from "./collection.ts";
import { collectionOptions } from "../query/collection.ts";
import type { Character } from "../api/types.ts";

afterEach(() => {
  mock.restoreAll();
});

type Recorded = { url: URL; signal: AbortSignal | null | undefined };

/** Stubs globalThis.fetch with a fixed JSON response and records each request. */
function stubFetch(body: unknown, status = 200) {
  const calls: Recorded[] = [];
  mock.method(globalThis, "fetch", (async (input: unknown, init?: RequestInit) => {
    calls.push({ url: new URL(String(input)), signal: init?.signal });
    return new Response(JSON.stringify(body), { status });
  }) as typeof fetch);
  return calls;
}

const char = (id: number): Character => ({
  id,
  name: `Character ${id}`,
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  origin: { name: "Earth", url: "" },
  location: { name: "Earth", url: "" },
  image: `https://rickandmortyapi.com/api/character/avatar/${id}.jpeg`,
  episode: [],
  url: `https://rickandmortyapi.com/api/character/${id}`,
  created: "2017-11-04T18:48:46.250Z",
});

const ids = (list: readonly Character[]) => list.map((c) => c.id);

/** Invokes a queryFn with the minimal context TanStack Query would pass. */
async function runCollection(list: readonly number[], signal: AbortSignal) {
  const fn = collectionOptions(list).queryFn as unknown as (
    ctx: unknown,
  ) => Promise<Character[]>;
  return fn({ signal, queryKey: [], meta: undefined });
}

// ------------------------------------------------------------ orderByFavourites

test("orderByFavourites returns cards in favourited order, not API ID order", () => {
  const result = orderByFavourites([9, 2, 5], [char(2), char(5), char(9)]);
  assert.deepEqual(ids(result), [9, 2, 5]);
});

test("orderByFavourites skips IDs the API did not return", () => {
  assert.deepEqual(ids(orderByFavourites([3, 4], [char(3)])), [3]);
});

test("orderByFavourites returns nothing when there are no favourites", () => {
  assert.deepEqual(orderByFavourites([], [char(1)]), []);
});

test("orderByFavourites never emits the same card twice", () => {
  assert.deepEqual(ids(orderByFavourites([1, 1], [char(1), char(1)])), [1]);
});

test("orderByFavourites ignores returned cards that are not favourites", () => {
  assert.deepEqual(ids(orderByFavourites([2], [char(1), char(2), char(3)])), [2]);
});

// -------------------------------------------------------------- nextFocusIndex

test("nextFocusIndex picks the card that took the removed card's place", () => {
  assert.equal(nextFocusIndex(1, 3), 1);
});

test("nextFocusIndex picks the new last card when the last card was removed", () => {
  assert.equal(nextFocusIndex(2, 2), 1);
  assert.equal(nextFocusIndex(5, 2), 1);
});

test("nextFocusIndex clamps a negative index to the first card", () => {
  assert.equal(nextFocusIndex(-1, 2), 0);
});

test("nextFocusIndex is null when no cards remain (focus the heading)", () => {
  assert.equal(nextFocusIndex(0, 0), null);
  assert.equal(nextFocusIndex(3, -1), null);
});

// --------------------------------------------------------- removalAnnouncement

test("removalAnnouncement names one removed card", () => {
  assert.equal(
    removalAnnouncement(["Rick Sanchez"]),
    "Rick Sanchez removed from collection",
  );
});

test("removalAnnouncement trims the name", () => {
  assert.equal(removalAnnouncement(["  Rick "]), "Rick removed from collection");
});

test("removalAnnouncement reads an empty name as Unknown character", () => {
  assert.equal(
    removalAnnouncement([""]),
    "Unknown character removed from collection",
  );
});

test("removalAnnouncement joins two names with 'and'", () => {
  assert.equal(removalAnnouncement(["A", "B"]), "A and B removed from collection");
});

test("removalAnnouncement joins three or more names with commas and a final 'and'", () => {
  assert.equal(
    removalAnnouncement(["A", "B", "C"]),
    "A, B and C removed from collection",
  );
  assert.equal(
    removalAnnouncement(["A", "B", "C", "D"]),
    "A, B, C and D removed from collection",
  );
});

test("removalAnnouncement is empty for no names", () => {
  assert.equal(removalAnnouncement([]), "");
});

// ----------------------------------------------------------- collectionOptions

test("collectionOptions keys by the sorted ID list, so re-ordering shares the key", () => {
  assert.deepEqual(collectionOptions([3, 1, 2]).queryKey, [
    "characters",
    "collection",
    "1,2,3",
  ]);
  assert.deepEqual(
    collectionOptions([3, 1, 2]).queryKey,
    collectionOptions([1, 2, 3]).queryKey,
  );
});

test("collectionOptions queryFn makes one request and passes the query signal", async () => {
  const calls = stubFetch([char(1), char(2), char(3)]);
  const controller = new AbortController();

  const result = await runCollection([3, 1, 2], controller.signal);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.href, "https://rickandmortyapi.com/api/character/1,2,3");
  assert.equal(calls[0].signal, controller.signal);
  assert.deepEqual(ids(result), [1, 2, 3]);
});

test("collectionOptions queryFn resolves [] with no request for no favourites", async () => {
  const calls = stubFetch([]);

  const result = await runCollection([], new AbortController().signal);

  assert.deepEqual(result, []);
  assert.equal(calls.length, 0);
});

test("collectionOptions queryFn turns the single-object response for one ID into one card", async () => {
  stubFetch(char(7));

  const result = await runCollection([7], new AbortController().signal);

  assert.deepEqual(ids(result), [7]);
});
