"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NavLinks } from "./nav-links";
import { useMediaQuery } from "./use-media-query";

const BUTTON_CLASSES =
  "inline-flex size-11 items-center justify-center rounded-full text-text transition-transform duration-150 hover:bg-surface-raised active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 sm:hidden";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

// Closed hamburger markup for the Suspense fallback: no handlers, same box.
export function MenuButtonFallback() {
  return (
    <button
      type="button"
      aria-expanded={false}
      aria-controls="mobile-menu"
      aria-label="Open menu"
      className={BUTTON_CLASSES}
    >
      <MenuIcon open={false} />
    </button>
  );
}

// FND-04: hamburger plus a modal dialog. Closes on Escape, outside tap, link activation,
// route change and viewport >= 640 px; traps Tab; keeps the page behind inert while open (T-01-10).
export function MobileMenu() {
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const [openPath, setOpenPath] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Derived: a route change or a wide viewport closes the menu with no effect-driven setState.
  const open = openPath !== null && openPath === pathname && !isDesktop;

  // Forget a stale open request, so narrowing the window again never reopens the menu.
  if (openPath !== null && !open) setOpenPath(null);

  useEffect(() => {
    if (!open) return;
    const button = buttonRef.current;
    const panel = panelRef.current;
    if (!button || !panel) return;

    const inertTargets = ["main-content", "site-footer"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    for (const el of inertTargets) el.setAttribute("inert", "");

    const links = Array.from(panel.querySelectorAll<HTMLElement>("a[href]"));
    links[0]?.focus();

    const closeAndRestoreFocus = () => {
      setOpenPath(null);
      button.focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeAndRestoreFocus();
        return;
      }
      if (event.key !== "Tab") return;
      // Cycle through the hamburger and the panel's links only.
      const order = [button, ...links];
      const index = order.indexOf(document.activeElement as HTMLElement);
      const step = event.shiftKey ? -1 : 1;
      const fallback = event.shiftKey ? order.length - 1 : 1;
      const next = index === -1 ? fallback : (index + step + order.length) % order.length;
      event.preventDefault();
      order[next].focus();
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panel.contains(target) || button.contains(target)) return;
      closeAndRestoreFocus();
    };

    // Activating any link closes the menu. A route change alone is not enough: a link to
    // the current route (for example /browse?q=x to /browse) leaves the pathname
    // unchanged, so the menu would stay open and the page behind it inert. Focus goes to
    // the hamburger; on a real route change RouteFocus then moves it to the new h1.
    const onPanelClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("a[href]")) return;
      closeAndRestoreFocus();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    panel.addEventListener("click", onPanelClick);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      panel.removeEventListener("click", onPanelClick);
      for (const el of inertTargets) el.removeAttribute("inert");
    };
  }, [open]);

  const onButtonClick = () => {
    if (open) {
      setOpenPath(null);
      buttonRef.current?.focus();
    } else {
      setOpenPath(pathname);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={onButtonClick}
        className={BUTTON_CLASSES}
      >
        <MenuIcon open={open} />
      </button>
      {/* Visual dimmer only: outside taps are handled by the document pointerdown listener. */}
      <div
        aria-hidden="true"
        className={`fixed inset-x-0 top-16 bottom-0 z-40 bg-bg/60 transition-[opacity,display] transition-discrete duration-200 ease-out starting:opacity-0 motion-reduce:duration-100 sm:hidden ${
          open ? "block opacity-100" : "hidden opacity-0"
        }`}
      />
      <div
        ref={panelRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        inert={!open}
        className={`fixed inset-x-0 top-16 z-50 rounded-b-2xl border-b border-divider bg-surface p-6 transition-[opacity,translate,display] transition-discrete duration-200 ease-out starting:-translate-y-2 starting:opacity-0 motion-reduce:translate-y-0 motion-reduce:duration-100 motion-reduce:starting:translate-y-0 sm:hidden ${
          open ? "block translate-y-0 opacity-100" : "hidden -translate-y-2 opacity-0"
        }`}
      >
        <NavLinks variant="menu" />
      </div>
    </>
  );
}
