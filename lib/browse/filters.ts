// URL <-> Filters model for Browse. Pure and React-free so `node --test` can run it.
// The URL is attacker-controllable (shared links): chip values are accepted only
// when they match the canonical API value exactly (case-sensitive), and q is
// trimmed and capped. Nothing else from the URL reaches the API (T-01-08).

import type { CharacterListParams } from "../api/types.ts";

export const STATUSES = ["Alive", "Dead", "unknown"] as const;
export const GENDERS = ["Female", "Male", "Genderless", "unknown"] as const;
export const SPECIES = [
  "Human",
  "Alien",
  "Humanoid",
  "Mythological Creature",
  "Robot",
  "Animal",
] as const;

export type Status = (typeof STATUSES)[number];
export type Gender = (typeof GENDERS)[number];
export type Species = (typeof SPECIES)[number];

export type Filters = {
  q: string;
  status: Status | null;
  gender: Gender | null;
  species: Species | null;
};

export type FilterGroupKey = "status" | "gender" | "species";

export const EMPTY_FILTERS: Filters = {
  q: "",
  status: null,
  gender: null,
  species: null,
};

export const MAX_QUERY_LENGTH = 60 as const;

const ALLOWED: Record<FilterGroupKey, readonly string[]> = {
  status: STATUSES,
  gender: GENDERS,
  species: SPECIES,
};

function pick<T extends string>(
  allowed: readonly T[],
  value: string | null,
): T | null {
  return allowed.find((candidate) => candidate === value) ?? null;
}

/** Trim, then cap at 60 Unicode code points so a surrogate pair is never split. */
function cleanQuery(raw: string | null): string {
  return Array.from((raw ?? "").trim())
    .slice(0, MAX_QUERY_LENGTH)
    .join("");
}

export function parseFilters(params: {
  get(name: string): string | null;
}): Filters {
  return {
    q: cleanQuery(params.get("q")),
    status: pick(STATUSES, params.get("status")),
    gender: pick(GENDERS, params.get("gender")),
    species: pick(SPECIES, params.get("species")),
  };
}

/** "" or "q=..&status=..", always in the key order q, status, gender, species. */
export function serializeFilters(filters: Filters): string {
  const query = new URLSearchParams();
  const q = filters.q.trim();
  if (q) query.set("q", q);
  if (filters.status) query.set("status", filters.status);
  if (filters.gender) query.set("gender", filters.gender);
  if (filters.species) query.set("species", filters.species);
  return query.toString();
}

export function filtersKey(filters: Filters): string {
  return serializeFilters(filters);
}

export function buildBrowseUrl(pathname: string, filters: Filters): string {
  const serialized = serializeFilters(filters);
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function toListParams(filters: Filters): CharacterListParams {
  const params: CharacterListParams = {};
  const q = filters.q.trim();
  if (q) params.name = q;
  if (filters.status) params.status = filters.status;
  if (filters.gender) params.gender = filters.gender;
  if (filters.species) params.species = filters.species;
  return params;
}

/** One value per group: the active value clears, a different value replaces. */
export function toggleFilter(
  filters: Filters,
  group: FilterGroupKey,
  value: string,
): Filters {
  if (!ALLOWED[group].includes(value)) return filters;
  return { ...filters, [group]: filters[group] === value ? null : value };
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.q.trim() !== "" ||
    filters.status !== null ||
    filters.gender !== null ||
    filters.species !== null
  );
}

export function labelFor(value: string): string {
  return value === "unknown" ? "Unknown" : value;
}
