import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";

import {
  RESIDENT_LIMIT,
  alsoFoundHeading,
  locationIdOf,
  pickResidentIds,
} from "./residents.ts";
import { locationOptions, residentsOptions, seedCharacter } from "../query/detail.ts";
import { characterOptions } from "../query/portal.ts";
import type { Character, LocationResource } from "../api/types.ts";

afterEach(() => {
  mock.restoreAll();
});

type Recorded = { url: URL; signal: AbortSignal | null | undefined };

function stubFetch(responses: { body: unknown; status?: number }[]) {
  const calls: Recorded[] = [];
  mock.method(globalThis, "fetch", (async (input: unknown, init?: RequestInit) => {
    calls.push({ url: new URL(String(input)), signal: init?.signal });
    const next = responses[Math.min(calls.length - 1, responses.length - 1)];
    return new Response(JSON.stringify(next.body), { status: next.status ?? 200 });
  }) as typeof fetch);
  return calls;
}

const CHAR = "https://rickandmortyapi.com/api/character/";
const urls = (...ids: number[]) => ids.map((id) => `${CHAR}${id}`);

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
  url: `${CHAR}${id}`,
  created: "2017-11-04T18:48:46.250Z",
});

test("locationIdOf is null for an empty URL", () => {
  assert.equal(locationIdOf({ url: "" }), null);
});

test("locationIdOf reads the ID from a location URL", () => {
  assert.equal(locationIdOf({ url: "https://rickandmortyapi.com/api/location/3" }), 3);
});

test("locationIdOf is null when the last segment is not an ID", () => {
  assert.equal(locationIdOf({ url: "https://rickandmortyapi.com/api/location/abc" }), null);
});

test("pickResidentIds removes the current character", () => {
  assert.deepEqual(pickResidentIds(urls(1, 2, 3), 2), [1, 3]);
});

test("pickResidentIds takes the first 12 others in URL order", () => {
  const twenty = Array.from({ length: 20 }, (_, i) => i + 1);
  assert.equal(RESIDENT_LIMIT, 12);
  assert.deepEqual(
    pickResidentIds(urls(...twenty), 1),
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  );
});

test("pickResidentIds keeps the location's order instead of sorting", () => {
  assert.deepEqual(pickResidentIds(urls(9, 3, 7), 1), [9, 3, 7]);
});

test("pickResidentIds drops duplicates keeping the first", () => {
  assert.deepEqual(pickResidentIds(urls(5, 5, 6), 1), [5, 6]);
});

test("pickResidentIds skips invalid URLs", () => {
  assert.deepEqual(pickResidentIds(["", `${CHAR}abc`, `${CHAR}007`, `${CHAR}4`], 1), [4]);
});

test("pickResidentIds is empty when only the current character lives there", () => {
  assert.deepEqual(pickResidentIds(urls(2), 2), []);
});

test("pickResidentIds is empty for an empty list", () => {
  assert.deepEqual(pickResidentIds([], 1), []);
});

test("pickResidentIds is empty for a zero or negative limit", () => {
  assert.deepEqual(pickResidentIds(urls(1, 2, 3), 9, 0), []);
  assert.deepEqual(pickResidentIds(urls(1, 2, 3), 9, -2), []);
});

test("alsoFoundHeading names the location", () => {
  assert.equal(alsoFoundHeading("Citadel of Ricks"), "Also found at Citadel of Ricks");
});

test("alsoFoundHeading falls back for a blank name", () => {
  assert.equal(alsoFoundHeading("  "), "Also found at this location");
});

test("locationOptions keys by the location ID", () => {
  assert.deepEqual(locationOptions(3).queryKey, ["locations", "detail", 3]);
});

test("locationOptions makes one request with the query signal", async () => {
  const place: LocationResource = {
    id: 3,
    name: "Citadel of Ricks",
    type: "Space station",
    dimension: "unknown",
    residents: urls(8),
    url: "https://rickandmortyapi.com/api/location/3",
    created: "2017-11-10T13:08:13.191Z",
  };
  const calls = stubFetch([{ body: place }]);
  const controller = new AbortController();
  const data = await locationOptions(3).queryFn!({ signal: controller.signal } as never);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.href, "https://rickandmortyapi.com/api/location/3");
  assert.equal(calls[0].signal, controller.signal);
  assert.equal(data?.name, "Citadel of Ricks");
});

test("locationOptions resolves null on a 404", async () => {
  stubFetch([{ body: { error: "Location not found" }, status: 404 }]);
  const data = await locationOptions(3).queryFn!({
    signal: new AbortController().signal,
  } as never);
  assert.equal(data, null);
});

test("residentsOptions keys by the sorted ID list", () => {
  assert.deepEqual(residentsOptions([9, 3, 7]).queryKey, [
    "characters",
    "residents",
    "3,7,9",
  ]);
});

test("residentsOptions makes one multi-ID request", async () => {
  const calls = stubFetch([{ body: [char(3), char(7), char(9)] }]);
  const controller = new AbortController();
  const data = await residentsOptions([9, 3, 7]).queryFn!({
    signal: controller.signal,
  } as never);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.href, `${CHAR}3,7,9`);
  assert.equal(calls[0].signal, controller.signal);
  assert.equal(data.length, 3);
});

test("seedCharacter fills an empty detail key with the character", () => {
  const client = new QueryClient();
  seedCharacter(client, char(4));
  assert.deepEqual(client.getQueryData(characterOptions(4).queryKey), char(4));
});

test("seedCharacter leaves existing data and its timestamp unchanged", async () => {
  const client = new QueryClient();
  const key = characterOptions(4).queryKey;
  client.setQueryData(key, char(99));
  const before = client.getQueryState(key)?.dataUpdatedAt;
  await new Promise((resolve) => setTimeout(resolve, 5));
  seedCharacter(client, char(4));
  assert.deepEqual(client.getQueryData(key), char(99));
  assert.equal(client.getQueryState(key)?.dataUpdatedAt, before);
});

test("seedCharacter leaves a cached null (404) alone", () => {
  const client = new QueryClient();
  const key = characterOptions(4).queryKey;
  client.setQueryData(key, null);
  seedCharacter(client, char(4));
  assert.equal(client.getQueryData(key), null);
});
