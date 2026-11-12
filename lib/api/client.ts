// Fetch core for the public Rick and Morty API.
// React-free and alias-free so `node --test` can run it with type stripping.
// Error messages are fixed strings and never include response bodies.

export const API_BASE = "https://rickandmortyapi.com/api";

export type ApiErrorKind = "network" | "http" | "parse";

export class ApiError extends Error {
  kind: ApiErrorKind;
  status: number | null;

  constructor(kind: ApiErrorKind, status: number | null, message: string) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

/**
 * Returns the parsed JSON body, or `null` for HTTP 404.
 * Throws ApiError for every other failure. An aborted request rejects with the
 * original abort reason (never an ApiError) so callers treat it as cancelled.
 */
export async function getJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T | null> {
  if (!path.startsWith("/")) {
    throw new TypeError("path must start with /");
  }

  let res: Response;
  try {
    res = await fetch(API_BASE + path, { signal });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ApiError("network", null, "Network request failed");
  }

  if (res.status === 404) return null;
  // Check ok before reading the body: a Cloudflare 429 carries an HTML body.
  if (!res.ok) throw new ApiError("http", res.status, `HTTP ${res.status}`);

  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError("parse", res.status, "Invalid JSON");
  }
}
