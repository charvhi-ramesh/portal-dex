import assert from "node:assert/strict";
import { test } from "node:test";
import type {
  Character,
  CharacterListParams,
  CharacterPage,
} from "../api/types.ts";
import {
  STEP_MAX_API_PAGES,
  STEP_TARGET,
  fetchBrowseStep,
  flattenSteps,
  type BrowseStep,
  type FetchPage,
} from "./steps.ts";
import type { Filters } from "./filters.ts";

// Synthetic CharacterPage fixtures shaped like the recorded API pages; the
// per-page exact-Human yields (18, 18, ...) mirror the research recording.
function character(id: number, species: string): Character {
  return {
    id,
    name: `Character ${id}`,
    status: "Alive",
    species,
    type: "",
    gender: "Male",
    origin: { name: "Earth", url: "" },
    location: { name: "Earth", url: "" },
    image: "",
    episode: [],
    url: "",
    created: "",
  };
}

let nextId = 1;

/** One API page: `exact` characters of `species` plus `noise` Humanoids. */
function apiPage(opts: {
  exact: number;
  noise?: number;
  species?: string;
  hasNext: boolean;
  count?: number;
}): CharacterPage {
  const results: Character[] = [];
  for (let i = 0; i < opts.exact; i += 1) {
    results.push(character(nextId++, opts.species ?? "Human"));
  }
  for (let i = 0; i < (opts.noise ?? 0); i += 1) {
    results.push(character(nextId++, "Humanoid"));
  }
  return {
    info: {
      count: opts.count ?? 434,
      pages: 22,
      next: opts.hasNext ? "https://example.test/next" : null,
      prev: null,
    },
    results,
  };
}

type Call = { params: CharacterListParams; page: number; signal: AbortSignal };

function stub(
  pages: Array<CharacterPage | null>,
  onCall?: (call: Call) => void,
): { fetchPage: FetchPage; calls: Call[] } {
  const calls: Call[] = [];
  const fetchPage: FetchPage = async (params, page, signal) => {
    const call = { params, page, signal };
    calls.push(call);
    onCall?.(call);
    // Pages are 1-based; anything beyond the script is a 404.
    return pages[page - 1] ?? null;
  };
  return { fetchPage, calls };
}

const human: Filters = { q: "", status: null, gender: null, species: "Human" };
const noSpecies: Filters = { q: "", status: null, gender: null, species: null };

test("constants are 20 items and 4 API pages", () => {
  assert.equal(STEP_TARGET, 20);
  assert.equal(STEP_MAX_API_PAGES, 4);
});

test("Human step fills across two API pages and drops Humanoid", async () => {
  const { fetchPage, calls } = stub([
    apiPage({ exact: 18, noise: 2, hasNext: true }),
    apiPage({ exact: 18, noise: 2, hasNext: true }),
    apiPage({ exact: 18, noise: 2, hasNext: true }),
  ]);
  const step = await fetchBrowseStep(
    human,
    1,
    fetchPage,
    new AbortController().signal,
  );
  assert.deepEqual(
    calls.map((c) => c.page),
    [1, 2],
  );
  assert.equal(step.items.length, 36);
  assert.ok(step.items.every((c) => c.species === "Human"));
  assert.equal(step.nextPage, 3);
  assert.equal(step.count, 434);
});

test("each API page request carries the filters as list params", async () => {
  const { fetchPage, calls } = stub([apiPage({ exact: 20, hasNext: true })]);
  await fetchBrowseStep(
    { q: " rick ", status: "Alive", gender: null, species: "Human" },
    1,
    fetchPage,
    new AbortController().signal,
  );
  assert.deepEqual(calls[0]?.params, {
    name: "rick",
    status: "Alive",
    species: "Human",
  });
});

test("step stops after STEP_MAX_API_PAGES calls with nextPage = page + 1", async () => {
  const six = Array.from({ length: 6 }, () =>
    apiPage({ exact: 2, noise: 18, hasNext: true }),
  );
  const { fetchPage, calls } = stub(six);
  const step = await fetchBrowseStep(
    human,
    1,
    fetchPage,
    new AbortController().signal,
  );
  assert.equal(calls.length, 4);
  assert.equal(step.items.length, 8);
  assert.equal(step.nextPage, 5);
});

