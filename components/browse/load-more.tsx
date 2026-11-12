"use client";

import { useEffect, useRef, type Ref } from "react";

/** Who asked for the next step. Only a button press moves focus afterwards (decision 3). */
export type LoadTrigger = "button" | "scroll";

type LoadMoreProps = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  hasItems: boolean;
  pageCount: number;
  onLoadMore(trigger: LoadTrigger): void;
  onRetry(): void;
  endNoteRef: Ref<HTMLParagraphElement>;
};

// Start loading while the sentinel is still 400 px below the viewport (UI-SPEC).
const SENTINEL_MARGIN = "0px 0px 400px 0px";

// Fixed copy only: API error text never reaches the screen (T-01-21).
const LOADING_LABEL = "Loading more...";
const NEXT_ERROR_TEXT = "Couldn't load more characters.";
const END_NOTE_TEXT = "You've reached the end of the dimension.";

// Shared secondary button look (UI-SPEC "Buttons"): fill changes are instant, only the
// press feedback animates `transform`.
const SECONDARY_BUTTON =
  "inline-flex min-h-12 items-center justify-center rounded-full border border-border-ui bg-surface px-6 text-base font-bold text-text transition-transform duration-150 hover:bg-surface-raised active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 aria-disabled:cursor-default";

/** Id of the inline Retry button, so BrowseView can hand focus to it after a failed press. */
export const NEXT_RETRY_ID = "load-more-retry";

// Infinite scroll plus its keyboard fallback (BRW-08), the inline next-page error
// (BRW-09) and the calm end-of-list note (DATA-03). The sentinel observer is re-created
// whenever the page count or a fetch state changes: a fresh observer reports its initial
// intersection, so a sentinel that never leaves the margin (a tall screen) still
// triggers the next step (RESEARCH Pitfall 5). Auto-loading never runs while a request
// is in flight or after a failure, so passive scrolling cannot flood the API (T-01-23).
export function LoadMore({
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  hasItems,
  pageCount,
  onLoadMore,
  onRetry,
  endNoteRef,
}: LoadMoreProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // The observer callback reads the latest handler without re-creating the observer on
  // every parent render (refs are only written in effects).
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const canLoad = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;
    if (sentinel === null || !canLoad) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current("scroll");
        }
      },
      { rootMargin: SENTINEL_MARGIN },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // pageCount is listed on purpose: each new page re-creates the observer so its
    // initial report covers the freshly appended cards.
  }, [pageCount, isFetchingNextPage, hasNextPage, isFetchNextPageError]);

  return (
    <div className="mt-6 flex flex-col items-center">
      {isFetchNextPageError ? (
        // Existing cards stay (RESEARCH Pitfall 6). The row stays mounted while Retry is in
        // flight, so focus is not lost; it unmounts when the retry succeeds.
        <div role="alert" className="flex flex-wrap items-center justify-center gap-4">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-6 shrink-0 text-text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 7v6" />
            <path d="M12 17v.01" />
          </svg>
          <p className="text-base text-text">{NEXT_ERROR_TEXT}</p>
          <button
            id={NEXT_RETRY_ID}
            type="button"
            aria-disabled={isFetchingNextPage}
            onClick={() => {
              if (isFetchingNextPage) return;
              onRetry();
            }}
            className={SECONDARY_BUTTON}
          >
            Retry
          </button>
        </div>
      ) : hasNextPage ? (
        // Stays mounted while loading, with aria-disabled rather than disabled, so a
        // keyboard user keeps focus on it.
        <button
          type="button"
          aria-disabled={isFetchingNextPage}
          onClick={() => {
            if (isFetchingNextPage) return;
            onLoadMore("button");
          }}
          className={SECONDARY_BUTTON}
        >
          {isFetchingNextPage ? LOADING_LABEL : "Load more"}
        </button>
      ) : hasItems ? (
        <p
          ref={endNoteRef}
          tabIndex={-1}
          className="text-center text-sm text-text-muted"
        >
          {END_NOTE_TEXT}
        </p>
      ) : null}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </div>
  );
}
