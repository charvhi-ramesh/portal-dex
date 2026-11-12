import type { Character } from "@/lib/api/types";
import { backFacts } from "@/lib/card/card-text";

// Back face facts. Every value is a plain React text child: origin and location are never
// links (SPEC A6) and API strings are never rendered as HTML (T-02-01).
export function CardBack({ character }: { character: Character }) {
  return (
    <dl className="flex flex-col gap-1">
      {backFacts(character).map((fact) => (
        <div key={fact.label} className="flex min-w-0 gap-1 text-sm">
          <dt className="shrink-0 text-text-muted">{fact.label}</dt>
          <dd title={fact.value} className="min-w-0 truncate text-text">
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
