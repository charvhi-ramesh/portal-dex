import type { Metadata } from "next";
import Link from "next/link";

// Interim Collection page (planning decision 2). Phase 3 replaces it (COL-04).
export const metadata: Metadata = { title: "Collection" };

export default function CollectionPage() {
  return (
    <section className="pt-8 sm:pt-12">
      <h1
        tabIndex={-1}
        className="text-2xl leading-[1.2] font-bold focus:outline-none sm:text-4xl"
      >
        Your collection
      </h1>
      <p className="mt-4 text-text-muted">Cards you collect will appear here.</p>
      <Link
        href="/browse"
        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-blue px-6 font-bold text-bg transition-transform duration-150 hover:bg-blue-hover active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        Browse characters
      </Link>
    </section>
  );
}
