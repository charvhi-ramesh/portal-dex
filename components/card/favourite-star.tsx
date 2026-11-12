"use client";

import { toggleFavouriteId, useIsFavourite } from "@/components/favourites/use-favourites";
import { favouriteLabel } from "@/lib/favourites/store";

// CARD-06: a 44 x 44 toggle at the top-right of the avatar. The accessible name stays
// constant and aria-pressed carries the state (a swapped label plus pressed state would be
// announced as a contradiction). It sits in the card's star slot, a sibling of the flip
// button, so pressing it never flips the card. The navy backing and shadow keep the glyph
// and the global focus ring readable over any photo.
const CARD_CLASS =
  "pointer-events-auto absolute top-2 right-2 inline-flex size-11 items-center justify-center rounded-full bg-bg text-text transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:shadow-[0_0_0_2px_var(--color-bg)]";
// DET-01: the detail hero star is 48 x 48 and sits in the page flow beside the h1.
const HERO_CLASS =
  "relative inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-border-ui bg-surface text-text hover:bg-surface-raised transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

export function FavouriteStar({
  id,
  name,
  variant = "card",
}: {
  id: number;
  name: string;
  variant?: "card" | "hero";
}) {
  const pressed = useIsFavourite(id);

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={favouriteLabel(name)}
      onClick={() => toggleFavouriteId(id)}
      className={variant === "hero" ? HERO_CLASS : CARD_CLASS}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        className={pressed ? "fill-current stroke-current text-pink" : "fill-none stroke-current"}
      >
        <path d="M12 2.5l2.94 6.1 6.56.9-4.8 4.62 1.2 6.62L12 17.58 6.1 20.74l1.2-6.62L2.5 9.5l6.56-.9L12 2.5z" />
      </svg>
    </button>
  );
}
