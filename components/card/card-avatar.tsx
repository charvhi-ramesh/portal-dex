"use client";

import Image from "next/image";

export const AVATAR_SIZES =
  "(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw";

// Task 2 adds the loading and error states, the fallback tile and eager/lazy loading.
export function CardAvatar({
  src,
  name,
}: {
  src: string;
  name: string;
  eager: boolean;
}) {
  return (
    <div className="relative aspect-square overflow-hidden bg-surface-raised">
      <Image
        src={src}
        alt={name}
        fill
        sizes={AVATAR_SIZES}
        className="object-cover"
      />
    </div>
  );
}
