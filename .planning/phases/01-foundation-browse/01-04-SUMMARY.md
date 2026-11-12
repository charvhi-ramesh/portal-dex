---
phase: 01-foundation-browse
plan: 04
subsystem: ui
tags: [nextjs, header, navigation, focus-management, mobile-menu, accessibility, inert, matchmedia]

requires:
  - phase: 01-foundation-browse
    provides: "Plan 01-02 dark shell: root layout with skip link, Providers seam, main#main-content, footer#site-footer, scripts/smoke.ts"
provides:
  - "Sticky 64 px Header (server component): text wordmark, Browse/Collection nav with aria-current, '0 collected' counter pill with min-width 12ch"
  - "NavLinkList (presentational, Suspense fallback) and NavLinks (usePathname wrapper), NAV_ITEMS"
  - "RouteFocus: focuses the first visible '#main-content h1' after pathname changes only, skips the first load, preventScroll, up to 5 rAF retries"
  - "MobileMenu: 44 px hamburger plus modal dialog 'Main menu' with focus trap, Escape, outside pointerdown, route-change and 640 px close, inert main and footer while open"
  - "useMediaQuery via useSyncExternalStore"
affects: [01-05, 01-06, 01-07, 01-08, 01-09, 01-10, phase-02, phase-03]

actuals:
  tokens: 2700
  tasks: 2
  commits: 2
plan_head_before: 71fd04e3b3c2e05bddcd6ba7336082426c930ff2
plan_head_after: f6e63c342824b42446c567400c9c046eb7635546

tech-stack:
  added: []
  patterns:
    - "Every usePathname consumer in the root layout sits inside Suspense with a presentational fallback"
    - "Open state derived from (openPath === pathname && !isDesktop); no effect-driven setState"
    - "inert applied imperatively to #main-content and #site-footer in an effect with cleanup"

key-files:
  created:
    - components/layout/header.tsx
    - components/layout/nav-links.tsx
    - components/layout/route-focus.tsx
    - components/layout/mobile-menu.tsx
    - components/layout/use-media-query.ts
  modified:
    - app/layout.tsx

key-decisions:
  - "Menu panel and overlay transition `opacity` and `translate` (not `transform`), because Tailwind 4 translate utilities set the individual `translate` property"
  - "A guarded render-phase setOpenPath(null) clears a stale open request so narrowing the window again never reopens the menu"
  - "A menu link that navigates hands focus to the new h1 (RouteFocus) rather than back to the hamburger"

patterns-established:
  - "Focus-to-h1 keyed on pathname only; hidden Activity routes ignored via getClientRects"
  - "Dialog panel and overlay stay mounted and flip display discretely after the exit transition (transition-discrete plus starting:)"

requirements-completed: [FND-02, FND-04, FND-05, FND-06]

coverage:
  - id: D1
    description: "Sticky header with wordmark, Browse/Collection nav (aria-current on the current link) and '0 collected' counter in the served HTML"
    requirement: "FND-02"
    verification:
      - kind: integration
        ref: "node scripts/smoke.ts route:/collection aria-current=\"page\" \"0 collected\" aria-label=\"Main\" route:/ \"Portal Dex\" \"0 collected\" (SMOKE OK)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Header visual layout: 64 px sticky bar, current-link underline, counter pill, no overlap or horizontal scroll at 320 px, DOM/Tab order"
    requirement: "FND-02"
    verification: []
    human_judgment: true
    rationale: "Visual overlap, sticky behaviour and Tab order need a real browser; no browser automation in Phase 1"
  - id: D3
    description: "Per-page document title via root template (Collection · Portal Dex) in the served HTML"
    requirement: "FND-06"
    verification:
      - kind: integration
        ref: "node scripts/smoke.ts route:/collection \"Collection · Portal Dex\" (SMOKE OK)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Focus moves to the new page h1 after a client-side header link click, and never on typing or chip changes"
    requirement: "FND-06"
    verification: []
    human_judgment: true
    rationale: "Runtime focus behaviour after client navigation needs a real browser"
  - id: D5
    description: "Mobile menu markup (hamburger with aria-controls and Open menu label, Main menu dialog) in the served HTML"
    requirement: "FND-04"
    verification:
      - kind: integration
        ref: "node scripts/smoke.ts route:/ \"aria-controls=\\\"mobile-menu\\\"\" \"Open menu\" \"Main menu\" (SMOKE OK)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Mobile menu behaviour: focus moves to first link, Tab/Shift+Tab trap, page behind inert, Escape and outside tap close with focus on hamburger, link follow closes and focuses h1, widening closes, animation"
    requirement: "FND-04"
    verification: []
    human_judgment: true
    rationale: "Focus trapping, focus return, inert behaviour and animation need a real browser"
  - id: D7
    description: "No focused element hidden under the sticky header (scroll-padding-top 80 px with header in place)"
    requirement: "FND-05"
    verification: []
    human_judgment: true
    rationale: "Obscured-focus check needs a real browser; scroll-padding-top 80 px was set in plan 01-02"

