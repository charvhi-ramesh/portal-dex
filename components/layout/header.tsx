import Link from "next/link";
import { Suspense } from "react";
import { CollectedCounter } from "./collected-counter";
import { MenuButtonFallback, MobileMenu } from "./mobile-menu";
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
        <CollectedCounter />
        <Suspense fallback={<MenuButtonFallback />}>
          <MobileMenu />
        </Suspense>
      </div>
    </header>
  );
}
