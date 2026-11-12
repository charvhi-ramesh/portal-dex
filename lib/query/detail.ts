// Detail page query options and cache seeding (DET-02, DET-03, DET-04).
// Type-only imports use `type` specifiers: Node type stripping does not elide them.

import { queryOptions } from "@tanstack/react-query";

export function episodesOptions(ids: readonly number[]) {
  return queryOptions({
    queryKey: ["episodes", ""] as const,
    queryFn: async () => {
      void ids;
      return [];
    },
  });
}
