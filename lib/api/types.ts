// Type-only module: response and request shapes for the public Rick and Morty API.
// Always import from here with `import type { ... }` (verbatimModuleSyntax).

export type CharacterStatus = "Alive" | "Dead" | "unknown";
export type CharacterGender = "Female" | "Male" | "Genderless" | "unknown";

export type ResourceRef = { name: string; url: string };

export type Character = {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  origin: ResourceRef;
  location: ResourceRef;
  image: string;
  episode: string[];
  url: string;
  created: string;
};

export type PageInfo = {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
};

export type Paginated<T> = { info: PageInfo; results: T[] };

export type CharacterPage = Paginated<Character>;

export type Episode = {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
};

export type LocationResource = {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: string[];
  url: string;
  created: string;
};

export type CharacterListParams = {
  name?: string;
  status?: CharacterStatus;
  gender?: CharacterGender;
  species?: string;
};
