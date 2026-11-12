// Pointer-to-tilt maths for the card tilt (CARD-05). React-free so it can be unit tested.

export const MAX_TILT_DEG = 12;
export const TILT_PERSPECTIVE_PX = 800;

/** Rotation in degrees, sheen position in percent of the card. */
export type TiltValues = { rotateX: number; rotateY: number; sheenX: number; sheenY: number };

export type TiltRect = { left: number; top: number; width: number; height: number };

export function tiltFromPointer(
  point: { x: number; y: number },
  rect: TiltRect,
  max: number = MAX_TILT_DEG,
): TiltValues {
  void point;
  void rect;
  void max;
  return { rotateX: -1, rotateY: -1, sheenX: -1, sheenY: -1 };
}
