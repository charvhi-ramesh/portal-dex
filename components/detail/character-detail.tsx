"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useOnlineStatus } from "@/components/browse/use-online-status";
import { FavouriteStar } from "@/components/card/favourite-star";
import { DetailHero } from "@/components/detail/detail-hero";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { displayName } from "@/lib/card/card-text";
import { NOT_FOUND_TITLE, detailTitle } from "@/lib/detail/detail";
import { characterOptions } from "@/lib/query/portal";

const H1 = "text-2xl leading-[1.2] font-bold focus:outline-none sm:text-4xl";
const BAR = "skeleton-pulse h-6 rounded-full bg-surface-raised";

function DetailSkeleton() {
  return (
    <div
      aria-busy="true"
      className="mt-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8"
    >
      <div className="skeleton-pulse aspect-square rounded-[20px] bg-surface-raised" />
      <div className="flex flex-col gap-4">
        <div className={`${BAR} w-1/3`} />
        <div className={`${BAR} w-2/3`} />
        <div className={`${BAR} w-1/2`} />
      </div>
    </div>
  );
}

// DET-01, DET-05, DET-06: the detail view of one character. `id` is the number the page
// validated, never the raw route string, so the query key is ["characters","detail",id] and a
// late answer for one ID can never render on another ID's page. API strings are React text only,
// and a failure shows fixed copy: ApiError text never reaches the screen (T-03-03).
export function CharacterDetail({ id }: { id: number }) {
  const query = useQuery(characterOptions(id));
  const { data } = query;
  const online = useOnlineStatus();
  const [retrying, setRetrying] = useState(false);

  // The tab title follows the data: the name once known, the 404 title for an API 404. Until
  // then the server-provided "Character" title stays. Writing document.title is not setState.
  useEffect(() => {
    if (data === undefined) return;
    document.title = data === null ? NOT_FOUND_TITLE : detailTitle(data.name);
  }, [data]);

  // API 404: the character does not exist.
  if (data === null) return <NotFoundContent />;

  // A data-less query resets to pending while it refetches, which would unmount the focused
  // Retry button, so a retry in flight keeps the error panel mounted (as BrowseView does).
  const showError = data === undefined && (query.isError || retrying);

  function retry() {
    if (query.isFetching) return;
    setRetrying(true);
    void query.refetch().then(() => setRetrying(false));
  }

  if (showError) {
    return (
      <>
        <h1 tabIndex={-1} className={H1}>
          Character unavailable
        </h1>
        <div
          role="alert"
          className="mt-6 flex max-w-[480px] flex-col items-start gap-4 rounded-panel border border-border-ui bg-surface px-6 py-8"
        >
          <p className="text-base text-text">
            {online ? "Couldn't load this character." : "You appear to be offline."}
          </p>
          <button
            type="button"
            aria-disabled={query.isFetching || retrying}
            onClick={retry}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-border-ui bg-surface px-6 text-base font-bold text-text transition-transform duration-150 hover:bg-surface-raised active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 aria-disabled:cursor-default aria-disabled:opacity-60"
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  if (data === undefined) {
    return (
      <>
        <h1 tabIndex={-1} className={H1}>
          Loading character...
        </h1>
        <DetailSkeleton />
      </>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <h1 tabIndex={-1} className={`${H1} min-w-0 break-words`}>
          {displayName(data.name)}
        </h1>
        <FavouriteStar id={data.id} name={data.name} variant="hero" />
      </div>
      <DetailHero character={data} />
    </>
  );
}
