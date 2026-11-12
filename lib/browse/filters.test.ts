import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EMPTY_FILTERS,
  GENDERS,
  MAX_QUERY_LENGTH,
  SPECIES,
  STATUSES,
  buildBrowseUrl,
  filtersKey,
  hasActiveFilters,
  labelFor,
  parseFilters,
  serializeFilters,
  toListParams,
  toggleFilter,
  type Filters,
} from "./filters.ts";

const parse = (search: string) => parseFilters(new URLSearchParams(search));

test("allow-lists hold the canonical API values in UI order", () => {
  assert.deepEqual([...STATUSES], ["Alive", "Dead", "unknown"]);
  assert.deepEqual([...GENDERS], ["Female", "Male", "Genderless", "unknown"]);
  assert.deepEqual(
    [...SPECIES],
    ["Human", "Alien", "Humanoid", "Mythological Creature", "Robot", "Animal"],
  );
  assert.equal(MAX_QUERY_LENGTH, 60);
});

test("parseFilters of an empty query string equals EMPTY_FILTERS", () => {
  assert.deepEqual(parse(""), EMPTY_FILTERS);
  assert.deepEqual(EMPTY_FILTERS, {
    q: "",
    status: null,
    gender: null,
    species: null,
  });
});

test("parseFilters reads all four values", () => {
  assert.deepEqual(parse("q=rick&status=Alive&gender=Female&species=Human"), {
    q: "rick",
    status: "Alive",
    gender: "Female",
    species: "Human",
  });
});

test("parseFilters rejects wrong-case and unknown chip values", () => {
  assert.equal(parse("status=alive").status, null);
  assert.equal(parse("species=Cronenberg").species, null);
  assert.equal(parse("gender=x").gender, null);
  assert.equal(parse("species=human").species, null);
});

test("parseFilters takes the first value of a repeated param", () => {
  assert.equal(parse("status=Alive&status=Dead").status, "Alive");
});

test("parseFilters trims q", () => {
  assert.equal(parse("q=%20%20rick%20%20").q, "rick");
});

test("parseFilters turns a whitespace-only q into an empty search", () => {
  assert.equal(parse("q=%20%20").q, "");
  assert.equal(serializeFilters(parse("q=%20%20")), "");
});

test("serializeFilters omits a whitespace-only q", () => {
  assert.equal(serializeFilters({ ...EMPTY_FILTERS, q: "  " }), "");
});

test("parseFilters caps q at 60 characters", () => {
  assert.equal(parse(`q=${"a".repeat(70)}`).q.length, 60);
});

test("parseFilters never splits a surrogate pair at the cap", () => {
  const emoji = "\u{1F680}";
  const q = parse(`q=${encodeURIComponent("a".repeat(59) + emoji + "x")}`).q;
  const points = Array.from(q);
  assert.equal(points.length, 60);
  assert.equal(points[59], emoji);
  assert.equal(q.endsWith(emoji), true);
  // A lone surrogate would not survive a UTF-8 round trip.
  assert.equal(Buffer.from(q, "utf8").toString("utf8"), q);
});

test("serializeFilters emits q, status, gender, species in a fixed order", () => {
  const f: Filters = {
    q: "rick",
    status: "Alive",
    gender: "Female",
    species: "Human",
  };
  assert.equal(
    serializeFilters(f),
    "q=rick&status=Alive&gender=Female&species=Human",
  );
});

test("serializeFilters omits null and empty values and is empty for EMPTY_FILTERS", () => {
  assert.equal(serializeFilters(EMPTY_FILTERS), "");
  assert.equal(
    serializeFilters({ ...EMPTY_FILTERS, species: "Robot" }),
    "species=Robot",
  );
  assert.equal(serializeFilters({ ...EMPTY_FILTERS, status: "Dead" }), "status=Dead");
});

test("click order does not change the serialized URL or the key", () => {
  const a = toggleFilter(toggleFilter(EMPTY_FILTERS, "species", "Human"), "status", "Alive");
  const b = toggleFilter(toggleFilter(EMPTY_FILTERS, "status", "Alive"), "species", "Human");
  assert.equal(serializeFilters(a), serializeFilters(b));
  assert.equal(filtersKey(a), filtersKey(b));
});

test("buildBrowseUrl gives the bare path when no filter is active", () => {
  assert.equal(buildBrowseUrl("/browse", EMPTY_FILTERS), "/browse");
});

test("buildBrowseUrl appends the serialized filters", () => {
  assert.equal(
    buildBrowseUrl("/browse", { ...EMPTY_FILTERS, q: "rick", status: "Alive" }),
    "/browse?q=rick&status=Alive",
  );
});

test("filters survive a serialize then parse round trip", () => {
  for (const q of [
    "Mr. Poopybutthole",
    "a&b",
    "1+1",
    "#hash",
    "Ångström",
    "rick sanchez",
  ]) {
    const f: Filters = { q, status: "Dead", gender: "Male", species: "Alien" };
    assert.deepEqual(parse(serializeFilters(f)), f, q);
  }
});

test("toggleFilter selects a value from an empty group", () => {
  assert.equal(toggleFilter(EMPTY_FILTERS, "status", "Alive").status, "Alive");
});

test("toggleFilter clears the group when the active value is pressed again", () => {
  const on = toggleFilter(EMPTY_FILTERS, "status", "Alive");
  assert.equal(toggleFilter(on, "status", "Alive").status, null);
});

test("toggleFilter replaces the value within a group", () => {
  const on = toggleFilter(EMPTY_FILTERS, "status", "Alive");
  assert.equal(toggleFilter(on, "status", "Dead").status, "Dead");
});

test("toggleFilter leaves the other groups and q alone", () => {
  const f: Filters = { q: "rick", status: null, gender: "Male", species: null };
  const next = toggleFilter(f, "status", "Alive");
  assert.deepEqual(next, { ...f, status: "Alive" });
});

test("toggleFilter ignores a value outside the allow-list", () => {
  const f = toggleFilter(EMPTY_FILTERS, "status", "Alive");
  assert.deepEqual(toggleFilter(f, "status", "alive"), f);
  assert.deepEqual(toggleFilter(EMPTY_FILTERS, "species", "Cronenberg"), EMPTY_FILTERS);
});

test("toListParams maps q to name and copies only set chips", () => {
  const params = toListParams({
    q: "rick",
    status: "Alive",
    gender: null,
    species: "Human",
  });
  assert.deepEqual(params, { name: "rick", status: "Alive", species: "Human" });
  assert.deepEqual(Object.keys(params), ["name", "status", "species"]);
  assert.deepEqual(toListParams(EMPTY_FILTERS), {});
});

test("hasActiveFilters is true for a search or any chip", () => {
  assert.equal(hasActiveFilters(EMPTY_FILTERS), false);
  assert.equal(hasActiveFilters({ ...EMPTY_FILTERS, q: "rick" }), true);
  assert.equal(hasActiveFilters({ ...EMPTY_FILTERS, gender: "Female" }), true);
});

test("labelFor shows unknown with a capital and leaves other values alone", () => {
  assert.equal(labelFor("unknown"), "Unknown");
  assert.equal(labelFor("Alive"), "Alive");
});

test("filtersKey equals serializeFilters", () => {
  const f: Filters = { q: "a b", status: "Alive", gender: null, species: "Robot" };
  assert.equal(filtersKey(f), serializeFilters(f));
});
