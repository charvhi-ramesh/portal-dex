import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";

import { ApiError, getJson } from "./client.ts";

afterEach(() => {
  mock.restoreAll();
});

function stubFetch(impl: (input: unknown, init?: RequestInit) => Promise<Response>) {
  return mock.method(globalThis, "fetch", impl as typeof fetch);
}

test("200 JSON resolves to the parsed object and requests the API URL", async () => {
  const body = { info: { count: 1 }, results: [] };
  const stub = stubFetch(async () => new Response(JSON.stringify(body), { status: 200 }));

  const result = await getJson<typeof body>("/character?page=1");

  assert.deepEqual(result, body);
  assert.equal(stub.mock.callCount(), 1);
  assert.equal(
    String(stub.mock.calls[0].arguments[0]),
    "https://rickandmortyapi.com/api/character?page=1",
  );
});

test("404 resolves to null", async () => {
  stubFetch(
    async () =>
      new Response(JSON.stringify({ error: "There is nothing here" }), { status: 404 }),
  );

  assert.equal(await getJson("/character?name=zzzz&page=1"), null);
});

test("429 with an HTML body rejects with ApiError http 429, not a parse crash", async () => {
  stubFetch(
    async () =>
      new Response("<!doctype html><html><body>Too many requests</body></html>", {
        status: 429,
        headers: { "content-type": "text/html" },
      }),
  );

  await assert.rejects(getJson("/character?page=1"), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.kind, "http");
    assert.equal(e.status, 429);
    assert.equal(e.message, "HTTP 429");
    return true;
  });
});

test("fetch rejecting with a TypeError rejects with ApiError network and null status", async () => {
  stubFetch(async () => {
    throw new TypeError("Failed to fetch");
  });

  await assert.rejects(getJson("/character?page=1"), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.kind, "network");
    assert.equal(e.status, null);
    return true;
  });
});

test("an aborted request rejects with the AbortError, never an ApiError", async () => {
  const controller = new AbortController();
  stubFetch(async () => {
    throw new DOMException("The operation was aborted.", "AbortError");
  });
  controller.abort();

  await assert.rejects(getJson("/character?page=1", controller.signal), (e: unknown) => {
    assert.ok(e instanceof Error);
    assert.equal(e.name, "AbortError");
    assert.ok(!(e instanceof ApiError));
    return true;
  });
});

test("a 200 response with an invalid JSON body rejects with ApiError parse", async () => {
  stubFetch(async () => new Response("not json {", { status: 200 }));

  await assert.rejects(getJson("/character?page=1"), (e: unknown) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.kind, "parse");
    assert.equal(e.status, 200);
    return true;
  });
});

test("a path without a leading slash throws TypeError and never calls fetch", async () => {
  const stub = stubFetch(async () => new Response("{}", { status: 200 }));

  await assert.rejects(getJson("character?page=1"), TypeError);
  assert.equal(stub.mock.callCount(), 0);
});
