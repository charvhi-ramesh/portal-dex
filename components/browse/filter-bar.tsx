"use client";

import { FilterGroup } from "@/components/browse/filter-group";
import { SearchField } from "@/components/browse/search-field";
import { STATUSES, toggleFilter, type Filters } from "@/lib/browse/filters";

// Static filter bar (D-06): scrolls away with the page, never pinned to the viewport.
// Typing is a search edit and replaces the history entry; chips push one (BRW-06).
export function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange(next: Filters, mode: "push" | "replace"): void;
}) {
  return (
    <div>
      <SearchField
        value={filters.q}
        onCommit={(q) => onChange({ ...filters, q }, "replace")}
      />
      <div className="mt-6 flex flex-col gap-4">
        <FilterGroup
          id="status"
          label="Status"
          options={STATUSES}
          value={filters.status}
          onToggle={(value) =>
            onChange(toggleFilter(filters, "status", value), "push")
          }
        />
      </div>
    </div>
  );
}
