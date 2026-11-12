import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";

import {
  COUNT_STORAGE_KEY,
  INITIAL_PORTAL_STATE,
  SPIN_MS,
  parseStoredCount,
  pickRandomId,
  portalReducer,
  readLastKnownCount,
  rememberCount,
  revealAnnouncement,
  type PortalState,
} from "./portal.ts";
import { TOTAL_COUNT_KEY, characterOptions, totalCountOptions } from "../query/portal.ts";
import type { Character, CharacterPage } from "../api/types.ts";

afterEach(() => {
  mock.restoreAll();
  // Tests that fake a browser put `window` on globalThis; leave Node as it was.
  Reflect.deleteProperty(globalThis, "window");
});

const char = (id: number, name = `Character ${id}`): Character => ({
  id,
  name,
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

// --------------------------------------------------------------- constants

test("SPIN_MS is 1.2 s and the count is stored under portal-dex:character-count", () => {
  assert.equal(SPIN_MS, 1200);
  assert.equal(COUNT_STORAGE_KEY, "portal-dex:character-count");
});

// ------------------------------------------------------------ pickRandomId

test("pickRandomId maps random 0 to 1 and 0.9999999 to the count", () => {
  assert.equal(pickRandomId(826, null, () => 0), 1);
  assert.equal(pickRandomId(826, null, () => 0.9999999), 826);
});

test("pickRandomId with no previous reveal allows any id in range", () => {
  assert.equal(pickRandomId(10, null, () => 0.5), 6);
  assert.equal(pickRandomId(10, null, () => 0.1), 2);
});

test("pickRandomId never repeats previousId with count 2", () => {
  for (const r of [0, 0.5, 0.9999999]) {
    assert.equal(pickRandomId(2, 1, () => r), 2, `previous 1, random ${r}`);
    assert.equal(pickRandomId(2, 2, () => r), 1, `previous 2, random ${r}`);
  }
});

test("pickRandomId never returns previousId even when random lands exactly on it", () => {
  // count 10, previous 5: a plain 1 + floor(random x 10) lands on 5 for random 0.4.
  for (const r of [0.4, 0.5]) {
    const id = pickRandomId(10, 5, () => r);
    assert.ok(id !== null && id !== 5, `random ${r} gave ${id}`);
  }
});

test("pickRandomId is uniform over the allowed ids for count 10 and previous 5", () => {
  const seen: number[] = [];
  for (let i = 0; i <= 8; i++) {
    const id = pickRandomId(10, 5, () => i / 9);
    assert.notEqual(id, null);
    seen.push(id as number);
  }
  assert.deepEqual(
    [...seen].sort((a, b) => a - b),
    [1, 2, 3, 4, 6, 7, 8, 9, 10],
  );
});

test("pickRandomId returns 1 for count 1 even when previous is 1", () => {
  assert.equal(pickRandomId(1, 1), 1);
  assert.equal(pickRandomId(1, null), 1);
});

test("pickRandomId ignores a previousId outside [1, count]", () => {
  assert.equal(pickRandomId(10, 999, () => 0), 1);
  assert.equal(pickRandomId(10, 0, () => 0), 1);
  assert.equal(pickRandomId(10, -4, () => 0), 1);
  assert.equal(pickRandomId(10, 2.5, () => 0), 1);
  assert.equal(pickRandomId(10, Number.NaN, () => 0), 1);
});

test("pickRandomId returns null for an empty, negative, fractional or NaN count", () => {
  assert.equal(pickRandomId(0, null), null);
  assert.equal(pickRandomId(-3, null), null);
  assert.equal(pickRandomId(1.5, null), null);
  assert.equal(pickRandomId(Number.NaN, null), null);
  assert.equal(pickRandomId(Number.POSITIVE_INFINITY, null), null);
});

test("pickRandomId clamps a random() that returns 1 into range", () => {
  assert.equal(pickRandomId(826, null, () => 1), 826);
  assert.equal(pickRandomId(2, 1, () => 1), 2);
});

test("pickRandomId returns integers within [1, count] for many draws", () => {
  for (let i = 0; i < 500; i++) {
    const id = pickRandomId(826, 100);
    assert.ok(Number.isInteger(id) && (id as number) >= 1 && (id as number) <= 826);
    assert.notEqual(id, 100);
  }
});

// --------------------------------------------------------- revealAnnouncement

test("revealAnnouncement uses the trimmed full name", () => {
  assert.equal(revealAnnouncement("  Rick Sanchez "), "Portal opened: Rick Sanchez");
  assert.equal(revealAnnouncement("Rick Sanchez"), "Portal opened: Rick Sanchez");
});

test("revealAnnouncement passes accented characters through unchanged", () => {
  assert.equal(revealAnnouncement("Morty Smith-Gómez"), "Portal opened: Morty Smith-Gómez");
});

test("revealAnnouncement falls back for an empty or whitespace name", () => {
  assert.equal(revealAnnouncement(""), "Portal opened: Unknown character");
  assert.equal(revealAnnouncement("   "), "Portal opened: Unknown character");
});

// ---------------------------------------------------------- parseStoredCount

test("parseStoredCount accepts canonical positive integers", () => {
  assert.equal(parseStoredCount("826"), 826);
  assert.equal(parseStoredCount("1"), 1);
});

test("parseStoredCount rejects everything else", () => {
  for (const raw of [null, "", "0", "-1", "1.5", "1e3", " 826", "826 ", "007", "abc"]) {
    assert.equal(parseStoredCount(raw), null, String(raw));
  }
});

// ------------------------------------------------ readLastKnownCount / remember

test("readLastKnownCount is null and rememberCount does not throw without a window", () => {
  assert.equal(readLastKnownCount(), null);
  assert.doesNotThrow(() => rememberCount(826));
});

function fakeWindow(store: Map<string, string>) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => void store.set(key, value),
      },
    },
  });
}

