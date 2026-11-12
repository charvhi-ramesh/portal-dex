"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ErrorPanel } from "@/components/browse/error-panel";
import { useOnlineStatus } from "@/components/browse/use-online-status";
import { SkeletonGrid } from "@/components/card/card-skeleton";
import { CharacterCard } from "@/components/card/character-card";
import { TiltFrame } from "@/components/card/tilt-frame";
import { useFavouriteIds } from "@/components/favourites/use-favourites";
import { orderByFavourites } from "@/lib/collection/collection";
import { collectionOptions } from "@/lib/query/collection";

// True once the browser has hydrated this view, false on the server and during hydration.
// Favourites are read from localStorage only after mount (COL-01), so until this flips the
// page shows skeletons: the empty state must never flash for a user who has favourites.
function subscribeNever(): () => void {
  return () => {};
}

function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

const PRESS =
  "transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";
const BUTTON = `inline-flex min-h-12 items-center rounded-full px-6 font-bold ${PRESS}`;

// COL-06: shown when there are no favourites (or none the API still knows). The Browse
// link comes first in DOM and Tab order. Never writes favourites.
function CollectionEmpty() {
  return (
    <div className="mx-auto mt-8 flex w-full max-w-[480px] flex-col items-center gap-4 rounded-panel border border-border-ui bg-surface px-6 py-12 text-center">
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="size-16 text-text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M32 8l7.4 15 16.6 2.4-12 11.7 2.8 16.5L32 45.8 17.2 53.6 20 37.1 8 25.4 24.6 23z" />
      </svg>
      <h2 className="text-2xl leading-[1.2] font-bold text-text">
        No cards collected yet
      </h2>
      <p className="text-base text-text">
        Star any card to keep it here. Find characters in Browse, or pull a random
        one from the portal.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/browse"
          className={`${BUTTON} bg-blue text-bg hover:bg-blue-hover`}
        >
          Browse characters
        </Link>
        <Link
          href="/"
          className={`${BUTTON} border border-border-ui bg-surface text-text hover:bg-surface-raised`}
        >
          Open the portal
        </Link>
      </div>
    </div>
  );
}

// COL-04: every favourite as a full card, from one multi-ID request, in favourited order.
export function CollectionView() {
  const hydrated = useHydrated();
  const ids = useFavouriteIds();
  const query = useQuery({
    ...collectionOptions(ids),
    enabled: hydrated && ids.length > 0,
    placeholderData: keepPreviousData,
  });
  const characters = orderByFavourites(ids, query.data ?? []);

  // A data-less failure shows the error panel. TanStack resets such a query to "pending"
  // while it refetches, which would unmount the focused Retry button, so `retrying` keeps
  // the panel mounted until the refetch settles. It is set in the click handler and
  // cleared in the promise callback, never in an effect.
  const online = useOnlineStatus();
  const [retrying, setRetrying] = useState(false);
  const noData = query.data === undefined;
  const showError = noData && (query.isError || retrying);
  function retry() {
    if (query.isFetching) return;
    setRetrying(true);
    void query.refetch().then(() => setRetrying(false));
  }

  // Placeholder data of an older ID list may hold none of the current favourites: that is
  // still loading, not empty.
  const loading =
    noData ||
    (query.isPlaceholderData && characters.length === 0 && ids.length > 0);

  if (!hydrated) {
    return (
      <div aria-busy="true" className="mt-8">
        <SkeletonGrid variant="grid" />
      </div>
    );
  }
  if (ids.length === 0) return <CollectionEmpty />;
  if (showError) {
    return (
      <div className="mt-8 py-8">
        <ErrorPanel offline={!online} retrying={query.isFetching} onRetry={retry} />
      </div>
    );
  }
  if (loading) {
    return (
      <div aria-busy="true" className="mt-8">
        <SkeletonGrid variant="grid" />
      </div>
    );
  }
  if (characters.length === 0) return <CollectionEmpty />;

  return (
    <ul className="mt-8 grid list-none grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
      {characters.map((character, index) => (
        <li key={character.id} data-character-id={character.id}>
          <TiltFrame>
            <CharacterCard character={character} eager={index < 5} />
          </TiltFrame>
        </li>
      ))}
    </ul>
  );
}
