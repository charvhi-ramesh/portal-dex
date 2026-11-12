import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";

import { episodeChips, episodeIdsOf, episodeLabel } from "./episodes.ts";
import { episodesOptions } from "../query/detail.ts";
import type { Episode } from "../api/types.ts";

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

const BASE = "https://rickandmortyapi.com/api/episode/";
const url = (id: number | string) => `${BASE}${id}`;

const ep = (id: number, code: string, name: string): Episode => ({
  id,
  name,
  air_date: "December 2, 2013",
  episode: code,
  characters: [],
  url: url(id),
  created: "2017-11-10T12:56:33.798Z",
});

const E1 = ep(1, "S01E01", "Pilot");
const E2 = ep(2, "S01E02", "Lawnmower Dog");
const E10 = ep(10, "S01E10", "Close Rick-counters of the Rick Kind");

test("episodeChips orders chips by numeric episode ID, 2 before 10", () => {
  const chips = episodeChips([url(10), url(2), url(1)], [E10, E2, E1]);
  assert.deepEqual(
    chips.map((c) => c.id),
    [1, 2, 10],
  );
  assert.equal(chips[0].label, "S01E01 · Pilot");
  assert.equal(chips[2].label, "S01E10 · Close Rick-counters of the Rick Kind");
});

test("episodeChips of an empty list is empty", () => {
  assert.deepEqual(episodeChips([], []), []);
});

test("episodeChips gives one chip for one URL", () => {
  assert.equal(episodeChips([url(1)], [E1]).length, 1);
});

test("episodeChips gives exactly as many chips as URLs for 51 episodes", () => {
  const urls = Array.from({ length: 51 }, (_, i) => url(i + 1));
  assert.equal(episodeChips(urls, []).length, 51);
});

test("episodeChips keeps a repeated URL as two adjacent chips with distinct keys", () => {
  const chips = episodeChips([url(2), url(1), url(2)], [E1, E2]);
  assert.deepEqual(
    chips.map((c) => c.id),
    [1, 2, 2],
  );
  assert.notEqual(chips[1].key, chips[2].key);
  assert.equal(new Set(chips.map((c) => c.key)).size, 3);
});

test("episodeChips labels an episode missing from the response 'Episode {id}'", () => {
  const chips = episodeChips([url(7)], []);
  assert.equal(chips[0].label, "Episode 7");
});

test("episodeChips turns unparsable URLs into 'Unknown episode' chips that sort last", () => {
  const chips = episodeChips(["", url("abc"), url("007"), url(3)], [ep(3, "S01E03", "Anatomy Park")]);
  assert.equal(chips.length, 4);
  assert.equal(chips[0].label, "S01E03 · Anatomy Park");
  assert.deepEqual(
    chips.slice(1).map((c) => c.label),
    ["Unknown episode", "Unknown episode", "Unknown episode"],
  );
  assert.ok(chips.slice(1).every((c) => c.id === null));
});

test("episodeChips treats IDs beyond the safe-integer range and decimals as unknown", () => {
  const chips = episodeChips([url("9007199254740993"), url("1.5"), url(1)], [E1]);
  assert.equal(chips[0].id, 1);
  assert.deepEqual(
    chips.slice(1).map((c) => c.label),
    ["Unknown episode", "Unknown episode"],
  );
});

test("episodeChips keeps URL order for equal IDs and for unknown URLs", () => {
  const chips = episodeChips([url("x"), url("y"), url(5), url(5)], []);
  assert.deepEqual(
    chips.map((c) => c.key),
    ["5-2", "5-3", "unknown-0", "unknown-1"],
  );
});

test("episodeLabel joins code and name with a middle dot", () => {
  assert.equal(episodeLabel({ episode: "S01E01", name: "Pilot" }), "S01E01 · Pilot");
  assert.ok(episodeLabel({ episode: "S01E01", name: "Pilot" }).includes("·"));
});

test("episodeLabel leaves apostrophes and non-ASCII names exactly as given", () => {
  assert.equal(
    episodeLabel({ episode: "S02E05", name: "Get Schwifty's Café é" }),
    "S02E05 · Get Schwifty's Café é",
  );
});

test("episodeLabel uses the name alone when the code is empty, and the code alone when the name is empty", () => {
  assert.equal(episodeLabel({ episode: "", name: "Pilot" }), "Pilot");
  assert.equal(episodeLabel({ episode: "S01E01", name: "  " }), "S01E01");
  assert.equal(episodeLabel({ episode: "", name: "" }), "Unknown episode");
});

test("episodeIdsOf returns valid IDs in URL order without de-duplicating", () => {
  assert.deepEqual(episodeIdsOf([url(10), "", url(2), url(10), url("007")]), [10, 2, 10]);
});

test("episodesOptions keys by the sorted ID list", () => {
  assert.deepEqual(episodesOptions([10, 2, 1]).queryKey, ["episodes", "1,2,10"]);
});

test("episodesOptions makes one request with the query signal", async () => {
  const calls = stubFetch([{ body: [E1, E2, E10] }]);
  const controller = new AbortController();
  const data = await episodesOptions([10, 2, 1]).queryFn!({
    signal: controller.signal,
  } as never);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.href, `${BASE}1,2,10`);
  assert.equal(calls[0].signal, controller.signal);
  assert.equal(data.length, 3);
});

test("episodesOptions for no IDs resolves [] without a request", async () => {
  const calls = stubFetch([{ body: [] }]);
  const data = await episodesOptions([]).queryFn!({
    signal: new AbortController().signal,
  } as never);
  assert.deepEqual(data, []);
  assert.equal(calls.length, 0);
});

test("episodesOptions turns the API's single-object response into one episode", async () => {
  const calls = stubFetch([{ body: E1 }]);
  const data = await episodesOptions([1]).queryFn!({
    signal: new AbortController().signal,
  } as never);
  assert.equal(calls[0].url.href, `${BASE}1`);
  assert.deepEqual(data, [E1]);
});
