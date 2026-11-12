"use client";

import Link from "next/link";
import { useState } from "react";
import { CardAvatar } from "@/components/card/card-avatar";
import { CardBack } from "@/components/card/card-back";
import { FavouriteStar } from "@/components/card/favourite-star";
import type { Character } from "@/lib/api/types";
import { labelFor } from "@/lib/browse/filters";
import { cardLabel, displayName } from "@/lib/card/card-text";

function statusKey(status: Character["status"]): "alive" | "dead" | "unknown" {
  if (status === "Alive") return "alive";
  if (status === "Dead") return "dead";
  return "unknown";
}

// Final card markup (D-01 order). The flip button is a sibling of the star slot and the link
// slot, never their ancestor, and the hidden face and its slot are inert. Frame, clipping and
// the flip live on the faces (see app/globals.css), so the article only carries state. API
// text is rendered as React children, never as HTML.
export function CharacterCard({
  character,
  eager,
}: {
  character: Character;
  eager: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const key = statusKey(character.status);
  const species = character.species.trim() || "Unknown species";

  return (
    <article
      tabIndex={-1}
      data-status={key}
      data-flipped={flipped ? "true" : "false"}
      className="card group relative h-full"
    >
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={cardLabel(character)}
        onClick={() => setFlipped((value) => !value)}
        className="card-flip"
      />
      <div inert={flipped} className="card-face card-front">
        <CardAvatar src={character.image} name={character.name} eager={eager} />
        <div className="flex flex-col gap-2 p-2 sm:p-4">
          <h2
            title={character.name}
            className="line-clamp-2 min-h-[2.4em] text-base leading-[1.2] font-bold text-text"
          >
            {character.name}
          </h2>
          <span className="inline-flex w-fit items-center rounded-full px-2 py-1 text-sm leading-[1.2] font-bold text-bg group-data-[status=alive]:bg-teal group-data-[status=dead]:bg-grey group-data-[status=unknown]:bg-purple">
            {labelFor(character.status)}
          </span>
          <p title={species} className="truncate text-sm text-text-muted">
            {species}
          </p>
        </div>
      </div>
      <div data-slot="star" inert={flipped} className="card-slot card-front">
        <FavouriteStar id={character.id} name={character.name} />
      </div>
      <div data-slot="link" inert={!flipped} className="card-slot card-back">
        <Link
          href={`/character/${character.id}`}
          prefetch={false}
          aria-label={`View details for ${displayName(character.name)}`}
          className="pointer-events-auto absolute inset-x-2 bottom-2 inline-flex min-h-11 items-center justify-center gap-1 rounded-full bg-blue px-4 text-sm font-bold text-bg transition-transform duration-150 hover:bg-blue-hover active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 sm:inset-x-4 sm:bottom-4"
        >
          View details <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div inert={!flipped} className="card-face card-back p-2 pb-16 sm:p-4 sm:pb-16">
        <CardBack character={character} />
      </div>
    </article>
  );
}
