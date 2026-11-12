import assert from "node:assert/strict";
import { test } from "node:test";
import type { Character } from "../api/types.ts";
import { deriveTotal, exactSpecies } from "./species.ts";

// Synthetic fixtures. The 434/68/366 and 80/7/73 counts are the identities
// recorded against the live API during research (RESEARCH Pattern 4); app code
// never hardcodes them.
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

const mixed = [
  character(1, "Human"),
  character(2, "Humanoid"),
  character(3, "Human"),
  character(4, "Alien"),
  character(5, "human"),
];

test("exactSpecies keeps only exact Human and drops Humanoid", () => {
  const out = exactSpecies(mixed, "Human");
  assert.deepEqual(
    out.map((c) => c.id),
    [1, 3],
  );
  assert.ok(out.every((c) => c.species === "Human"));
});

test("exactSpecies is case-sensitive", () => {
  assert.equal(exactSpecies(mixed, "Human").some((c) => c.id === 5), false);
});

test("exactSpecies keeps Humanoid for the Humanoid chip", () => {
  assert.deepEqual(
    exactSpecies(mixed, "Humanoid").map((c) => c.id),
    [2],
  );
});

test("exactSpecies with no species returns the results unchanged", () => {
  const out = exactSpecies(mixed, null);
  assert.equal(out.length, mixed.length);
  assert.deepEqual(out, [...mixed]);
});

test("deriveTotal for Human subtracts the humanoid count (434 - 68 = 366)", () => {
  assert.equal(
    deriveTotal({ species: "Human", firstCount: 434, humanoidCount: 68 }),
    366,
  );
});

test("deriveTotal for Human with a second filter (80 - 7 = 73)", () => {
  assert.equal(
    deriveTotal({ species: "Human", firstCount: 80, humanoidCount: 7 }),
    73,
  );
});

test("deriveTotal for Human stays null until the humanoid count is known", () => {
  assert.equal(
    deriveTotal({ species: "Human", firstCount: 434, humanoidCount: null }),
    null,
  );
});

test("deriveTotal is 0 when firstCount is 0 for any species", () => {
  assert.equal(
    deriveTotal({ species: "Human", firstCount: 0, humanoidCount: null }),
    0,
  );
  assert.equal(
    deriveTotal({ species: "Human", firstCount: 0, humanoidCount: 5 }),
    0,
  );
  assert.equal(
    deriveTotal({ species: "Alien", firstCount: 0, humanoidCount: null }),
    0,
  );
  assert.equal(
    deriveTotal({ species: null, firstCount: 0, humanoidCount: null }),
    0,
  );
});

test("deriveTotal for other species and no species uses firstCount", () => {
  assert.equal(
    deriveTotal({ species: "Alien", firstCount: 120, humanoidCount: null }),
    120,
  );
  assert.equal(
    deriveTotal({ species: "Robot", firstCount: 9, humanoidCount: 3 }),
    9,
  );
  assert.equal(
    deriveTotal({ species: null, firstCount: 826, humanoidCount: null }),
    826,
  );
});

test("deriveTotal is never negative", () => {
  assert.equal(
    deriveTotal({ species: "Human", firstCount: 5, humanoidCount: 9 }),
    0,
  );
});
