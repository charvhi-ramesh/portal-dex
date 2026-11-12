import type { Ref } from "react";
import { CharacterCard } from "@/components/card/character-card";
import type { Character } from "@/lib/api/types";

// `ref` reaches the list so BrowseView can move focus to a newly added card (React 19
// passes it as a regular prop).
export function CharacterGrid({
  characters,
  busy,
  ref,
}: {
  characters: readonly Character[];
  busy?: boolean;
  ref?: Ref<HTMLUListElement>;
}) {
  return (
    <ul
      ref={ref}
      aria-busy={busy || undefined}
      className="grid list-none grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5"
    >
      {characters.map((character, index) => (
        <li key={character.id}>
          <CharacterCard character={character} eager={index < 5} />
        </li>
      ))}
    </ul>
  );
}
