// RED-phase signature stubs: behaviour is implemented in the GREEN commit.
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

export function parseFilters(_params: { get(name: string): string | null }): Filters {
  return EMPTY_FILTERS;
}

export function serializeFilters(_filters: Filters): string {
  return "";
}

export function filtersKey(_filters: Filters): string {
  return "";
}

export function buildBrowseUrl(pathname: string, _filters: Filters): string {
  return pathname;
}

export function toListParams(_filters: Filters): CharacterListParams {
  return {};
}

export function toggleFilter(
  filters: Filters,
  _group: FilterGroupKey,
  _value: string,
): Filters {
  return filters;
}

export function hasActiveFilters(_filters: Filters): boolean {
  return false;
}

export function labelFor(value: string): string {
  return value;
}