test("rememberCount stores a positive safe integer and readLastKnownCount reads it back", () => {
  const store = new Map<string, string>();
  fakeWindow(store);

  rememberCount(826);

  assert.equal(store.get("portal-dex:character-count"), "826");
  assert.equal(readLastKnownCount(), 826);
});

test("rememberCount writes nothing for zero, negative, fractional or NaN counts", () => {
  const store = new Map<string, string>();
  fakeWindow(store);

  for (const count of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    rememberCount(count);
  }

  assert.equal(store.size, 0);
});

test("readLastKnownCount ignores a tampered stored value", () => {
  const store = new Map<string, string>([["portal-dex:character-count", "9e99"]]);
  fakeWindow(store);

  assert.equal(readLastKnownCount(), null);
});

test("storage that throws is swallowed in both directions", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: () => {
          throw new Error("denied");
        },
        setItem: () => {
          throw new Error("quota");
        },
      },
    },
  });

  assert.equal(readLastKnownCount(), null);
  assert.doesNotThrow(() => rememberCount(826));
});

// ------------------------------------------------------------- portalReducer

const spinning = (token: number, source: PortalState["source"] = "portal"): PortalState => ({
  ...INITIAL_PORTAL_STATE,
  phase: "spinning",
  token,
  source,
});

test("INITIAL_PORTAL_STATE is idle with nothing revealed", () => {
  assert.deepEqual(INITIAL_PORTAL_STATE, {
    phase: "idle",
    token: 0,
    source: null,
    character: null,
    previousId: null,
  });
});

test("portalReducer start from idle spins with the event token and source", () => {
  const next = portalReducer(INITIAL_PORTAL_STATE, {
    type: "start",
    token: 1,
    source: "portal",
  });

  assert.equal(next.phase, "spinning");
  assert.equal(next.token, 1);
  assert.equal(next.source, "portal");
  assert.equal(next.character, null);
  assert.equal(next.previousId, null);
});

test("portalReducer start keeps previousId and clears the old character", () => {
  const revealed: PortalState = {
    phase: "revealed",
    token: 1,
    source: "portal",
    character: char(5),
    previousId: 5,
  };

  const next = portalReducer(revealed, { type: "start", token: 2, source: "again" });

  assert.equal(next.phase, "spinning");
  assert.equal(next.token, 2);
  assert.equal(next.source, "again");
  assert.equal(next.character, null);
  assert.equal(next.previousId, 5);
});

test("portalReducer ignores start while spinning and returns the same object", () => {
  const state = spinning(3);

  assert.equal(portalReducer(state, { type: "start", token: 4, source: "again" }), state);
});

test("portalReducer success with the current token reveals and remembers the id", () => {
  const next = portalReducer(spinning(2), { type: "success", token: 2, character: char(42) });

  assert.equal(next.phase, "revealed");
  assert.equal(next.character?.id, 42);
  assert.equal(next.previousId, 42);
  assert.equal(next.token, 2);
});

