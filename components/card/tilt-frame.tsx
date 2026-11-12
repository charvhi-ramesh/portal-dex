"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useMediaQuery } from "@/components/layout/use-media-query";
import { TILT_PERSPECTIVE_PX, tiltFromPointer } from "@/lib/card/tilt";

// stiffness 300 and damping 30 settle in roughly 150 to 200 ms (SPEC section 6).
const SPRING = { stiffness: 300, damping: 30 } as const;

// Desktop-pointer 3D tilt (CARD-05). Pointer moves only write Motion values, so React never
// re-renders per move and only `transform` changes. Nothing runs for touch, pen, coarse
// pointers or reduced motion (SPEC sections 7 and 8). The frame fills its parent so it never
// changes the card height or the grid layout.
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

  // Turning the tilt off (reduced motion switched on, or the pointer type changed) snaps flat.
  useEffect(() => {
    if (enabled) return;
    rectRef.current = null;
    targetX.set(0);
    targetY.set(0);
    rotateX.jump(0);
    rotateY.jump(0);
  }, [enabled, targetX, targetY, rotateX, rotateY]);

  function handles(event: PointerEvent<HTMLDivElement>): boolean {
    return enabled && event.pointerType === "mouse";
  }

  function onPointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (!handles(event)) return;
    rectRef.current = event.currentTarget.getBoundingClientRect();
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!handles(event)) return;
    // A move without a preceding enter (the pointer was already over the card on mount).
    const rect = rectRef.current ?? event.currentTarget.getBoundingClientRect();
    rectRef.current = rect;
    const tilt = tiltFromPointer({ x: event.clientX, y: event.clientY }, rect);
    targetX.set(tilt.rotateX);
    targetY.set(tilt.rotateY);
  }

  function onPointerLeave() {
    rectRef.current = null;
    targetX.set(0);
    targetY.set(0);
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
      </motion.div>
    </div>
  );
}
