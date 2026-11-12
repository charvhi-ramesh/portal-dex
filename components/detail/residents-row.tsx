"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useId, useState } from "react";
import { CardAvatar } from "@/components/card/card-avatar";
import type { Character } from "@/lib/api/types";
import { displayName } from "@/lib/card/card-text";
import {
  RESIDENT_LIMIT,
  alsoFoundHeading,
  locationIdOf,
  pickResidentIds,
} from "@/lib/detail/residents";
import { locationOptions, residentsOptions, seedCharacter } from "@/lib/query/detail";

const MINI_SIZES = "(min-width: 1024px) 160px, (min-width: 640px) 25vw, 33vw";
const GRID = "mt-4 grid list-none grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6";
const H2 = "text-2xl leading-[1.2] font-bold";

// DET-04: up to 12 other residents of the character's last location, from one location request
// and one multi-ID character request. An unknown location (empty URL, SPEC A6) makes no request
// and renders nothing; so do a 404 location, no other residents, and an empty response. Only IDs
// from extractId build requests (T-03-08); every API string is React text (T-03-09), and a
// failure shows fixed copy. All hooks run before any early return.
export function ResidentsRow({ character }: { character: Character }) {
  const locationId = locationIdOf(character.location);
  const locationQuery = useQuery({
    ...locationOptions(locationId ?? 0),
    enabled: locationId !== null,
  });
  const location = locationQuery.data;
  const ids = location ? pickResidentIds(location.residents, character.id) : [];
  const residentsQuery = useQuery({
    ...residentsOptions(ids),
    enabled: ids.length > 0,
  });
  const headingId = useId();
  const queryClient = useQueryClient();
  const [retrying, setRetrying] = useState(false);

  if (locationId === null) return null;

  const failed =
    (location === undefined && locationQuery.isError) ||
    (residentsQuery.data === undefined && residentsQuery.isError);
  const anyFetching = locationQuery.isFetching || residentsQuery.isFetching;

  function retry() {
    if (anyFetching) return;
    setRetrying(true);
    const pending: Promise<unknown>[] = [];
    if (locationQuery.data === undefined && locationQuery.isError) {
      pending.push(locationQuery.refetch());
    }
    if (residentsQuery.data === undefined && residentsQuery.isError) {
      pending.push(residentsQuery.refetch());
    }
    void Promise.all(pending).then(() => setRetrying(false));
  }

  // The failed or retrying panel stays mounted through the retry so focus is not lost.
  if (failed || retrying) {
    return (
      <section aria-labelledby={headingId} className="mt-12">
        <h2 id={headingId} className={H2}>
          {alsoFoundHeading(location?.name ?? "")}
        </h2>
        <div
          role="alert"
          className="mt-4 flex max-w-[480px] flex-col items-start gap-4 rounded-panel border border-border-ui bg-surface px-6 py-6"
        >
          <p className="text-base text-text">Couldn&apos;t load other residents.</p>
          <button
            type="button"
            aria-disabled={anyFetching || retrying}
            onClick={retry}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border-ui bg-surface px-6 text-base font-bold text-text transition-transform duration-150 hover:bg-surface-raised active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 aria-disabled:cursor-default aria-disabled:opacity-60"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Location still loading, 404, or nobody else lives there: nothing to show.
  if (!location || ids.length === 0) return null;

  const residents = residentsQuery.data;

  if (residents === undefined) {
    return (
      <section aria-labelledby={headingId} aria-busy="true" className="mt-12">
        <h2 id={headingId} className={H2}>
          {alsoFoundHeading(location.name)}
        </h2>
        <ul className={GRID}>
          {Array.from({ length: Math.min(ids.length, RESIDENT_LIMIT) }, (_, index) => (
            <li
              key={index}
              aria-hidden="true"
              className="skeleton-pulse aspect-[3/4] rounded-[16px] bg-surface-raised"
            />
          ))}
        </ul>
      </section>
    );
  }

  // None of the residents came back from the API: hide the section.
  if (residents.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="mt-12">
      <h2 id={headingId} className={H2}>
        {alsoFoundHeading(location.name)}
      </h2>
      <ul className={GRID}>
        {residents.map((resident) => (
          <li key={resident.id}>
            <Link
              href={`/character/${resident.id}`}
              prefetch={false}
              onClick={() => seedCharacter(queryClient, resident)}
              className="flex h-full flex-col gap-2 rounded-[16px] border border-border-ui bg-surface p-2 transition-transform duration-150 hover:bg-surface-raised active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              <CardAvatar
                src={resident.image}
                name={resident.name}
                eager={false}
                sizes={MINI_SIZES}
                rounded="all"
              />
              <span
                aria-hidden="true"
                className="line-clamp-2 text-sm leading-[1.2] font-bold text-text"
              >
                {displayName(resident.name)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
