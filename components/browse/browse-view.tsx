"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { CharacterGrid } from "@/components/browse/character-grid";
import { FilterBar } from "@/components/browse/filter-bar";
import { useBrowseUrl } from "@/components/browse/use-browse-url";
import { toListParams, type Filters } from "@/lib/browse/filters";
import { browseOptions } from "@/lib/query/options";

// Walking-skeleton slice: one real API read and one URL write. Plans 01-05 to 01-10 grow this view.
export function BrowseView() {
  const { filters, pushFilters, replaceFilters } = useBrowseUrl();
  const query = useInfiniteQuery(browseOptions(toListParams(filters)));
  const characters =
    query.data?.pages.flatMap((page) => page?.results ?? []) ?? [];

  // BRW-06: typing replaces the history entry, chips and Clear all push one.
  function applyFilters(next: Filters, mode: "push" | "replace") {
    if (mode === "replace") replaceFilters(next);
    else pushFilters(next);
  }

  return (
    <>
      <div className="mt-12">
        <FilterBar filters={filters} onChange={applyFilters} />
      </div>
      {query.isPending ? (
        <ul aria-busy="true" className="mt-12 min-h-[60vh]" />
      ) : query.isError && query.data === undefined ? (
        <p role="alert" className="mt-12">
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
