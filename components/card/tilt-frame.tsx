"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useMediaQuery } from "@/components/layout/use-media-query";
import { TILT_PERSPECTIVE_PX, tiltFromPointer } from "@/lib/card/tilt";

// stiffness 300 and damping 30 settle in roughly 150 to 200 ms (SPEC section 6).
const SPRING = { stiffness: 300, damping: 30 } as const;

// The sheen spot is twice the card size, so moving it by (sheen - 50) / 2 percent of its own
// size puts its centre under the pointer (sheen is 0 to 100 percent of the card).
function sheenOffset(sheen: number): string {
  return `${(sheen - 50) / 2}%`;
}

// Desktop-pointer 3D tilt with a holographic sheen (CARD-05). Pointer moves only write Motion
// values, so React never re-renders per move and only `transform` and `opacity` change.
// Nothing runs, and no sheen is rendered, for touch, pen, coarse pointers or reduced motion
// (SPEC sections 7 and 8). The frame fills its parent so it never changes the card height or
// the grid layout.
export function TiltFrame({ children }: { children: ReactNode }) {
  // Both server snapshots keep tilt off until hydration.
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)", false);
  const enabled = fine && !reduced;

  // Measured once per pointer enter, so there is no layout read per move. The untransformed
  // outer box is measured (and listens), so a card that is mid-tilt never changes its own hit area.
  const rectRef = useRef<DOMRect | null>(null);

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const rotateX = useSpring(targetX, SPRING);
  const rotateY = useSpring(targetY, SPRING);

  const sheenX = useMotionValue(50);
  const sheenY = useMotionValue(50);
  const sheenTarget = useMotionValue(0);
  const sheenOpacity = useSpring(sheenTarget, SPRING);
  const spotX = useTransform(sheenX, sheenOffset);
  const spotY = useTransform(sheenY, sheenOffset);

  // Turning the tilt off (reduced motion switched on, or the pointer type changed) snaps flat
  // and hides the sheen.
  useEffect(() => {
    if (enabled) return;
    rectRef.current = null;
    targetX.set(0);
    targetY.set(0);
    rotateX.jump(0);
    rotateY.jump(0);
    sheenTarget.set(0);
    sheenOpacity.jump(0);
  }, [enabled, targetX, targetY, rotateX, rotateY, sheenTarget, sheenOpacity]);

  function handles(event: PointerEvent<HTMLDivElement>): boolean {
    return enabled && event.pointerType === "mouse";
  }

  function track(event: PointerEvent<HTMLDivElement>, rect: DOMRect) {
    const tilt = tiltFromPointer({ x: event.clientX, y: event.clientY }, rect);
    targetX.set(tilt.rotateX);
    targetY.set(tilt.rotateY);
    sheenX.set(tilt.sheenX);
    sheenY.set(tilt.sheenY);
  }

  function onPointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (!handles(event)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    rectRef.current = rect;
    track(event, rect);
    sheenTarget.set(1);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!handles(event)) return;
    // A move without a preceding enter (the pointer was already over the card on mount).
    const rect = rectRef.current ?? event.currentTarget.getBoundingClientRect();
    rectRef.current = rect;
    track(event, rect);
    sheenTarget.set(1);
  }

  function onPointerLeave() {
    rectRef.current = null;
    targetX.set(0);
    targetY.set(0);
    sheenTarget.set(0);
  }

  return (
    <div
      className="h-full"
      style={{ perspective: `${TILT_PERSPECTIVE_PX}px` }}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <motion.div className="relative h-full" style={{ rotateX, rotateY }}>
        {children}
        {enabled ? (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[20px]"
            style={{ opacity: sheenOpacity }}
          >
            <motion.div
              className="absolute top-[-50%] left-[-50%] size-[200%] mix-blend-soft-light bg-[radial-gradient(circle_at_center,rgb(255_255_255/0.28),rgb(166_107_255/0.12)_25%,transparent_45%)]"
              style={{ x: spotX, y: spotY }}
            />
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
}
