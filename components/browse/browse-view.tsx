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
import { LiveRegion, useAnnouncer } from "@/components/browse/live-region";
import { ResultsToolbar } from "@/components/browse/results-toolbar";
import { useBrowseUrl } from "@/components/browse/use-browse-url";
import { useOnlineStatus } from "@/components/browse/use-online-status";
import { countAnnouncement } from "@/lib/browse/announce";
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
        <ul aria-busy="true" className="mt-4 min-h-[60vh]" />
      ) : characters.length === 0 && !query.hasNextPage ? (
        // BRW-01: zero results render no list at all. A page-1 404 is an empty step
        // (DATA-03), so it always lands here and never in the error branch above.
        <div className="mt-4 py-8">
          <EmptyPanel onClearFilters={clearFilters} />
        </div>
      ) : (
        <div className="mt-4">
          <CharacterGrid characters={characters} />
        </div>
      )}
    </>
  );
}
