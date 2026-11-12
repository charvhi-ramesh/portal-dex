"use client";

import { motion, useIsPresent } from "motion/react";
import { CharacterCard } from "@/components/card/character-card";
import { TiltFrame } from "@/components/card/tilt-frame";
import type { Character } from "@/lib/api/types";

// One Collection grid item (COL-05). While AnimatePresence plays its exit it is `inert`, so
// the star and the flip button of a leaving card can neither be pressed again nor keep
// focus. Only opacity and scale (transform) animate; reduced motion fades only.
const EXIT_REDUCED = { opacity: 0, transition: { duration: 0.15 } } as const;
const EXIT_FULL = {
  opacity: 0,
  scale: 0.9,
  transition: { duration: 0.2, ease: "easeOut" },
} as const;

export function CollectionItem({
  character,
  eager,
  reduced,
}: {
  character: Character;
  eager: boolean;
  reduced: boolean;
}) {
  const isPresent = useIsPresent();

  return (
    <motion.li
      data-character-id={character.id}
      inert={!isPresent}
      exit={reduced ? EXIT_REDUCED : EXIT_FULL}
    >
      <TiltFrame>
        <CharacterCard character={character} eager={eager} />
      </TiltFrame>
    </motion.li>
  );
}
