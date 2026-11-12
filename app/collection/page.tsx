import type { Metadata } from "next";
import { CollectionView } from "@/components/collection/collection-view";

export const metadata: Metadata = { title: "Collection" };

export default function CollectionPage() {
  return (
    <section className="pt-8 sm:pt-12">
      <h1
        id="collection-heading"
        tabIndex={-1}
        className="text-2xl leading-[1.2] font-bold focus:outline-none sm:text-4xl"
      >
        Your collection
      </h1>
      <CollectionView />
    </section>
  );
}
