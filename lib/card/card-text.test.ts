import assert from "node:assert/strict";
import { test } from "node:test";
import type { Character } from "../api/types.ts";
import {
  backFacts,
  cardLabel,
  displayName,
  episodeCountText,
} from "./card-text.ts";

type Facts = Pick<
  Character,
  "species" | "type" | "gender" | "origin" | "location" | "episode"
>;

function facts(overrides: Partial<Facts> = {}): Facts {
  return {
    species: "Human",
    type: "",
    gender: "Male",
    origin: { name: "Earth (C-137)", url: "https://rickandmortyapi.com/api/location/1" },
    location: { name: "Citadel of Ricks", url: "https://rickandmortyapi.com/api/location/3" },
    episode: ["e1", "e2", "e3"],
    ...overrides,
  };
}

function labelsOf(c: Facts): string[] {
  return backFacts(c).map((fact) => fact.label);
}

function valueOf(c: Facts, label: string): string | undefined {
  return backFacts(c).find((fact) => fact.label === label)?.value;
}

test("displayName trims the API name", () => {
  assert.equal(displayName("  Rick Sanchez "), "Rick Sanchez");
});

test("displayName falls back for an empty or whitespace name", () => {
  assert.equal(displayName(""), "Unknown character");
  assert.equal(displayName("   "), "Unknown character");
});

test("cardLabel names the character, status, species and the flip hint", () => {
  assert.equal(
    cardLabel({ name: "Rick Sanchez", status: "Alive", species: "Human" }),
    "Rick Sanchez, Alive, Human card, press to flip",
  );
});

test("cardLabel reads Unknown for status unknown", () => {
  assert.equal(
    cardLabel({ name: "Summer", status: "unknown", species: "Human" }),
    "Summer, Unknown, Human card, press to flip",
  );
});

test("cardLabel reads Unknown species for an empty or whitespace species", () => {
  assert.equal(
    cardLabel({ name: "Blob", status: "Dead", species: "" }),
    "Blob, Dead, Unknown species card, press to flip",
  );
  assert.equal(
    cardLabel({ name: "Blob", status: "Dead", species: "  " }),
    "Blob, Dead, Unknown species card, press to flip",
  );
});

test("cardLabel reads Unknown character for an empty or whitespace name", () => {
  assert.equal(
    cardLabel({ name: "", status: "Alive", species: "Human" }),
    "Unknown character, Alive, Human card, press to flip",
  );
  assert.equal(
    cardLabel({ name: "   ", status: "Alive", species: "Human" }),
    "Unknown character, Alive, Human card, press to flip",
  );
});

test("cardLabel uses the full trimmed name, with accents unchanged", () => {
  assert.ok(
    cardLabel({ name: "  Rick Sanchez ", status: "Alive", species: "Human" }).startsWith(
      "Rick Sanchez, ",
    ),
  );
  assert.equal(
    cardLabel({ name: "Señor Rick", status: "Alive", species: "Human" }),
    "Señor Rick, Alive, Human card, press to flip",
  );
});

test("cardLabel does not truncate a 70-character name", () => {
  const name = "R".repeat(70);
  assert.equal(
    cardLabel({ name, status: "Alive", species: "Human" }),
    `${name}, Alive, Human card, press to flip`,
  );
});

test("cardLabel orders name, status, species, then the fixed suffix", () => {
  const label = cardLabel({ name: "N", status: "Dead", species: "S" });
  assert.equal(label, "N, Dead, S card, press to flip");
});

test("episodeCountText pluralises exactly one as singular", () => {
  assert.equal(episodeCountText(0), "0 episodes");
  assert.equal(episodeCountText(1), "1 episode");
  assert.equal(episodeCountText(2), "2 episodes");
  assert.equal(episodeCountText(51), "51 episodes");
});

test("episodeCountText formats thousands with a separator and never caps", () => {
  assert.equal(episodeCountText(1000), "1,000 episodes");
});

test("backFacts omits Type for an empty or whitespace type", () => {
  const expected = ["Species", "Gender", "Origin", "Last location", "Appears in"];
  assert.deepEqual(labelsOf(facts({ type: "" })), expected);
  assert.deepEqual(labelsOf(facts({ type: "   " })), expected);
});

test("backFacts includes Type after Species when present", () => {
  const c = facts({ type: "Parasite" });
  assert.deepEqual(labelsOf(c), [
    "Species",
    "Type",
    "Gender",
    "Origin",
    "Last location",
    "Appears in",
  ]);
  assert.equal(valueOf(c, "Type"), "Parasite");
});

test("backFacts maps unknown gender and origin to Unknown", () => {
  const c = facts({
    gender: "unknown",
    origin: { name: "unknown", url: "" },
  });
  assert.equal(valueOf(c, "Gender"), "Unknown");
  assert.equal(valueOf(c, "Origin"), "Unknown");
});

test("backFacts maps empty or whitespace species, origin and location to Unknown", () => {
  const c = facts({
    species: "  ",
    origin: { name: "", url: "" },
    location: { name: "   ", url: "" },
  });
  assert.equal(valueOf(c, "Species"), "Unknown");
  assert.equal(valueOf(c, "Origin"), "Unknown");
  assert.equal(valueOf(c, "Last location"), "Unknown");
});

test("backFacts passes real values through as plain text", () => {
  const c = facts();
  assert.equal(valueOf(c, "Species"), "Human");
  assert.equal(valueOf(c, "Gender"), "Male");
  assert.equal(valueOf(c, "Origin"), "Earth (C-137)");
  assert.equal(valueOf(c, "Last location"), "Citadel of Ricks");
});

test("backFacts Appears in equals the episode count text", () => {
  assert.equal(valueOf(facts({ episode: ["a"] }), "Appears in"), "1 episode");
  assert.equal(valueOf(facts({ episode: [] }), "Appears in"), "0 episodes");
  assert.equal(
    valueOf(facts({ episode: Array.from({ length: 1000 }, () => "e") }), "Appears in"),
    "1,000 episodes",
  );
});
