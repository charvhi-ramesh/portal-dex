"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue } from "motion/react";

const CONIC =
  "bg-[conic-gradient(from_0deg,var(--color-teal),var(--color-blue),var(--color-purple),var(--color-teal))]";

// Idle turn about 8 s (HOME-01). Spin-up about 1.2 s: three turns on an ease-in curve, then a
// fast steady turn until the spin ends (HOME-02). Only the rotation (transform) and the glow
// opacity change; the angle lives in a motion value, not React state.
const IDLE_SECONDS_PER_TURN = 8;
const SPIN_UP_SECONDS = 1.2;
const SPIN_UP_DEGREES = 1080;
const SPIN_SECONDS_PER_TURN = 0.5;

type Controls = ReturnType<typeof animate>;

export function PortalDisc({ spinning, reduced }: { spinning: boolean; reduced: boolean }) {
  const rotate = useMotionValue(0);

  useEffect(() => {
    // Reduced motion: the portal never turns, idle or spinning (HOME-05). The cleanup of the
    // previous run has already stopped any animation and the angle stays where it was.
    if (reduced) return;

    let cancelled = false;
    let controls: Controls;

    if (spinning) {
      controls = animate(rotate, rotate.get() + SPIN_UP_DEGREES, {
        duration: SPIN_UP_SECONDS,
        ease: [0.55, 0, 1, 0.45],
      });
      void controls.then(() => {
        if (cancelled) return;
        controls = animate(rotate, rotate.get() + 360, {
          duration: SPIN_SECONDS_PER_TURN,
          ease: "linear",
          repeat: Infinity,
        });
      });
    } else {
      controls = animate(rotate, rotate.get() + 360, {
        duration: IDLE_SECONDS_PER_TURN,
        ease: "linear",
        repeat: Infinity,
      });
    }

    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [spinning, reduced, rotate]);

  return (
    <span aria-hidden="true" className="absolute inset-0">
      <motion.span style={{ rotate }} className="absolute inset-0 block">
        <span
          className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-300 motion-reduce:transition-none ${
            spinning ? "opacity-100" : "opacity-60"
          } ${CONIC}`}
        />
        <span className={`absolute inset-[6%] rounded-full ${CONIC}`} />
        <span className="absolute inset-[24%] rounded-full bg-bg" />
      </motion.span>
    </span>
  );
}
