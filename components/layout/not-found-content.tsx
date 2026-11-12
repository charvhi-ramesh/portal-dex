import Link from "next/link";
import { NOT_FOUND_HEADING } from "@/lib/detail/detail";

const PRESS =
  "transition-transform duration-150 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";
const BUTTON = `inline-flex min-h-12 items-center rounded-full px-6 font-bold ${PRESS}`;

// DET-06: shared 404 content. Server-safe (no hooks, no client directive) so the root
// not-found page renders it on the server and the client detail view can render it too when
// the API answers 404. Copy is plain and fixed; nothing from the URL or the API appears here.
export function NotFoundContent() {
  return (
    <section className="flex flex-col items-center pt-8 text-center sm:pt-12">
      <h1
        tabIndex={-1}
        className="text-2xl leading-[1.2] font-bold focus:outline-none sm:text-4xl"
      >
        {NOT_FOUND_HEADING}
      </h1>
      <p className="mt-4 max-w-prose text-text-muted">
        This page or character isn&apos;t in any dimension we know of.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <Link
          href="/browse"
          className={`${BUTTON} bg-blue text-bg hover:bg-blue-hover`}
        >
          Browse characters
        </Link>
        <Link
          href="/"
          className={`${BUTTON} border border-border-ui bg-surface text-text hover:bg-surface-raised`}
        >
          Open the portal
        </Link>
      </div>
    </section>
  );
}
