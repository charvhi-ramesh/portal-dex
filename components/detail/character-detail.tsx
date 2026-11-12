"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { displayName } from "@/lib/card/card-text";
import { NOT_FOUND_TITLE, detailTitle } from "@/lib/detail/detail";
import { characterOptions } from "@/lib/query/portal";

const H1 = "text-2xl leading-[1.2] font-bold focus:outline-none sm:text-4xl";

// DET-01, DET-05, DET-06: the detail view of one character. `id` is the number the page
// validated, never the raw route string, so the query key is ["characters","detail",id] and a
// late answer for one ID can never render on another ID's page. API strings are React text only.
export function CharacterDetail({ id }: { id: number }) {
  const query = useQuery(characterOptions(id));
  const { data } = query;

  // The tab title follows the data: the name once known, the 404 title for an API 404. Until
  // then the server-provided "Character" title stays. Writing document.title is not setState.
  useEffect(() => {
    if (data === undefined) return;
    document.title = data === null ? NOT_FOUND_TITLE : detailTitle(data.name);
  }, [data]);

  // API 404: the character does not exist.
  if (data === null) return <NotFoundContent />;

  return (
    <h1 tabIndex={-1} className={H1}>
      {data ? displayName(data.name) : "Loading character..."}
    </h1>
  );
}
