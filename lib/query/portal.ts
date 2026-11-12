// Portal query options factories (RED stubs: signatures only).
// Type-only imports use `type` specifiers: Node type stripping does not elide them.

import { queryOptions } from "@tanstack/react-query";
import type { Character } from "../api/types.ts";

export const TOTAL_COUNT_KEY = ["characters", "count", ""] as const;

export function totalCountOptions() {
  return queryOptions({
    queryKey: TOTAL_COUNT_KEY,
    queryFn: async (): Promise<number> => -1,
  });
}

export function characterOptions(id: number) {
  return queryOptions({
    queryKey: ["characters", "detail", id] as const,
    queryFn: async (): Promise<Character | null> => null,
  });
}
