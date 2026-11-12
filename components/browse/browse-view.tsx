"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { CharacterGrid } from "@/components/browse/character-grid";
import { FilterGroup } from "@/components/browse/filter-group";
import { useBrowseUrl } from "@/components/browse/use-browse-url";
import { STATUSES, toListParams, toggleFilter } from "@/lib/browse/filters";
import { browseOptions } from "@/lib/query/options";

// Walking-skeleton slice: one real API read and one URL write. Plans 01-05 to 01-10 grow this view.
export function BrowseView() {
  const { filters, pushFilters } = useBrowseUrl();
  const query = useInfiniteQuery(browseOptions(toListParams(filters)));
  const characters =
    query.data?.pages.flatMap((page) => page?.results ?? []) ?? [];

  return (
    <>
      <FilterGroup
        id="status"
        label="Status"
        options={STATUSES}
        value={filters.status}
        onToggle={(value) =>
          pushFilters(toggleFilter(filters, "status", value))
        }
      />
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
