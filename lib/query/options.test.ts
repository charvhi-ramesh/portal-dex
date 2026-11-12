import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";

import { browseOptions, humanoidCountOptions } from "./options.ts";
import { EMPTY_FILTERS, type Filters } from "../browse/filters.ts";
import type { BrowseStep } from "../browse/steps.ts";
import type { Character, CharacterPage } from "../api/types.ts";

afterEach(() => {
  mock.restoreAll();
});

type Recorded = { url: URL; signal: AbortSignal | null | undefined };

/** Stubs globalThis.fetch with one response per call (the last one repeats). */
function stubFetch(responses: { body: unknown; status?: number }[]) {
  const calls: Recorded[] = [];
  mock.method(globalThis, "fetch", (async (input: unknown, init?: RequestInit) => {
    calls.push({ url: new URL(String(input)), signal: init?.signal });
    const next = responses[Math.min(calls.length - 1, responses.length - 1)];
    return new Response(JSON.stringify(next.body), { status: next.status ?? 200 });
  }) as typeof fetch);
  return calls;
}

const char = (id: number, species = "Human"): Character => ({
  id,
  name: `Character ${id}`,
  status: "Alive",
  species,
  type: "",
  gender: "Male",
  origin: { name: "Earth", url: "" },
  location: { name: "Earth", url: "" },
  image: `https://rickandmortyapi.com/api/character/avatar/${id}.jpeg`,
  episode: [],
  url: `https://rickandmortyapi.com/api/character/${id}`,
  created: "2017-11-04T18:48:46.250Z",
});

const page = (
  results: Character[],
  info: Partial<CharacterPage["info"]> = {},
): CharacterPage => ({
  info: { count: results.length, pages: 1, next: null, prev: null, ...info },
  results,
});

const human: Filters = { ...EMPTY_FILTERS, species: "Human" };

/** Invokes a queryFn with the minimal context TanStack Query would pass. */
function context(signal: AbortSignal, pageParam?: number) {
  return { pageParam, signal, queryKey: [], meta: undefined };
}

async function runBrowse(filters: Filters, signal: AbortSignal, pageParam = 1) {
  const fn = browseOptions(filters).queryFn as unknown as (
    ctx: unknown,
  ) => Promise<BrowseStep>;
  return fn(context(signal, pageParam));
}

async function runCount(filters: Filters, signal: AbortSignal) {
  const fn = humanoidCountOptions(filters).queryFn as unknown as (
    ctx: unknown,
  ) => Promise<number>;
  return fn(context(signal));
}

// ------------------------------------------------------------------- browse key

test("browseOptions keys equal filter sets identically", () => {
  const a: Filters = { q: "rick", status: "Alive", gender: null, species: "Human" };
  const b: Filters = { q: "rick", status: "Alive", gender: null, species: "Human" };

  assert.deepEqual(browseOptions(a).queryKey, browseOptions(b).queryKey);
});

test("browseOptions keys differ when any single value differs", () => {
  const base: Filters = { q: "rick", status: "Alive", gender: "Male", species: "Human" };
  const variants: Filters[] = [
    { ...base, q: "morty" },
    { ...base, status: "Dead" },
    { ...base, gender: "Female" },
    { ...base, species: "Alien" },
    { ...base, status: null },
  ];

  for (const variant of variants) {
    assert.notDeepEqual(
      browseOptions(variant).queryKey,
      browseOptions(base).queryKey,
      JSON.stringify(variant),
    );
  }
});

test("browseOptions starts at API page 1 and follows the step's nextPage", () => {
  const options = browseOptions(EMPTY_FILTERS);

  assert.equal(options.initialPageParam, 1);
  assert.equal(
    options.getNextPageParam({ items: [], count: 0, nextPage: 5 }, [], 1, []),
    5,
  );
  assert.equal(
    options.getNextPageParam({ items: [], count: 0, nextPage: undefined }, [], 1, []),
    undefined,
  );
});

// ----------------------------------------------------------- browse queryFn

test("browseOptions queryFn requests species=Human page 1 with the query signal", async () => {
  const calls = stubFetch([{ body: page([char(1), char(2)]) }]);
  const controller = new AbortController();

  const step = await runBrowse(human, controller.signal);

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.pathname, "/api/character");
  assert.equal(calls[0].url.search, "?species=Human&page=1");
  assert.equal(calls[0].signal, controller.signal);
  assert.equal(step.items.length, 2);
});

test("browseOptions queryFn drops Humanoid and forwards the same signal to every sub-request", async () => {
  // Each API page is all Humanoid, so the step keeps reading until its 4-page cap.
  const calls = stubFetch([
    { body: page([char(1, "Humanoid"), char(2, "Humanoid")], { count: 434, next: "n" }) },
  ]);
  const controller = new AbortController();

  const step = await runBrowse(human, controller.signal);

  assert.equal(calls.length, 4);
  for (const call of calls) assert.equal(call.signal, controller.signal);
  assert.deepEqual(
    calls.map((call) => call.url.searchParams.get("page")),
    ["1", "2", "3", "4"],
  );
  assert.equal(step.items.length, 0);
  assert.equal(step.nextPage, 5);
});

test("browseOptions queryFn stops sub-requests once its signal is aborted", async () => {
  const controller = new AbortController();
  const reason = new Error("superseded");
  const calls: Recorded[] = [];
  // The first response aborts the query, as a newer search would.
  mock.method(globalThis, "fetch", (async (input: unknown, init?: RequestInit) => {
    calls.push({ url: new URL(String(input)), signal: init?.signal });
    controller.abort(reason);
    return new Response(
      JSON.stringify(page([char(1, "Humanoid")], { count: 434, next: "n" })),
    );
  }) as typeof fetch);

  await assert.rejects(runBrowse(human, controller.signal), (e) => e === reason);
  assert.equal(calls.length, 1);
});

// ------------------------------------------------------------- humanoid count

test("humanoidCountOptions key names the Humanoid filter set", () => {
  const [scope, kind, key] = humanoidCountOptions(human).queryKey;

  assert.equal(scope, "characters");
  assert.equal(kind, "count");
  assert.ok(key.includes("species=Humanoid"), key);
  assert.ok(!key.includes("species=Human&"), key);
});

test("humanoidCountOptions keys Human and Humanoid chips to the same count, other filters apart", () => {
  const alive: Filters = { ...human, status: "Alive" };
  const dead: Filters = { ...human, status: "Dead" };

  assert.deepEqual(
    humanoidCountOptions(human).queryKey,
    humanoidCountOptions({ ...human, species: "Humanoid" }).queryKey,
  );
  assert.notDeepEqual(
    humanoidCountOptions(alive).queryKey,
    humanoidCountOptions(dead).queryKey,
  );
});

test("humanoidCountOptions queryFn returns info.count of the page-1 response and forwards the signal", async () => {
  const calls = stubFetch([{ body: page([char(1, "Humanoid")], { count: 68, next: "n" }) }]);
  const controller = new AbortController();

  const count = await runCount({ ...human, status: "Alive" }, controller.signal);

  assert.equal(count, 68);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.search, "?status=Alive&species=Humanoid&page=1");
  assert.equal(calls[0].signal, controller.signal);
});

test("humanoidCountOptions queryFn returns 0 for HTTP 404", async () => {
  stubFetch([{ body: { error: "There is nothing here" }, status: 404 }]);

  assert.equal(await runCount(human, new AbortController().signal), 0);
});
