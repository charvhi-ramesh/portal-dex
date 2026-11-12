"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CharacterGrid } from "@/components/browse/character-grid";
import { EmptyPanel } from "@/components/browse/empty-panel";
import { ErrorPanel } from "@/components/browse/error-panel";
import { FilterBar } from "@/components/browse/filter-bar";
import {
  LoadMore,
  NEXT_RETRY_ID,
  type LoadTrigger,
} from "@/components/browse/load-more";
import { LiveRegion, useAnnouncer } from "@/components/browse/live-region";
import { ResultsToolbar } from "@/components/browse/results-toolbar";
import { useBrowseUrl } from "@/components/browse/use-browse-url";
import { useOnlineStatus } from "@/components/browse/use-online-status";
import { SkeletonGrid } from "@/components/card/card-skeleton";
import {
  countAnnouncement,
  moreLoadedAnnouncement,
} from "@/lib/browse/announce";
import {
  EMPTY_FILTERS,
  filtersKey,
  hasActiveFilters,
  type Filters,
} from "@/lib/browse/filters";
import { deriveTotal } from "@/lib/browse/species";
import { flattenSteps } from "@/lib/browse/steps";
import { browseOptions, humanoidCountOptions } from "@/lib/query/options";

// The sticky header is 64 px tall (UI-SPEC); the toolbar is scrolled to only when its top
// has gone above it.
const HEADER_HEIGHT = 64;

