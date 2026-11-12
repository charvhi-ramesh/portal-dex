"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { ErrorPanel } from "@/components/browse/error-panel";
import { LiveRegion, useAnnouncer } from "@/components/browse/live-region";
import { useOnlineStatus } from "@/components/browse/use-online-status";
import { SkeletonGrid } from "@/components/card/card-skeleton";
import { focusCard } from "@/components/card/focus-card";
import { CollectionItem } from "@/components/collection/collection-item";
import { useFavouriteIds } from "@/components/favourites/use-favourites";
import { useMediaQuery } from "@/components/layout/use-media-query";
import {
  nextFocusIndex,
  orderByFavourites,
  removalAnnouncement,
} from "@/lib/collection/collection";
import { collectionOptions } from "@/lib/query/collection";

const HEADING_ID = "collection-heading";

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

// One removal made on this page: the card's index and name, and whether keyboard focus was
// inside that card at the moment its star was pressed.
type Removal = { index: number; name: string; hadFocus: boolean };

// COL-04: every favourite as a full card, from one multi-ID request, in favourited order.
// COL-05: unstarring a card animates it out, then (only if it held focus) hands focus to the
// card that took its place, and announces the removal.
export function CollectionView() {
  const hydrated = useHydrated();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const ids = useFavouriteIds();
  const query = useQuery({
    ...collectionOptions(ids),
    enabled: hydrated && ids.length > 0,
    placeholderData: keepPreviousData,
  });
  const characters = orderByFavourites(ids, query.data ?? []);
  const { regionRef, announce } = useAnnouncer();

  // Written only in handlers and effects, never read during render.
  const gridRef = useRef<HTMLUListElement>(null);
  const removalsRef = useRef<Removal[]>([]);
  const charactersRef = useRef(characters);
  const focusAfterRetryRef = useRef(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    charactersRef.current = characters;
  });

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
    focusAfterRetryRef.current = true;
    void query.refetch().then((result) => {
      setRetrying(false);
      // A failed retry must not leave the flag set for some later, unrelated load.
      if (result.data === undefined) focusAfterRetryRef.current = false;
    });
  }

  // After a successful Retry the panel (and its focused button) is gone: focus moves to the
  // first card, or to the heading when nothing is shown. No setState here.
  useEffect(() => {
    if (!focusAfterRetryRef.current || query.data === undefined) return;
    focusAfterRetryRef.current = false;
    requestAnimationFrame(() => {
      const first = gridRef.current?.querySelector("li") ?? null;
      if (!focusCard(first)) document.getElementById(HEADING_ID)?.focus();
    });
  }, [query.data]);

  // Capture phase: runs before the star's own click handler toggles the store and before
  // the card turns `inert` (which blurs a focused element to the body), so this is the last
  // moment it is knowable whether focus was inside the card being removed. A keyboard press
  // on the star dispatches the same click event.
  function recordRemoval(event: MouseEvent<HTMLUListElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const star = target.closest('[data-slot="star"] button[aria-pressed="true"]');
    if (star === null) return;
    const item = star.closest("li[data-character-id]");
    if (!(item instanceof HTMLElement)) return;
    const id = Number(item.dataset.characterId);
    const index = characters.findIndex((character) => character.id === id);
    if (index < 0) return;
    removalsRef.current.push({
      index,
      name: characters[index].name,
      hadFocus: item.contains(document.activeElement),
    });
    setExiting(true);
  }

  // Motion calls this when every leaving card has finished its exit (a callback, not an
  // effect). The announcement covers every removal made meanwhile. Focus, and the scroll
  // that focus() causes, moves only when a removed card held focus as its star was pressed
  // and the user has not moved on since; focus resting on the body is never by itself a
  // reason to move it, so a removal made in another tab never moves focus or scrolls.
  function handleExitComplete() {
    const removals = removalsRef.current;
    removalsRef.current = [];
    setExiting(false);
    if (removals.length === 0) return;
    announce(removalAnnouncement(removals.map((removal) => removal.name)));

    const focused = removals.filter((removal) => removal.hadFocus);
    if (focused.length === 0) return;
    const removedIndex = Math.min(...focused.map((removal) => removal.index));
    requestAnimationFrame(() => {
      const active = document.activeElement;
      const lost =
        active === null ||
        active === document.body ||
        !active.isConnected ||
        active.closest("[inert]") !== null;
      if (!lost) return;
      const remaining = charactersRef.current;
      const next = nextFocusIndex(removedIndex, remaining.length);
      if (next === null) {
        document.getElementById(HEADING_ID)?.focus();
        return;
      }
      const item = gridRef.current?.querySelector(
        `li[data-character-id="${remaining[next].id}"]`,
      );
      if (!focusCard(item)) document.getElementById(HEADING_ID)?.focus();
    });
  }

  // Placeholder data of an older ID list may hold none of the current favourites: that is
  // still loading, not empty.
  const loading =
    noData ||
    (query.isPlaceholderData && characters.length === 0 && ids.length > 0);

  let body: ReactNode;
  if (!hydrated) {
    body = (
      <div aria-busy="true" className="mt-8">
        <SkeletonGrid variant="grid" />
      </div>
    );
  } else if (characters.length > 0 || exiting) {
    // Stays mounted while a card leaves, so the last card can finish its exit before the
    // empty state replaces it.
    body = (
      <ul
        ref={gridRef}
        onClickCapture={recordRemoval}
        className="mt-8 grid list-none grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5"
      >
        <AnimatePresence initial={false} onExitComplete={handleExitComplete}>
          {characters.map((character, index) => (
            <CollectionItem
              key={character.id}
              character={character}
              eager={index < 5}
              reduced={reduced}
            />
          ))}
        </AnimatePresence>
      </ul>
    );
  } else if (ids.length === 0) {
    body = <CollectionEmpty />;
  } else if (showError) {
    body = (
      <div className="mt-8 py-8">
        <ErrorPanel offline={!online} retrying={query.isFetching} onRetry={retry} />
      </div>
    );
  } else if (loading) {
    body = (
      <div aria-busy="true" className="mt-8">
        <SkeletonGrid variant="grid" />
      </div>
    );
  } else {
    body = <CollectionEmpty />;
  }

  return (
    <>
      <LiveRegion regionRef={regionRef} />
      {body}
    </>
  );
}
