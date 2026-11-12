"use client";

import type { ReactNode } from "react";

// The single client provider seam wrapped around page content.
// Plan 01-03 adds TanStack's QueryClientProvider inside it.
export function Providers({ children }: { children: ReactNode }) {
  return children;
}
