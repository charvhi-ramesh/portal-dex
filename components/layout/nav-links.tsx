"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/browse", label: "Browse" },
  { href: "/collection", label: "Collection" },
] as const;

type Variant = "bar" | "menu";

function isCurrent(currentPath: string | null, href: string): boolean {
  if (currentPath === null) return false;
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

const VARIANT_CLASSES: Record<Variant, string> = {
  bar: "inline-flex min-h-11 items-center text-sm leading-normal",
  menu: "flex min-h-12 w-full items-center text-base leading-[1.2] font-bold",
};

// Presentational list. Also the Suspense fallback (currentPath null), so the nav is in the
// served HTML even when usePathname has to wait on a dynamic route.
export function NavLinkList({
  currentPath,
  variant,
}: {
  currentPath: string | null;
  variant: Variant;
}) {
  return (
    <ul className={variant === "bar" ? "flex items-center gap-4" : "flex flex-col"}>
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(currentPath, item.href);
        return (
          <li key={item.href} className={variant === "menu" ? "w-full" : undefined}>
            <Link
              href={item.href}
              aria-current={current ? "page" : undefined}
              className={`${VARIANT_CLASSES[variant]} ${
                current
                  ? "font-bold text-text underline decoration-blue decoration-2 underline-offset-4"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavLinks({ variant }: { variant: Variant }) {
  const pathname = usePathname();
  return <NavLinkList currentPath={pathname} variant={variant} />;
}
