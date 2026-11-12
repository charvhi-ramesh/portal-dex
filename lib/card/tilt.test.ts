import assert from "node:assert/strict";
import { test } from "node:test";
import { MAX_TILT_DEG, TILT_PERSPECTIVE_PX, tiltFromPointer } from "./tilt.ts";
import type { TiltValues } from "./tilt.ts";

const UNIT = { left: 0, top: 0, width: 100, height: 100 };
const NEUTRAL: TiltValues = { rotateX: 0, rotateY: 0, sheenX: 50, sheenY: 50 };

test("exports the spec constants", () => {
  assert.strictEqual(MAX_TILT_DEG, 12);
  assert.strictEqual(TILT_PERSPECTIVE_PX, 800);
});

test("the centre of the card is flat with the sheen centred", () => {
  assert.deepStrictEqual(tiltFromPointer({ x: 50, y: 50 }, UNIT), NEUTRAL);
});

test("the middle of the right edge turns the face right (rotateY 12)", () => {
  const values = tiltFromPointer({ x: 100, y: 50 }, UNIT);
  assert.strictEqual(values.rotateY, 12);
  assert.strictEqual(values.rotateX, 0);
  assert.strictEqual(values.sheenX, 100);
  assert.strictEqual(values.sheenY, 50);
});

test("the middle of the left edge gives rotateY -12", () => {
  const values = tiltFromPointer({ x: 0, y: 50 }, UNIT);
  assert.strictEqual(values.rotateY, -12);
  assert.strictEqual(values.rotateX, 0);
});

test("the top-left corner gives rotateX 12, rotateY -12 and the sheen at 0, 0", () => {
  assert.deepStrictEqual(tiltFromPointer({ x: 0, y: 0 }, UNIT), {
    rotateX: 12,
    rotateY: -12,
    sheenX: 0,
    sheenY: 0,
  });
});

test("the bottom-right corner gives rotateX -12 and rotateY 12", () => {
  assert.deepStrictEqual(tiltFromPointer({ x: 100, y: 100 }, UNIT), {
    rotateX: -12,
    rotateY: 12,
    sheenX: 100,
    sheenY: 100,
  });
});

test("points outside the card clamp to the limits", () => {
  assert.deepStrictEqual(tiltFromPointer({ x: 400, y: -300 }, UNIT), {
    rotateX: 12,
    rotateY: 12,
    sheenX: 100,
    sheenY: 0,
  });
});

test("a rect that is not at the origin is measured relative to its own corner", () => {
  const rect = { left: 200, top: 100, width: 100, height: 100 };
  assert.deepStrictEqual(tiltFromPointer({ x: 250, y: 150 }, rect), NEUTRAL);
  assert.strictEqual(tiltFromPointer({ x: 300, y: 150 }, rect).rotateY, 12);
});

test("a rect with no width gives the neutral values", () => {
  assert.deepStrictEqual(
    tiltFromPointer({ x: 10, y: 10 }, { left: 0, top: 0, width: 0, height: 100 }),
    NEUTRAL,
  );
});

test("a rect with no height gives the neutral values", () => {
  assert.deepStrictEqual(
    tiltFromPointer({ x: 10, y: 10 }, { left: 0, top: 0, width: 100, height: 0 }),
    NEUTRAL,
  );
});

test("a custom max of 6 halves the edge values", () => {
  const values = tiltFromPointer({ x: 100, y: 0 }, UNIT, 6);
  assert.strictEqual(values.rotateY, 6);
  assert.strictEqual(values.rotateX, 6);
});

test("no result is -0 or NaN, even on axes that sit exactly at the centre", () => {
  const rects = [UNIT, { left: 0, top: 0, width: 0, height: 0 }, { left: 5, top: 5, width: 3, height: 7 }];
  const points = [
    { x: 50, y: 50 },
    { x: 0, y: 50 },
    { x: 50, y: 0 },
    { x: 100, y: 50 },
    { x: 50, y: 100 },
    { x: 6.5, y: 8.5 },
  ];
  for (const rect of rects) {
    for (const point of points) {
      const values = tiltFromPointer(point, rect);
      for (const value of Object.values(values)) {
        assert.ok(!Number.isNaN(value), `NaN for ${JSON.stringify({ point, rect })}`);
        assert.ok(!Object.is(value, -0), `-0 for ${JSON.stringify({ point, rect })}`);
      }
    }
  }
});
