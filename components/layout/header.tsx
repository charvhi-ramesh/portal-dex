import Link from "next/link";
import { Suspense } from "react";
import { NavLinkList, NavLinks } from "./nav-links";

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-divider bg-bg">
      <div className="mx-auto flex h-full w-full max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-base leading-[1.2] font-bold text-text sm:text-2xl"
        >
          Portal Dex
        </Link>
        <nav aria-label="Main" className="hidden sm:block">
          <Suspense fallback={<NavLinkList currentPath={null} variant="bar" />}>
            <NavLinks variant="bar" />
          </Suspense>
        </nav>
        {/* COL-03 (Phase 2) makes this count live from the favourites store (D-03). */}
        <p className="ml-auto min-w-[12ch] rounded-full border border-border-ui bg-surface px-3 py-1 text-center text-sm leading-normal font-bold text-text">
          0 collected
        </p>
        {/* Task 2 adds the mobile menu here. */}
      </div>
    </header>
  );
}