duration: 12min
completed: 2026-11-12
status: complete
---

# Phase 1 Plan 04: Header, Route Focus and Mobile Menu Summary

**Sticky text-wordmark header with aria-current nav and a "0 collected" pill, pathname-keyed focus-to-h1 after client navigation, and a focus-trapped inert modal mobile menu built on useSyncExternalStore with no effect-driven setState**

## Performance

- **Duration:** about 12 min (start time was not captured at spawn; approximated from the commit ledger and wall clock)
- **Completed:** 2026-11-12T01:48Z
- **Tasks:** 2
- **Files modified:** 6 (5 created, 1 modified)

## Accomplishments

- Every page now has a sticky 64 px header: "Portal Dex" wordmark linking to `/`, Browse and Collection links (current one gets `aria-current="page"`, bold, 2 px blue underline), and a `0 collected` pill that reserves `min-w-[12ch]` (D-03; a code comment names COL-03 as the Phase 2 requirement that makes it live).
- `RouteFocus` moves focus to the first rendered `#main-content h1` after pathname changes, never on first load, never on query-string changes (it does not read the query-string hook), with `preventScroll` and up to 5 animation-frame retries.
- `MobileMenu` is a labelled modal dialog ("Main menu") with Escape, outside-pointerdown, route-change and 640 px-or-wider close, a Tab cycle over the hamburger plus links, and `inert` on `#main-content` and `#site-footer` removed in effect cleanup (T-01-10 mitigated).
- The plan-end slow gate passed: `npm run build` succeeded and the smoke run printed `SMOKE OK` for all ten checks.

## Task Commits

1. **Task 1: Header with wordmark, nav and counter, and focus-to-h1 on client navigation (tracer)** - `25d40ba` (feat)
2. **Task 2: Accessible mobile menu** - `f6e63c3` (feat)

**Plan metadata:** recorded in the docs commit that follows this summary.

Tracer gate: `HUMAN_VERIFY_MODE` is end-of-phase and the tracer `<verify>` is automated-only, so `npm test && npx tsc --noEmit && npm run lint` was re-run after Task 1 and passed before Task 2 started. Tracer verified end-to-end, expanding.

## Verification Results

| Check | Result |
|-------|--------|
| `npm test` | 62 pass, 0 fail (after each task) |
| `npx tsc --noEmit` | clean (after each task) |
| `npm run lint` | exit 0, no output (after each task) |
| Task 1 acceptance greps (aria-current, usePathname, "#main-content h1", preventScroll, sticky, "0 collected", min-w-[12ch]; no useSearchParams) | all PASS |
| Task 2 acceptance greps (role dialog, aria-modal, aria-controls, Escape, pointerdown, site-footer, useSyncExternalStore, "min-width: 640px") | all PASS |
| Slow gate: `npm run build` | success, 4 static routes (/, /_not-found, /browse, /collection) |
| Slow gate: smoke on /collection and / | 10 PASS lines, final line `SMOKE OK` |

## Human-check items (not run; harvested into end-of-phase UAT)

These need a real browser and were not skipped silently. Run `npm run build`, then `node node_modules/next/dist/bin/next start -p 3000`:

1. At 375 px on `/`: Tab to the hamburger, Enter. Expect the menu to open with focus on "Browse".
2. Press Tab and Shift+Tab repeatedly. Expect focus to cycle only between the two links and the hamburger, and the page behind must not be tabbable.
3. Press Escape, then reopen and tap the dimmed area. Expect both to close the menu with focus back on the hamburger.
4. Reopen and choose "Collection". Expect the menu to close, focus on the "Your collection" h1, tab title "Collection · Portal Dex".
5. Reopen and widen the window past 640 px. Expect the menu to close; then narrow again and expect it to stay closed.
6. At 1280 px: Tab from the top through the header into the page, click "Collection" in the header, press Back. Expect no focused element hidden under the sticky header, focus on the h1 after each navigation, and header order wordmark, Browse, Collection, counter (desktop) / wordmark, counter, hamburger (mobile).
7. At 320 px: the wordmark, counter and hamburger sit on one row, nothing overlaps, no horizontal scroll.
8. Visual: the menu fade and slide (200 ms; opacity only at 100 ms under reduced motion) animate on both open and close.

