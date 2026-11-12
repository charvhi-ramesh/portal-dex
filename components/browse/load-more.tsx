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

// Infinite scroll plus its keyboard fallback (BRW-08). The sentinel observer is
// re-created whenever the page count or a fetch state changes: a fresh observer reports
// its initial intersection, so a sentinel that never leaves the margin (a tall screen)
// still triggers the next step (RESEARCH Pitfall 5). Auto-loading never runs while a
// request is in flight or after a failure, so passive scrolling cannot flood the API
// (T-01-23).
export function LoadMore({
  hasNextPage,
  isFetchingNextPage,
  isFetchNextPageError,
  pageCount,
  onLoadMore,
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
      {hasNextPage ? (
        <button
          type="button"
          onClick={() => onLoadMore("button")}
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-ui bg-surface px-6 text-base font-bold text-text transition-transform duration-150 hover:bg-surface-raised active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          Load more
        </button>
      ) : null}
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
    </div>
  );
}
