// QueryClient defaults and retry policy (DATA-05).
// No React and no 'use client' so `node --test` can load it with type stripping.

import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/client.ts";

export const ONE_HOUR = 3_600_000;

/**
 * Retry network errors and 5xx once. Never retry an aborted request, any 4xx
 * (including the 429 rate limit) or an unparseable body.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false;
  if (error instanceof Error && error.name === "AbortError") return false;
  if (error instanceof ApiError) {
    if (error.kind === "network") return true;
    if (error.kind === "http") return error.status !== null && error.status >= 500;
  }
  return false;
}

export const queryDefaults = {
  // staleTime of at least one hour and no refetch on focus or reconnect (DATA-05).
  staleTime: ONE_HOUR,
  // gcTime must outlive staleTime, or the cache dies before a revisit (BRW-11).
  gcTime: 2 * ONE_HOUR,
  refetchOnWindowFocus: false as const,
  refetchOnReconnect: false as const,
  // The default "online" mode pauses offline queries instead of rejecting them.
  networkMode: "always" as const,
  retry: shouldRetry,
};

export function makeQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: queryDefaults } });
}
