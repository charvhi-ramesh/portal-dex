"use client";

import { useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { episodeCountText } from "@/lib/card/card-text";
import { episodeChips, episodeIdsOf } from "@/lib/detail/episodes";
import { episodesOptions } from "@/lib/query/detail";

// DET-03, A11Y-05: every episode of the character as a chip, loaded with one multi-ID request.
// The scroll region is focusable and labelled by its heading so keyboard users can reach it and
// scroll it with the arrow keys. Episode codes and names are React text only (T-03-09), and a
// failure shows fixed copy (the error text never reaches the screen).
export function EpisodeStrip({ episodeUrls }: { episodeUrls: readonly string[] }) {
  const ids = episodeIdsOf(episodeUrls);
  const query = useQuery({ ...episodesOptions(ids), enabled: ids.length > 0 });
  const headingId = useId();
  const [retrying, setRetrying] = useState(false);

  const heading = (
    <>
      <h2 id={headingId} className="text-2xl leading-[1.2] font-bold">
        Episodes
      </h2>
      <p className="mt-1 text-text-muted">
        Appears in {episodeCountText(episodeUrls.length)}
      </p>
    </>
  );

  if (episodeUrls.length === 0) {
    return (
      <section aria-labelledby={headingId} className="mt-12">
        {heading}
        <p className="mt-4 text-text-muted">No episodes listed.</p>
      </section>
    );
  }

  const { data } = query;
  // A data-less query resets to pending while it refetches, which would unmount the focused
  // Retry button, so a retry in flight keeps the error panel mounted.
  const showError = data === undefined && (query.isError || retrying);

  function retry() {
    if (query.isFetching) return;
    setRetrying(true);
    void query.refetch().then(() => setRetrying(false));
  }

  if (showError) {
    return (
      <section aria-labelledby={headingId} className="mt-12">
        {heading}
        <div
          role="alert"
          className="mt-4 flex max-w-[480px] flex-col items-start gap-4 rounded-panel border border-border-ui bg-surface px-6 py-6"
        >
          <p className="text-base text-text">Couldn&apos;t load episodes.</p>
          <button
            type="button"
            aria-disabled={query.isFetching || retrying}
            onClick={retry}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border-ui bg-surface px-6 text-base font-bold text-text transition-transform duration-150 hover:bg-surface-raised active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 aria-disabled:cursor-default aria-disabled:opacity-60"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const loading = data === undefined;

  // The scroll region below carries the heading's label, so this section stays unlabelled:
  // two nested landmarks with one name would be announced twice.
  return (
    <section className="mt-12">
      {heading}
      <div
        role="region"
        aria-labelledby={headingId}
        aria-busy={loading}
        tabIndex={0}
        className="mt-4 overflow-x-auto overscroll-x-contain rounded-[16px] px-1 py-2"
      >
        <ol className="flex w-max list-none gap-2">
          {loading
            ? episodeUrls.map((url, index) => (
                <li
                  // Placeholders only: index keys are stable because the list never reorders.
                  key={`${index}-${url}`}
                  aria-hidden="true"
                  className="skeleton-pulse h-9 w-36 rounded-full bg-surface-raised"
                />
              ))
            : episodeChips(episodeUrls, data).map((chip) => (
                <li
                  key={chip.key}
                  className="whitespace-nowrap rounded-full bg-surface-raised px-3 py-2 text-sm text-text"
                >
                  {chip.label}
                </li>
              ))}
        </ol>
      </div>
    </section>
  );
}
