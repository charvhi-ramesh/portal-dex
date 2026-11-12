import Link from "next/link";

// Interim home page (planning decision 2). Phase 2 replaces it with the portal (HOME-01).
export default function Home() {
  return (
    <section className="pt-8 sm:pt-12">
      <h1
        tabIndex={-1}
        className="text-2xl leading-[1.2] font-bold focus:outline-none sm:text-4xl"
      >
        Welcome to Portal Dex
      </h1>
      <p className="mt-4 text-text-muted">
        Browse every character from the Rick and Morty API as a collectible card.
      </p>
      <Link
        href="/browse"
        className="mt-6 inline-flex min-h-12 items-center rounded-full bg-blue px-6 font-bold text-bg transition-transform duration-150 hover:bg-blue-hover active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        Browse characters
      </Link>
    </section>
  );
}
