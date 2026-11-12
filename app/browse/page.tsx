import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseView } from "@/components/browse/browse-view";

export const metadata: Metadata = { title: "Browse" };

export default function BrowsePage() {
  return (
    <section className="pt-8 sm:pt-12">
      {/* Outside Suspense so route focus (FND-06) can reach it immediately. */}
      <h1
        tabIndex={-1}
        className="text-2xl leading-[1.2] font-bold focus:outline-none sm:text-4xl"
      >
        Browse characters
      </h1>
      <Suspense
        fallback={<div aria-busy="true" className="mt-12 min-h-[60vh]" />}
      >
        <BrowseView />
      </Suspense>
    </section>
  );
}
