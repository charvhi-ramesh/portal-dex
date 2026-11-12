"use client";

import { useQuery } from "@tanstack/react-query";
import { useFavouriteIds } from "@/components/favourites/use-favourites";
import { formatCount } from "@/lib/browse/announce";
import { totalCountOptions } from "@/lib/query/portal";

// COL-03: the header counter. It is live on every page because it reads the favourites
// store, and it is not a live region (the star's pressed state is what assistive technology
// announces). The server and hydration render read an empty list, so the prerendered HTML
// carries the contiguous zero-state text "0 collected". Below 640 px the 320 px header budget
// only fits "N collected"; from 640 px " / {total}" is added once the count query succeeds. A
// failed or zero count is unknown, so the counter never reads "N / 0". The total comes from
// the API (info.count), never a hardcoded number.
export function CollectedCounter() {
  const collected = useFavouriteIds().length;
  const { data } = useQuery(totalCountOptions());
  const total = data !== undefined && data > 0 ? data : null;

  return (
    <p className="ml-auto min-w-[12ch] rounded-full border border-border-ui bg-surface px-3 py-1 text-center text-sm leading-normal font-bold text-text sm:min-w-[19ch]">
      {total === null ? (
        `${formatCount(collected)} collected`
      ) : (
        <>
          {formatCount(collected)}
          <span className="hidden sm:inline">{` / ${formatCount(total)}`}</span>
          {" collected"}
        </>
      )}
    </p>
  );
}
