import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CharacterDetail } from "@/components/detail/character-detail";
import { NOT_FOUND_TITLE, routeCharacterId } from "@/lib/detail/detail";

type Params = { params: Promise<{ id: string }> };

// One sample ID so the route may read `params` at the top level under Cache Components; every
// other ID renders on its first request. The server only validates the route ID (DATA-04):
// every API read happens in the browser through TanStack Query, so nothing here touches the API.
export async function generateStaticParams() {
  return [{ id: "1" }];
}

// The server cannot know the name without an API read, so the tab says "Character" until the
// client component sets document.title to the name. An invalid ID gets the 404 title.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  if (routeCharacterId(id) === null) return { title: { absolute: NOT_FOUND_TITLE } };
  return { title: "Character" };
}

export default async function CharacterPage({ params }: Params) {
  const { id } = await params;
  const characterId = routeCharacterId(id);
  // DATA-04: an invalid ID stops here, before any client component mounts or any request is built.
  if (characterId === null) notFound();

  return (
    <section className="pt-8 sm:pt-12">
      <CharacterDetail id={characterId} />
    </section>
  );
}
