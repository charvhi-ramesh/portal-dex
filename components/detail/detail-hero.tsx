import { CardAvatar } from "@/components/card/card-avatar";
import type { Character } from "@/lib/api/types";
import { labelFor } from "@/lib/browse/filters";
import { backFacts } from "@/lib/card/card-text";

// Literal class strings so Tailwind generates them. Dead is desaturated like the card photo.
function frameClass(status: Character["status"]): string {
  if (status === "Alive") return "border-teal";
  if (status === "Dead") return "border-grey grayscale-[60%]";
  return "border-purple";
}

function badgeClass(status: Character["status"]): string {
  if (status === "Alive") return "bg-teal";
  if (status === "Dead") return "bg-grey";
  return "bg-purple";
}

// DET-01: the hero of the detail page. Every value is a plain React text child; origin and last
// location are never links (SPEC A6, no location page exists) and API strings are never HTML.
// The status badge carries its text label, so status is never colour only.
export function DetailHero({ character }: { character: Character }) {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8">
      <div
        className={`overflow-hidden rounded-[20px] border-2 ${frameClass(character.status)}`}
      >
        <CardAvatar
          src={character.image}
          name={character.name}
          eager
          sizes="(min-width: 768px) 40vw, 100vw"
          rounded="all"
        />
      </div>
      <div className="flex flex-col gap-4">
        <span
          className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-sm leading-[1.2] font-bold text-bg ${badgeClass(character.status)}`}
        >
          {labelFor(character.status)}
        </span>
        <dl className="flex flex-col gap-2">
          {backFacts(character).map((fact) => (
            <div key={fact.label} className="flex min-w-0 gap-2">
              <dt className="shrink-0 text-text-muted">{fact.label}</dt>
              <dd className="min-w-0 break-words text-text">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
