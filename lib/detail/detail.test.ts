import { test } from "node:test";
import assert from "node:assert/strict";

import {
  NOT_FOUND_HEADING,
  NOT_FOUND_TITLE,
  SITE_NAME,
  detailTitle,
  pageTitle,
  routeCharacterId,
} from "./detail.ts";

// ------------------------------------------------------------ routeCharacterId

test("routeCharacterId accepts canonical positive integer strings", () => {
  assert.equal(routeCharacterId("1"), 1);
  assert.equal(routeCharacterId("826"), 826);
  assert.equal(routeCharacterId("99999"), 99999);
});

test("routeCharacterId rejects every non-canonical route segment", () => {
  const bad: (string | undefined)[] = [
    undefined,
    "",
    "abc",
    "0",
    "00",
    "01",
    "-1",
    "1.5",
    "1e3",
    "+1",
    " 1",
    "1 ",
    "１", // full-width digit one
    "9007199254740993", // above the safe-integer range
  ];
  for (const input of bad) {
    assert.equal(
      routeCharacterId(input),
      null,
      `routeCharacterId(${JSON.stringify(input)}) must be null`,
    );
  }
});

// ------------------------------------------------------------ titles

test("SITE_NAME is the original wordmark", () => {
  assert.equal(SITE_NAME, "Portal Dex");
});

test("pageTitle joins the text and the site name with a middle dot", () => {
  assert.equal(pageTitle("Browse"), "Browse · Portal Dex");
});

test("detailTitle uses the character name", () => {
  assert.equal(detailTitle("Rick Sanchez"), "Rick Sanchez · Portal Dex");
});

test("detailTitle keeps the full trimmed name with its original characters", () => {
  assert.equal(detailTitle("  Señor Rick "), "Señor Rick · Portal Dex");
});

test("detailTitle falls back to Unknown character for empty and blank names", () => {
  assert.equal(detailTitle(""), "Unknown character · Portal Dex");
  assert.equal(detailTitle("   "), "Unknown character · Portal Dex");
});

test("the 404 heading and title are fixed", () => {
  assert.equal(NOT_FOUND_HEADING, "Page not found");
  assert.equal(NOT_FOUND_TITLE, "Page not found · Portal Dex");
});
