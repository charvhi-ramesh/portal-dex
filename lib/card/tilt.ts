// Pointer-to-tilt maths for the card tilt (CARD-05). React-free so it can be unit tested.

export const MAX_TILT_DEG = 12;
export const TILT_PERSPECTIVE_PX = 800;

/** Rotation in degrees, sheen position in percent of the card. */
export type TiltValues = { rotateX: number; rotateY: number; sheenX: number; sheenY: number };

export type TiltRect = { left: number; top: number; width: number; height: number };

const NEUTRAL: TiltValues = { rotateX: 0, rotateY: 0, sheenX: 50, sheenY: 50 };

function unit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * The card face turns toward the pointer: the pointer on the right edge gives a positive
 * rotateY, the pointer on the top edge gives a positive rotateX. Values clamp to +/- max for
 * points outside the rect; a rect with no size, or a non-finite point, gives the flat values.
 */
export function tiltFromPointer(
  point: { x: number; y: number },
  rect: TiltRect,
  max: number = MAX_TILT_DEG,
): TiltValues {
  if (!(rect.width > 0) || !(rect.height > 0)) return { ...NEUTRAL };
  const nx = unit((point.x - rect.left) / rect.width);
  const ny = unit((point.y - rect.top) / rect.height);
  if (Number.isNaN(nx) || Number.isNaN(ny)) return { ...NEUTRAL };
  // `+ 0` turns -0 into 0 (-0 + 0 is 0), so a centred axis never reports -0.
  return {
    rotateX: (0.5 - ny) * 2 * max + 0,
    rotateY: (nx - 0.5) * 2 * max + 0,
    sheenX: nx * 100 + 0,
    sheenY: ny * 100 + 0,
  };
}
