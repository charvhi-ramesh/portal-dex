import assert from "node:assert/strict";
import { test } from "node:test";
import {
  EMPTY_HEADING,
  countAnnouncement,
  countText,
  formatCount,
  moreLoadedAnnouncement,
} from "./announce.ts";

test("EMPTY_HEADING is the empty-state copy", () => {
  assert.equal(EMPTY_HEADING, "No characters in this dimension");
});

test("formatCount uses en thousands separators", () => {
  assert.equal(formatCount(826), "826");
  assert.equal(formatCount(1234), "1,234");
  assert.equal(formatCount(1500000), "1,500,000");
});

test("countText reads zero, one and many", () => {
  assert.equal(countText(0), "0 characters");
  assert.equal(countText(1), "1 character");
  assert.equal(countText(826), "826 characters");
  assert.equal(countText(1234), "1,234 characters");
});

test("countAnnouncement for zero is the empty heading, never '0 characters'", () => {
  assert.equal(countAnnouncement(0), "No characters in this dimension");
  assert.notEqual(countAnnouncement(0), "0 characters");
});

test("countAnnouncement for one and many matches the visible count", () => {
  assert.equal(countAnnouncement(1), "1 character");
  assert.equal(countAnnouncement(366), "366 characters");
});

test("moreLoadedAnnouncement is empty when nothing was added", () => {
  assert.equal(moreLoadedAnnouncement(0), "");
});

test("moreLoadedAnnouncement uses the number actually added", () => {
  assert.equal(moreLoadedAnnouncement(1), "1 more character loaded");
  assert.equal(moreLoadedAnnouncement(20), "20 more characters loaded");
  assert.equal(moreLoadedAnnouncement(18), "18 more characters loaded");
});

test("moreLoadedAnnouncement formats large numbers with separators", () => {
  assert.equal(moreLoadedAnnouncement(1500), "1,500 more characters loaded");
});
