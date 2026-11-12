import { CardAvatar } from "@/components/card/card-avatar";
import type { Character } from "@/lib/api/types";
import { labelFor } from "@/lib/browse/filters";

function statusKey(status: Character["status"]): "alive" | "dead" | "unknown" {
  if (status === "Alive") return "alive";
  if (status === "Dead") return "dead";
  return "unknown";
}

// Final card markup (D-01). Phase 1 renders it static: the flip button is disabled and
// aria-hidden, the star and link slots stay empty and the back face is inert. Phase 2 only
// adds behaviour to this structure. API text is rendered as React children, never as HTML.
export function CharacterCard({
  character,
  eager,
}: {
  character: Character;
  eager: boolean;
}) {
  const key = statusKey(character.status);
  const species = character.species.trim() || "Unknown species";

  return (
    <article
      tabIndex={-1}
      data-status={key}
      className="group relative h-full overflow-hidden rounded-[20px] border-2 bg-surface focus:outline-2 focus:outline-offset-2 focus:outline-teal data-[status=alive]:border-teal data-[status=dead]:border-grey data-[status=unknown]:border-purple"
    >
      <button
        type="button"
        disabled
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-transparent"
      />
      <div className="relative">
        <CardAvatar src={character.image} name={character.name} eager={eager} />
        <div className="flex flex-col gap-2 p-2 sm:p-4">
          <h2
            title={character.name}
            className="line-clamp-2 min-h-[2.4em] text-base leading-[1.2] font-bold text-text"
          >
            {character.name}
          </h2>
          <span className="inline-flex w-fit items-center rounded-full px-2 py-1 text-sm leading-[1.2] font-bold text-bg group-data-[status=alive]:bg-teal group-data-[status=dead]:bg-grey group-data-[status=unknown]:bg-purple">
            {labelFor(character.status)}
          </span>
          <p title={species} className="truncate text-sm text-text-muted">
            {species}
          </p>
        </div>
      </div>
      <div
        aria-hidden="true"
        data-slot="star"
        className="pointer-events-none absolute top-2 right-2 size-11"
      />
      <div data-slot="link" />
      <div
        inert
        className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]"
      />
    </article>
  );
}
