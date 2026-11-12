"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { isAvatarUrl } from "@/lib/api/avatar";

export const AVATAR_SIZES =
  "(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

type LoadStatus = "loading" | "loaded" | "error";

// First Unicode code point of the trimmed name, so accented or astral characters are never split.
function initialOf(name: string): string {
  const first = Array.from(name.trim())[0];
  return first ? first.toUpperCase() : "?";
}

export function CardAvatar({
  src,
  name,
  eager,
  sizes = AVATAR_SIZES,
  rounded = "top",
}: {
  src: string;
  name: string;
  eager: boolean;
  sizes?: string;
  rounded?: "top" | "all";
}) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  // Literal class strings so Tailwind sees them. "top" is the card; "all" is the detail hero.
  const radius = rounded === "all" ? "rounded-[18px]" : "rounded-t-[18px]";

  // Pitfall 7: an image that finished loading before hydration (or on an Activity re-show)
  // never fires onLoad, so detect it from the element itself.
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth > 0) {
      setStatus("loaded");
    }
  }, []);

  if (!isAvatarUrl(src) || status === "error") {
    return (
      <div
        role="img"
        aria-label={name}
        className={`flex aspect-square items-center justify-center overflow-hidden ${radius} bg-surface-raised text-2xl leading-[1.2] font-bold text-text-muted`}
      >
        {initialOf(name)}
      </div>
    );
  }

  return (
    <div className={`relative aspect-square overflow-hidden ${radius} bg-surface-raised`}>
      <Image
        ref={imgRef}
        src={src}
        alt={name}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={`object-cover transition-opacity duration-200 ease-out ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