test("step ends with nextPage undefined when the API has no next page", async () => {
  const { fetchPage, calls } = stub([
    apiPage({ exact: 3, hasNext: true }),
    apiPage({ exact: 3, hasNext: false }),
    apiPage({ exact: 3, hasNext: true }),
  ]);
  const step = await fetchBrowseStep(
    human,
    1,
    fetchPage,
    new AbortController().signal,
  );
  assert.equal(calls.length, 2);
  assert.equal(step.items.length, 6);
  assert.equal(step.nextPage, undefined);
});

test("a 404 on page 1 is the empty state, not an error", async () => {
  const { fetchPage, calls } = stub([null]);
  const step = await fetchBrowseStep(
    human,
    1,
    fetchPage,
    new AbortController().signal,
  );
  assert.deepEqual(step, { items: [], count: 0, nextPage: undefined });
  assert.equal(calls.length, 1);
});

test("a 404 on a later page ends the list and keeps gathered items", async () => {
  const { fetchPage, calls } = stub([
    apiPage({ exact: 5, hasNext: true, count: 77 }),
    apiPage({ exact: 5, hasNext: true, count: 77 }),
    null,
  ]);
  const step = await fetchBrowseStep(
    human,
    1,
    fetchPage,
    new AbortController().signal,
  );
  assert.equal(calls.length, 3);
  assert.equal(step.items.length, 10);
  assert.equal(step.count, 77);
  assert.equal(step.nextPage, undefined);
});

test("a 404 on the first call of a later step ends the list with no items", async () => {
  const { fetchPage } = stub([]);
  const step = await fetchBrowseStep(
    human,
    3,
    fetchPage,
    new AbortController().signal,
  );
  assert.equal(step.items.length, 0);
  assert.equal(step.nextPage, undefined);
});

test("without a species filter one API page is one step", async () => {
  const { fetchPage, calls } = stub([
    apiPage({ exact: 20, species: "Alien", hasNext: true, count: 826 }),
    apiPage({ exact: 20, species: "Alien", hasNext: true, count: 826 }),
  ]);
  const step = await fetchBrowseStep(
    noSpecies,
    1,
    fetchPage,
    new AbortController().signal,
  );
  assert.equal(calls.length, 1);
  assert.equal(step.items.length, 20);
  assert.equal(step.nextPage, 2);
  assert.equal(step.count, 826);
});

test("every sub-request receives the same AbortSignal", async () => {
  const controller = new AbortController();
  const { fetchPage, calls } = stub([
    apiPage({ exact: 5, hasNext: true }),
    apiPage({ exact: 5, hasNext: true }),
    apiPage({ exact: 5, hasNext: false }),
  ]);
  await fetchBrowseStep(human, 1, fetchPage, controller.signal);
  assert.equal(calls.length, 3);
  assert.ok(calls.every((c) => c.signal === controller.signal));
});

test("an abort between sub-requests rejects with the reason and stops calling", async () => {
  const controller = new AbortController();
  const reason = new Error("superseded");
  const { fetchPage, calls } = stub(
    [
      apiPage({ exact: 5, hasNext: true }),
      apiPage({ exact: 5, hasNext: true }),
    ],
    () => controller.abort(reason),
  );
  await assert.rejects(
    fetchBrowseStep(human, 1, fetchPage, controller.signal),
    (error) => error === reason,
  );
  assert.equal(calls.length, 1);
});

test("an invalid startPage throws RangeError before any call", async () => {
  const { fetchPage, calls } = stub([apiPage({ exact: 20, hasNext: true })]);
  const signal = new AbortController().signal;
  await assert.rejects(fetchBrowseStep(human, 0, fetchPage, signal), RangeError);
  await assert.rejects(
    fetchBrowseStep(human, 1.5, fetchPage, signal),
    RangeError,
  );
  assert.equal(calls.length, 0);
});

test("flattenSteps drops repeated ids and keeps first-seen order", () => {
  const steps: BrowseStep[] = [
    {
      items: [character(5, "Human"), character(7, "Human")],
      count: 10,
      nextPage: 2,
    },
    {
      items: [character(7, "Human"), character(9, "Human")],
      count: 10,
      nextPage: undefined,
    },
  ];
  assert.deepEqual(
    flattenSteps(steps).map((c) => c.id),
    [5, 7, 9],
  );
});

test("flattenSteps of no steps is empty", () => {
  assert.deepEqual(flattenSteps([]), []);
});
