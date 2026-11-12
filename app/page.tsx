import Link from "next/link";
import { PortalStage } from "@/components/home/portal-stage";

export default function Home() {
  return (
    <section className="flex flex-col items-center pt-8 text-center sm:pt-12">
      <h1
        tabIndex={-1}
        className="text-2xl leading-[1.2] font-bold focus:outline-none sm:text-4xl"
      >
        Pull a card from the portal
      </h1>
      <p className="mt-4 max-w-prose text-text-muted">
        Open the portal to reveal a random character card from the Rick and Morty API.
      </p>
      <Link
        href="/browse"
        className="mt-6 inline-flex min-h-12 items-center rounded-full border border-border-ui bg-surface px-6 font-bold text-text transition-transform duration-150 hover:bg-surface-raised active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        Start browsing
      </Link>
      <div className="mt-8 w-full">
        <PortalStage />
      </div>
    </section>
  );
}
