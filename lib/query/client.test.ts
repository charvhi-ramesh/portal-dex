import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../api/client.ts";
import {
  ONE_HOUR,
  makeQueryClient,
  queryDefaults,
  shouldRetry,
} from "./client.ts";

test("staleTime is at least one hour (DATA-05)", () => {
  assert.equal(ONE_HOUR, 3_600_000);
  assert.ok(queryDefaults.staleTime >= 3_600_000);
});

test("gcTime outlives staleTime so a revisit still finds the cache", () => {
  assert.ok(queryDefaults.gcTime > queryDefaults.staleTime);
});

test("no refetch on window focus or reconnect", () => {
  assert.equal(queryDefaults.refetchOnWindowFocus, false);
  assert.equal(queryDefaults.refetchOnReconnect, false);
});

test("networkMode is always so offline queries reject instead of pausing", () => {
  assert.equal(queryDefaults.networkMode, "always");
});

test("makeQueryClient applies queryDefaults to queries", () => {
  const queries = makeQueryClient().getDefaultOptions().queries;
  assert.equal(queries?.staleTime, queryDefaults.staleTime);
  assert.equal(queries?.gcTime, queryDefaults.gcTime);
  assert.equal(queries?.refetchOnWindowFocus, false);
  assert.equal(queries?.refetchOnReconnect, false);
  assert.equal(queries?.networkMode, "always");
  assert.equal(queries?.retry, shouldRetry);
});

test("network errors retry once", () => {
  const error = new ApiError("network", null, "Network request failed");
  assert.equal(shouldRetry(0, error), true);
  assert.equal(shouldRetry(1, error), false);
});

test("5xx errors retry once", () => {
  const error = new ApiError("http", 503, "HTTP 503");
  assert.equal(shouldRetry(0, error), true);
  assert.equal(shouldRetry(1, error), false);
});

test("4xx errors never retry, including the 429 rate limit", () => {
  assert.equal(shouldRetry(0, new ApiError("http", 404, "HTTP 404")), false);
  assert.equal(shouldRetry(0, new ApiError("http", 429, "HTTP 429")), false);
});

test("parse errors never retry", () => {
  assert.equal(shouldRetry(0, new ApiError("parse", 200, "Invalid JSON")), false);
});

test("aborted requests never retry", () => {
  const abort = new Error("aborted");
  abort.name = "AbortError";
  assert.equal(shouldRetry(0, abort), false);
});

test("unknown errors never retry", () => {
  assert.equal(shouldRetry(0, new Error("boom")), false);
  assert.equal(shouldRetry(0, "boom"), false);
});
