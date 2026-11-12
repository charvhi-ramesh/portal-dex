"use client";

import { useRef } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { CharacterGrid } from "@/components/browse/character-grid";
import { FilterBar } from "@/components/browse/filter-bar";
import { ResultsToolbar } from "@/components/browse/results-toolbar";
import { useBrowseUrl } from "@/components/browse/use-browse-url";
import {
  EMPTY_FILTERS,
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

  return (
    <>
      <div className="mt-12">
        <FilterBar filters={filters} onChange={applyFilters} />
      </div>
      <div className="mt-8">
        <ResultsToolbar
          ref={toolbarRef}
          count={total}
          showClearAll={hasActiveFilters(filters)}
          onClearAll={() => applyFilters(EMPTY_FILTERS, "push")}
        />
      </div>
      {query.isPending ? (
        <ul aria-busy="true" className="mt-4 min-h-[60vh]" />
      ) : query.isError && query.data === undefined ? (
        <p role="alert" className="mt-4">
          {"Couldn't load characters."}
        </p>
      ) : (
        <div className="mt-4">
          <CharacterGrid characters={characters} />
        </div>
      )}
    </>
  );
}
