import { EMPTY_HEADING } from "@/lib/browse/announce";

/** Id of the Clear filters button, so BrowseView can hand focus to it after a first-page Retry finds nothing. */
export const CLEAR_FILTERS_ID = "browse-clear-filters";

const EMPTY_BODY =
  "Nothing matches your search and filters. Try a different name, or clear the filters to see everyone.";

// No-results panel (BRW-01 empty edge, BRW-09). Same look as the error panel but not an
// alert: the settled "0 results" announcement already goes through the live region.
export function EmptyPanel({ onClearFilters }: { onClearFilters(): void }) {
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 rounded-panel border border-border-ui bg-surface px-6 py-12 text-center">
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
        <circle cx="28" cy="28" r="18" />
        <path d="m41 41 15 15" />
        <path d="M21 28h14" />
      </svg>
      <h2 className="text-2xl leading-[1.2] font-bold text-text">{EMPTY_HEADING}</h2>
      <p className="text-base text-text">{EMPTY_BODY}</p>
      <button
        id={CLEAR_FILTERS_ID}
        type="button"
        onClick={onClearFilters}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-blue px-6 text-base font-bold text-bg transition-transform duration-150 hover:bg-blue-hover active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        Clear filters
      </button>
    </div>
  );
}
