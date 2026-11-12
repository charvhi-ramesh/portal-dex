"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { browseOptions } from "@/lib/query/options";

// Tracer slice: one real API read. Plans 01-05 to 01-10 grow this view.
export function BrowseView() {
  const query = useInfiniteQuery(browseOptions({}));
  const characters =
    query.data?.pages.flatMap((page) => page?.results ?? []) ?? [];

  if (query.isPending) {
    return <ul aria-busy="true" className="mt-12 min-h-[60vh]" />;
  }

  if (query.isError && query.data === undefined) {
    return (
      <p role="alert" className="mt-12">
        {"Couldn't load characters."}
      </p>
    );
  }

  return (
    <ul className="mt-12">
      {characters.map((character) => (
        <li key={character.id}>{character.name}</li>
      ))}
    </ul>
  );
}