// Walking-skeleton slice: one real API read and one URL write. Plans 01-08 to 01-10 grow this view.
export function BrowseView() {
  const { filters, pushFilters, replaceFilters } = useBrowseUrl();
  const queryClient = useQueryClient();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const query = useInfiniteQuery(browseOptions(filters));
  const characters = flattenSteps(query.data?.pages ?? []);
  const firstCount = query.data?.pages[0]?.count;
  // D-08: the Human chip's API count includes Humanoid, so its total needs one extra
  // count-only request, made only once page 1 has settled with at least one match.
  const isHuman = filters.species === "Human";
  const humanoid = useQuery({
    ...humanoidCountOptions(filters),
    enabled: isHuman && firstCount !== undefined && firstCount > 0,
  });
  // null means "Counting...": no data for this key yet, or the Human total is not
  // final. The raw firstCount is never shown for Human (D-08). If the count request
  // fails, the total stays null rather than showing a Humanoid-inflated number.
  const total =
    firstCount === undefined
      ? null
      : deriveTotal({
          species: filters.species,
          firstCount,
          humanoidCount: isHuman ? (humanoid.data ?? null) : null,
        });

  // BRW-07: announce the settled count once per filter set. Nothing is written while the
  // total is null ("Counting..."), so an interim or Humanoid-inflated value is never
  // heard (D-08). The last announced key lives in a ref, so a re-show of this view (Back,
  // Activity) with the same filters does not repeat the announcement. The visible count
  // line is not itself live.
  const { regionRef, announce } = useAnnouncer();
  const lastAnnouncedKey = useRef<string | null>(null);
  const currentKey = filtersKey(filters);
  const isPending = query.isPending;

  // BRW-09: a first-page failure shows the error panel. TanStack resets a data-less query
  // to "pending" while it refetches, which would unmount the focused Retry button, so
  // the key being retried keeps the panel mounted (button aria-disabled) until the retry
  // settles. A different key never inherits it.
  const online = useOnlineStatus();
  const [retryKey, setRetryKey] = useState<string | null>(null);
  const noData = query.data === undefined;
  const retrying = noData && retryKey === currentKey;
  const showError = noData && (query.isError || retrying);
  function retry() {
    if (query.isFetching) return;
    const key = currentKey;
    setRetryKey(key);
    void query.refetch().then(() => setRetryKey((k) => (k === key ? null : k)));
  }

  // BRW-08: one next load step. Guarded here as well as in LoadMore, so a double press
  // or an observer report racing a button press never starts a second request. Only a
  // button press (Load more or the inline Retry) asks for focus to follow the new cards;
  // scroll-triggered loads never move focus (planning decision 3).
  const gridRef = useRef<HTMLUListElement>(null);
  const endNoteRef = useRef<HTMLParagraphElement>(null);
  const pendingFocusIndex = useRef<number | null>(null);
  const characterCount = characters.length;
  const pageCount = query.data?.pages.length ?? 0;
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError } = query;
  function loadMore(trigger: LoadTrigger) {
    if (!hasNextPage || isFetchingNextPage) return;
    if (trigger === "button") pendingFocusIndex.current = characterCount;
    void query.fetchNextPage();
  }
  // BRW-09: existing cards are never cleared by a next-page failure; Retry fetches the
  // same next step once.
  function retryNextPage() {
    if (isFetchingNextPage) return;
    pendingFocusIndex.current = characterCount;
    void query.fetchNextPage();
  }

  // Focus hand-off once a button-started load settles. The first new card takes focus
  // (an `article` with tabindex -1, standard ring). If nothing was added and the button
  // unmounted, the end note takes it; after a failure the inline Retry does. Otherwise
  // the still-mounted Load more button keeps focus.
  useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null || isFetchingNextPage) return;
    pendingFocusIndex.current = null;
    if (isFetchNextPageError) {
      document.getElementById(NEXT_RETRY_ID)?.focus();
      return;
    }
    const card = gridRef.current?.children[index]?.querySelector("article");
    if (card instanceof HTMLElement) {
      card.focus();
    } else if (!hasNextPage) {
      endNoteRef.current?.focus();
    }
  }, [characterCount, isFetchingNextPage, hasNextPage, isFetchNextPageError]);

  // X4: announce the real number of cards a finished next step added, whatever started
  // it. A filter change, the first page and a first mount are baselines, not "more".
  const lastLoad = useRef<{ key: string; pages: number; cards: number } | null>(
    null,
  );
  useEffect(() => {
    const previous = lastLoad.current;
    lastLoad.current = {
      key: currentKey,
      pages: pageCount,
      cards: characterCount,
    };
    if (
      previous === null ||
      previous.key !== currentKey ||
      previous.pages < 1 ||
      pageCount <= previous.pages
    ) {
      return;
    }
    announce(moreLoadedAnnouncement(characterCount - previous.cards));
  }, [currentKey, pageCount, characterCount, announce]);

  useEffect(() => {
    if (total === null || isPending) return;
    if (lastAnnouncedKey.current === currentKey) return;
    lastAnnouncedKey.current = currentKey;
    announce(countAnnouncement(total));
  }, [currentKey, total, isPending, announce]);

  // Only user-initiated changes come through here; Back and Forward (popstate) bypass it,
  // so they keep every loaded page (BRW-11) and never move the scroll position.
  // BRW-06: typing replaces the history entry, chips and Clear all push one.
  function applyFilters(next: Filters, mode: "push" | "replace") {
    // BRW-10: a user change starts from the first page, so trim any cached pages for the
    // target filter set before the URL (and so the query key) changes.
    queryClient.setQueryData(
      browseOptions(next).queryKey,
      (data) =>
        data && data.pages.length > 1
          ? {
              pages: data.pages.slice(0, 1),
              pageParams: data.pageParams.slice(0, 1),
            }
          : data,
    );
    if (mode === "replace") replaceFilters(next);
    else pushFilters(next);
    // RESEARCH Pitfall 8: scroll only when the toolbar is above the sticky header, so
    // typing near the top never scrolls the search field away.
    const toolbar = toolbarRef.current;
    if (toolbar && toolbar.getBoundingClientRect().top < HEADER_HEIGHT) {
      toolbar.scrollIntoView({ block: "start", behavior: "auto" });
    }
  }

  // The Clear filters button unmounts once results return, so focus moves to the search
  // field, the start of the controls the user will refine next.
  function clearFilters() {
    applyFilters(EMPTY_FILTERS, "push");
    requestAnimationFrame(() => document.getElementById("browse-search")?.focus());
  }

  return (
    <>
      <LiveRegion regionRef={regionRef} />
      <div className="mt-12">
        <FilterBar filters={filters} onChange={applyFilters} />
      </div>
      <div className="mt-8">
        <ResultsToolbar
          ref={toolbarRef}
          count={total}
          unavailable={showError}
          showClearAll={hasActiveFilters(filters)}
          onClearAll={() => applyFilters(EMPTY_FILTERS, "push")}
        />
      </div>
      {showError ? (
        <div className="mt-4 py-8">
          <ErrorPanel
            offline={!online}
            retrying={query.isFetching}
            onRetry={retry}
          />
        </div>
      ) : query.isPending ? (
        // First visit or a filter change: card-sized skeletons until page 1 arrives. The
        // filter bar, toolbar and live region above stay mounted, so chips never remount.
        <div aria-busy="true" className="mt-4">
          <SkeletonGrid variant="grid" />
        </div>
      ) : characters.length === 0 && !query.hasNextPage ? (
        // BRW-01: zero results render no list at all. A page-1 404 is an empty step
        // (DATA-03), so it always lands here and never in the error branch above.
        <div className="mt-4 py-8">
          <EmptyPanel onClearFilters={clearFilters} />
        </div>
      ) : (
        <div className="mt-4">
          <CharacterGrid
            ref={gridRef}
            characters={characters}
            busy={isFetchingNextPage}
          />
          {isFetchingNextPage ? (
            // One row of card-sized skeletons (2 / 3 / 4 / 5 by breakpoint), gap-matched
            // to the grid so the swap to real cards does not shift layout.
            <div className="mt-4 sm:mt-6">
              <SkeletonGrid variant="row" />
            </div>
          ) : null}
          <LoadMore
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            isFetchNextPageError={isFetchNextPageError}
            hasItems={characterCount > 0}
            pageCount={pageCount}
            onLoadMore={loadMore}
            onRetry={retryNextPage}
            endNoteRef={endNoteRef}
          />
        </div>
      )}
    </>
  );
}
