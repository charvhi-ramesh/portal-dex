import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";

import { extractId, parseId, toArray, toIdList } from "./normalize.ts";
import {
  fetchCharacter,
  fetchCharacterPage,
  fetchCharactersByIds,
} from "./characters.ts";
import {
  fetchEpisodesByIds,
  fetchLocation,
  fetchLocationsByIds,
} from "./resources.ts";
import type { Character, CharacterPage } from "./types.ts";

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

const page = (results: Character[]): CharacterPage => ({
  info: { count: results.length, pages: 1, next: null, prev: null },
  results,
});

// ---------------------------------------------------------------- normalize

test("parseId accepts positive integer strings", () => {
  assert.equal(parseId("1"), 1);
  assert.equal(parseId("826"), 826);
});

test("parseId rejects zero, negatives, decimals, junk, padding, blanks and unsafe integers", () => {
  for (const raw of ["0", "-1", "1.5", "abc", "007", "", " 1", "9007199254740993"]) {
    assert.equal(parseId(raw), null, `parseId(${JSON.stringify(raw)})`);
  }
});

test("extractId reads the last path segment of a resource URL", () => {
  assert.equal(extractId("https://rickandmortyapi.com/api/location/3"), 3);
  assert.equal(extractId("https://rickandmortyapi.com/api/location/3/"), 3);
  assert.equal(extractId(""), null);
});

test("toIdList dedupes, drops invalid values and sorts ascending", () => {
  assert.deepEqual(toIdList([3, 1, 3, 0, -2, 1.5, NaN]), [1, 3]);
});

test("toArray normalises an object, an array, null and undefined", () => {
  const a = { id: 1 };
  assert.deepEqual(toArray(a), [a]);
  assert.deepEqual(toArray([a, a]), [a, a]);
  assert.deepEqual(toArray(null), []);
  assert.deepEqual(toArray(undefined), []);
});

// -------------------------------------------------------- fetchCharacterPage

test("fetchCharacterPage builds the query in fixed order with a trimmed name", async () => {
  const calls = stubFetch(page([char(1)]));

  await fetchCharacterPage({ name: " rick ", status: "Alive" }, 2);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.pathname, "/api/character");
  assert.equal(calls[0].url.search, "?name=rick&status=Alive&page=2");
});

test("fetchCharacterPage omits empty values", async () => {
  const calls = stubFetch(page([]));

  await fetchCharacterPage({ name: "   ", species: "" }, 1);

  assert.equal(calls[0].url.search, "?page=1");
});

test("fetchCharacterPage encodes a species with a space through URLSearchParams", async () => {
  const calls = stubFetch(page([]));

  await fetchCharacterPage({ species: "Mythological Creature" }, 1);

  assert.equal(calls[0].url.searchParams.get("species"), "Mythological Creature");
  assert.ok(!calls[0].url.search.includes(" "));
});

test("fetchCharacterPage cannot be injected through search text", async () => {
  const calls = stubFetch(page([]));

  await fetchCharacterPage({ name: "a&status=Dead" }, 1);

  assert.equal(calls[0].url.searchParams.get("name"), "a&status=Dead");
  assert.equal(calls[0].url.searchParams.has("status"), false);
});

test("fetchCharacterPage rejects page 0 and 1.5 with RangeError before fetching", async () => {
  const calls = stubFetch(page([]));

  await assert.rejects(fetchCharacterPage({}, 0), RangeError);
  await assert.rejects(fetchCharacterPage({}, 1.5), RangeError);
  assert.equal(calls.length, 0);
});

test("fetchCharacterPage resolves to null for HTTP 404", async () => {
  stubFetch({ error: "There is nothing here" }, 404);

  assert.equal(await fetchCharacterPage({ name: "zzzz" }, 1), null);
  assert.equal(await fetchCharacterPage({ name: "rick" }, 99), null);
});

test("fetchCharacterPage passes the caller's signal through to fetch", async () => {
  const calls = stubFetch(page([]));
  const controller = new AbortController();

  await fetchCharacterPage({}, 1, controller.signal);

  assert.equal(calls[0].signal, controller.signal);
});

// ------------------------------------------------------------ fetchCharacter

test("fetchCharacter requests /character/{id}", async () => {
  const calls = stubFetch(char(5));

  const result = await fetchCharacter(5);

  assert.equal(calls[0].url.pathname, "/api/character/5");
  assert.equal(result?.id, 5);
});

test("fetchCharacter resolves to null without fetching for an invalid id", async () => {
  const calls = stubFetch(char(1));

  assert.equal(await fetchCharacter(0), null);
  assert.equal(await fetchCharacter(1.5), null);
  assert.equal(calls.length, 0);
});

test("fetchCharacter resolves to null for HTTP 404", async () => {
  stubFetch({ error: "Character not found" }, 404);

  assert.equal(await fetchCharacter(99999), null);
});