test("portalReducer ignores success, failure and cancel from another token", () => {
  const state = spinning(5);

  assert.equal(portalReducer(state, { type: "success", token: 4, character: char(1) }), state);
  assert.equal(portalReducer(state, { type: "failure", token: 4 }), state);
  assert.equal(portalReducer(state, { type: "cancel", token: 6 }), state);
});

test("portalReducer failure goes to error with no character and keeps previousId", () => {
  const state: PortalState = { ...spinning(2, "again"), previousId: 7 };

  const next = portalReducer(state, { type: "failure", token: 2 });

  assert.equal(next.phase, "error");
  assert.equal(next.character, null);
  assert.equal(next.previousId, 7);
  assert.equal(next.token, 2);
});

test("portalReducer cancel goes back to idle", () => {
  const next = portalReducer(spinning(2), { type: "cancel", token: 2 });

  assert.equal(next.phase, "idle");
  assert.equal(next.character, null);
});

test("portalReducer start from error spins again (Retry)", () => {
  const errored: PortalState = { ...INITIAL_PORTAL_STATE, phase: "error", token: 2 };

  const next = portalReducer(errored, { type: "start", token: 3, source: "retry" });

  assert.equal(next.phase, "spinning");
  assert.equal(next.source, "retry");
  assert.equal(next.token, 3);
});

// ------------------------------------------------------------ query options

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

function context(signal: AbortSignal) {
  return { signal, queryKey: [], meta: undefined };
}

const page = (count: number): CharacterPage => ({
  info: { count, pages: 42, next: "n", prev: null },
  results: [char(1)],
});

test("totalCountOptions key is the unfiltered member of the count namespace", () => {
  assert.deepEqual(totalCountOptions().queryKey, ["characters", "count", ""]);
  assert.deepEqual(TOTAL_COUNT_KEY, ["characters", "count", ""]);
});

test("totalCountOptions queryFn requests page 1 with the signal and resolves info.count", async () => {
  const calls = stubFetch([{ body: page(826) }]);
  const controller = new AbortController();
  const fn = totalCountOptions().queryFn as unknown as (ctx: unknown) => Promise<number>;

  const count = await fn(context(controller.signal));

  assert.equal(count, 826);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.pathname, "/api/character");
  assert.equal(calls[0].url.search, "?page=1");
  assert.equal(calls[0].signal, controller.signal);
});

test("totalCountOptions queryFn resolves 0 for HTTP 404 and does not store it", async () => {
  stubFetch([{ body: { error: "There is nothing here" }, status: 404 }]);
  const store = new Map<string, string>();
  fakeWindow(store);
  const fn = totalCountOptions().queryFn as unknown as (ctx: unknown) => Promise<number>;

  assert.equal(await fn(context(new AbortController().signal)), 0);
  assert.equal(store.size, 0);
});

test("totalCountOptions queryFn remembers a positive count as the last-known count", async () => {
  stubFetch([{ body: page(826) }]);
  const store = new Map<string, string>();
  fakeWindow(store);
  const fn = totalCountOptions().queryFn as unknown as (ctx: unknown) => Promise<number>;

  await fn(context(new AbortController().signal));

  assert.equal(store.get("portal-dex:character-count"), "826");
});

test("characterOptions key names the detail namespace and the id", () => {
  assert.deepEqual(characterOptions(5).queryKey, ["characters", "detail", 5]);
});

test("characterOptions queryFn requests /character/5 with the signal", async () => {
  const calls = stubFetch([{ body: char(5) }]);
  const controller = new AbortController();
  const fn = characterOptions(5).queryFn as unknown as (
    ctx: unknown,
  ) => Promise<Character | null>;

  const result = await fn(context(controller.signal));

  assert.equal(result?.id, 5);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.pathname, "/api/character/5");
  assert.equal(calls[0].signal, controller.signal);
});

test("characterOptions queryFn resolves null for HTTP 404", async () => {
  stubFetch([{ body: { error: "Character not found" }, status: 404 }]);
  const fn = characterOptions(99999).queryFn as unknown as (
    ctx: unknown,
  ) => Promise<Character | null>;

  assert.equal(await fn(context(new AbortController().signal)), null);
});