Flagged assumptions from the plan (FND-04 close triggers and focus handoff on link follow; FND-06 first-load, Back/Forward and Activity behaviour) remain unconfirmed until UAT.

## Files Created/Modified

- `components/layout/header.tsx` - sticky server-component header with wordmark, desktop nav in Suspense, counter pill and mobile menu slot
- `components/layout/nav-links.tsx` - `NAV_ITEMS`, presentational `NavLinkList` (bar and menu variants) and `usePathname` wrapper `NavLinks`
- `components/layout/route-focus.tsx` - `RouteFocus` focus-to-visible-h1 effect keyed on pathname
- `components/layout/mobile-menu.tsx` - `MobileMenu` hamburger, overlay and dialog, plus `MenuButtonFallback`
- `components/layout/use-media-query.ts` - `useMediaQuery` using `useSyncExternalStore`
- `app/layout.tsx` - renders `<Header />` inside Providers before main and `<Suspense fallback={null}><RouteFocus /></Suspense>` in body

## Decisions Made

- Transition `translate` instead of `transform` on the panel (see Deviation 1).
- Clear a stale open request with a guarded render-phase update (see Deviation 2).
- Followed the plan for focus on link follow: the route change closes the menu by derivation and RouteFocus takes focus to the new h1. React runs all passive-effect cleanups before any new effects in a commit, so `inert` is removed from `#main-content` before RouteFocus tries to focus, and its retry loop covers any remaining gap.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Panel transition listed `transform` but Tailwind 4 animates the `translate` property**
- **Found during:** Task 2 (mobile menu)
- **Issue:** The plan specifies `transition-[opacity,transform,display]` with `-translate-y-2`. In Tailwind 4 the `translate-y-*` utilities set the individual `translate` CSS property, not `transform`, so a `transform`-only transition list would leave the slide un-animated (it would jump while opacity fades).
- **Fix:** Used `transition-[opacity,translate,display]` on the panel. Opacity and translate remain the only animated properties (display flips discretely), so the CLAUDE.md "only transform and opacity" intent holds. The overlay uses `transition-[opacity,display]`.
- **Files modified:** `components/layout/mobile-menu.tsx`
- **Verification:** lint, tsc and build pass; the actual animation is in the human-check list (item 8).
- **Committed in:** `f6e63c3`

**2. [Rule 1 - Bug] Stale open request could reopen the menu after widen-then-narrow**
- **Found during:** Task 2 (mobile menu)
- **Issue:** With `open` derived from `openPath === pathname && !isDesktop`, widening the window past 640 px closes the menu but leaves `openPath` set, so narrowing again on the same route would reopen it unprompted.
- **Fix:** Added a guarded render-phase update, `if (openPath !== null && !open) setOpenPath(null)`, so the stale request is discarded as soon as the derived state closes. It is not inside an effect and is conditional, so `react-hooks/set-state-in-effect` and `set-state-in-render` stay clean (lint exit 0).
- **Files modified:** `components/layout/mobile-menu.tsx`
- **Verification:** lint, tsc and build pass; behaviour is in human-check item 5.
- **Committed in:** `f6e63c3`

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both are correctness fixes inside the planned design. No scope creep and no architectural change.

## Issues Encountered

- The smoke run prints a Node `MODULE_TYPELESS_PACKAGE_JSON` warning for `scripts/smoke.ts` (the script is reparsed as an ES module). It is harmless, pre-existing from plan 01-02 and out of scope; adding `"type": "module"` to package.json would affect the whole project, so it was left alone.
- The spawn-time start timestamp was not captured, so the duration above is approximate.

## Known Stubs

- `components/layout/header.tsx`: the counter is the literal `0 collected`. Intentional (D-03): the favourites store arrives in Phase 2 and COL-03 makes the count live. Not a goal-blocking stub for this plan.

## Threat Flags

None. The plan introduces no new endpoints, auth paths or trust boundaries; nav hrefs are a static constant list (T-01-11, accepted).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Header, RouteFocus and the mobile menu are in place for plan 01-05. The header's Collection link gives the Back-navigation spike (end of 01-05) a client-side way to leave `/browse`.
- Open items for UAT: the eight human-check steps above and the plan's two flagged FND-04 / FND-06 assumptions.

## Self-Check: PASSED

- Files found: header.tsx, nav-links.tsx, route-focus.tsx, mobile-menu.tsx, use-media-query.ts, app/layout.tsx
- Commits found on the branch: 25d40ba, f6e63c3

---
*Phase: 01-foundation-browse*
*Completed: 2026-11-12*