test("fetchCharacter passes the caller's signal through to fetch", async () => {
  const calls = stubFetch(char(5));
  const controller = new AbortController();

  await fetchCharacter(5, controller.signal);

  assert.equal(calls[0].signal, controller.signal);
});

// ------------------------------------------------------ fetchCharactersByIds

test("fetchCharactersByIds([]) resolves to [] without fetching", async () => {
  const calls = stubFetch([]);

  assert.deepEqual(await fetchCharactersByIds([]), []);
  assert.equal(calls.length, 0);
});

test("fetchCharactersByIds drops invalid ids before any request", async () => {
  const calls = stubFetch([]);

  assert.deepEqual(await fetchCharactersByIds([0, -1, 1.5, NaN]), []);
  assert.equal(calls.length, 0);
});

test("fetchCharactersByIds merges equal ids into one request and wraps an object response", async () => {
  const calls = stubFetch(char(2));

  const result = await fetchCharactersByIds([2, 2]);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.pathname, "/api/character/2");
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 2);
});

test("fetchCharactersByIds sorts ids ascending so the path is deterministic", async () => {
  const calls = stubFetch([char(1), char(3)]);

  await fetchCharactersByIds([3, 1]);
  await fetchCharactersByIds([1, 3]);

  assert.equal(calls[0].url.pathname, "/api/character/1,3");
  assert.equal(calls[1].url.pathname, "/api/character/1,3");
});

test("fetchCharactersByIds keeps the API order and omits missing ids", async () => {
  stubFetch([char(1)]);

  const result = await fetchCharactersByIds([1, 9999]);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
});

test("fetchCharactersByIds resolves to [] for an all-missing 200 [] and for HTTP 404", async () => {
  stubFetch([]);
  assert.deepEqual(await fetchCharactersByIds([9999, 9998]), []);
  mock.restoreAll();

  stubFetch({ error: "Character not found" }, 404);
  assert.deepEqual(await fetchCharactersByIds([9999]), []);
});

test("fetchCharactersByIds passes the caller's signal through to fetch", async () => {
  const calls = stubFetch([char(1)]);
  const controller = new AbortController();

  await fetchCharactersByIds([1], controller.signal);

  assert.equal(calls[0].signal, controller.signal);
});

// ------------------------------------------------------ resources: episodes

test("fetchEpisodesByIds sorts ids, requests /episode/1,28 and keeps an array response", async () => {
  const calls = stubFetch([{ id: 1 }, { id: 28 }]);

  const result = await fetchEpisodesByIds([28, 1]);

  assert.equal(calls[0].url.pathname, "/api/episode/1,28");
  assert.equal(result.length, 2);
});

test("fetchEpisodesByIds turns a single-object response into a one-item array", async () => {
  stubFetch({ id: 28 });

  const result = await fetchEpisodesByIds([28]);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 28);
});

test("fetchEpisodesByIds([]) makes no request and resolves to []", async () => {
  const calls = stubFetch([]);

  assert.deepEqual(await fetchEpisodesByIds([]), []);
  assert.equal(calls.length, 0);
});

test("fetchEpisodesByIds resolves to [] for HTTP 404 and forwards the signal", async () => {
  const controller = new AbortController();
  const calls = stubFetch({ error: "Episode not found" }, 404);

  assert.deepEqual(await fetchEpisodesByIds([999], controller.signal), []);
  assert.equal(calls[0].signal, controller.signal);
});

// ------------------------------------------------------ resources: locations

test("fetchLocation requests /location/{id} and 404 gives null", async () => {
  const calls = stubFetch({ id: 3 });
  const found = await fetchLocation(3);
  assert.equal(calls[0].url.pathname, "/api/location/3");
  assert.equal(found?.id, 3);
  mock.restoreAll();

  stubFetch({ error: "Location not found" }, 404);
  assert.equal(await fetchLocation(99999), null);
});

test("fetchLocation resolves to null without fetching for an invalid id and forwards the signal", async () => {
  const controller = new AbortController();
  const calls = stubFetch({ id: 3 });

  assert.equal(await fetchLocation(0), null);
  assert.equal(calls.length, 0);

  await fetchLocation(3, controller.signal);
  assert.equal(calls[0].signal, controller.signal);
});

test("fetchLocationsByIds follows the multi-ID rules", async () => {
  const calls = stubFetch([{ id: 1 }, { id: 3 }]);

  assert.deepEqual(await fetchLocationsByIds([]), []);
  assert.equal(calls.length, 0);

  const result = await fetchLocationsByIds([3, 1, 3]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.pathname, "/api/location/1,3");
  assert.equal(result.length, 2);
  mock.restoreAll();

  stubFetch({ id: 3 });
  assert.equal((await fetchLocationsByIds([3])).length, 1);
  mock.restoreAll();

  stubFetch({ error: "Location not found" }, 404);
  assert.deepEqual(await fetchLocationsByIds([999]), []);
});
