---
phase: 01-foundation-browse
plan: 09
subsystem: ui
tags: [react, nextjs, tanstack-query, skeleton, error-state, empty-state, a11y, suspense]

requires:
  - phase: 01-foundation-browse
    provides: "Plan 01-08 BrowseView (useInfiniteQuery over load steps, derived total, LiveRegion)"
  - phase: 01-foundation-browse
    provides: "Plan 01-05 CharacterCard box and CharacterGrid classes"
  - phase: 01-foundation-browse
    provides: "Plan 01-07 SearchField id browse-search, EMPTY_FILTERS, ResultsToolbar"
  - phase: 01-foundation-browse
    provides: "Plan 01-06 EMPTY_HEADING and the page-1 404 as an empty step"
provides:
  - "ErrorPanel: role=alert first-page failure panel, fixed copy only, offline wording, aria-disabled Retry"
  - "useOnlineStatus: navigator.onLine through useSyncExternalStore, server snapshot true"
  - "EmptyPanel: No characters in this dimension panel with Clear filters"
  - "CardSkeleton and SkeletonGrid (grid 10 items, row 5 items, CSS shows 4/6/8/10 and 2/3/4/5)"
  - "BrowseFallback: hook-free Suspense fallback, so the prerendered /browse shell holds the skeleton grid"
  - "BrowseView first-page state branching: error, loading, empty, grid"
affects: [01-10]

actuals:
  tokens: 4100
  tasks: 3
  commits: 3
plan_head_before: 6f4c4369a12628b57cf959ed945d43d91a296018
plan_head_after: d76f2e4e3de3a0c372d2f45fa0dff72f9633a16c

tech-stack:
  added: []
  patterns:
    - "Skeleton counts by plain CSS nth-child rules shared by the static fallback and the client view"
    - "Retry keeps the error panel mounted through a retryKey state keyed by filter set, because a data-less TanStack query resets to pending while it refetches"
    - "Skeleton box height-bearing parts mirror CharacterCard and are documented in a comment next to it"

key-files:
  created:
    - components/browse/error-panel.tsx
    - components/browse/use-online-status.ts
    - components/browse/empty-panel.tsx
    - components/card/card-skeleton.tsx
    - components/browse/browse-fallback.tsx
  modified:
    - components/browse/browse-view.tsx
    - components/browse/results-toolbar.tsx
    - app/browse/page.tsx
    - app/globals.css

key-decisions:
  - "Panel stays mounted during Retry (retryKey) instead of the plan's literal isFetching wiring, which would unmount the focused Retry button"
  - "Skeleton badge and species bars use the real card's measured-from-CSS heights (24.8 px and 20 px), not the plan's 29 px and 21 px"
  - "Error state blanks the count slot (new optional ResultsToolbar prop) instead of showing a Counting... that never resolves"
  - "BrowseFallback filter bar reserves a 320 px minimum computed from the bar's CSS, not measured in a browser"

patterns-established:
  - "First-page state precedence in BrowseView: error (no data and errored or retrying), then pending skeleton, then empty (no characters and no next page), then grid"

requirements-completed: [BRW-09, BRW-01]

coverage:
  - id: D1
    description: "First-page failure shows the error panel (offline or generic wording) with a Retry that refetches page 1; filters stay usable"
    requirement: "BRW-09"
    verification:
      - kind: other
        ref: "grep acceptance criteria; npm test && npx tsc --noEmit && npm run lint; npm run build"
        status: pass
    human_judgment: true
    rationale: "Offline detection, Retry behaviour and the single request on a double press need DevTools network conditions; no browser automation in Phase 1"
  - id: D2
    description: "No matches shows the empty panel with Clear filters, never the error panel, and renders no empty list"
    requirement: "BRW-01"
    verification:
      - kind: other
        ref: "grep acceptance criteria (EMPTY_HEADING, <EmptyPanel, browse-search); npm test && npx tsc --noEmit && npm run lint"
        status: pass
    human_judgment: true
    rationale: "Focus moving to the search field after Clear filters and the live API empty response need a browser"
  - id: D3
    description: "Loading shows card-sized skeletons (4/6/8/10 by breakpoint, opacity pulse, static 0.75 under reduced motion); the prerendered /browse shell contains the skeleton grid, the Counting... slot and an aria-busy region"
    requirement: "BRW-09"
    verification:
      - kind: other
        ref: "npm run build && node scripts/smoke.ts route:/browse \"Browse characters\" \"skeleton-grid\" \"Counting...\" \"aria-busy\" -> SMOKE OK; node scripts/check-contrast.ts -> CONTRAST OK"
        status: pass
    human_judgment: true
    rationale: "Pixel match of skeleton and card heights, absence of layout shift and the animation need a browser"

duration: 15min
completed: 2026-11-12
status: complete
---

# Phase 1 Plan 09: First-Page States (Error, Empty, Skeleton) Summary

**Browse now has its first-page states: an offline-aware error panel with a Retry that survives its own refetch, an empty panel with Clear filters, and card-sized skeletons that also ship in the prerendered /browse shell.**

## Performance

- **Duration:** about 15 min (start time was not captured; estimated)
- **Completed:** 2026-11-12T03:19Z
- **Tasks:** 3
- **Files:** 9 (5 created, 4 modified)

## Accomplishments
- `ErrorPanel` shows only fixed copy (offline: "You appear to be offline"; otherwise "Couldn't load characters"), never ApiError text (T-01-21). Retry uses `aria-disabled` while in flight and ignores presses (T-01-22).
- `BrowseView` branches: error (no data and errored or retrying), skeletons (pending), `EmptyPanel` (data, no characters, no next page), grid. A page-1 404 is an empty step (01-06), so it can only reach the empty branch. No empty `ul` is rendered for zero results.
- Clear filters runs `applyFilters(EMPTY_FILTERS, "push")` and focuses `#browse-search` on the next animation frame.
- `CardSkeleton` copies the card's outer box; `SkeletonGrid` is `aria-hidden` and CSS-limited per breakpoint (grid 4/6/8/10, row 2/3/4/5). Pulse animates opacity only (1 to 0.5 to 1 over 1.6 s), static at 0.75 under reduced motion.
- `BrowseFallback` (no hooks) is the Suspense fallback: reserved filter bar block, the real `ResultsToolbar` showing "Counting...", and the skeleton grid in an `aria-busy` region.

## Task Commits

1. **Task 1: Error panel with offline wording and Retry** (tracer) - `cc0ea60` (feat)
2. **Task 2: Empty panel with Clear filters** - `8dc4198` (feat)
3. **Task 3: Skeleton cards and prerendered fallback** - `d76f2e4` (feat)

Tracer gate: Task 1's automated verify (`npm test && npx tsc --noEmit && npm run lint`) is the only evidence it carries and had passed on the committed state; expansion continued. Tracer verified end-to-end.

**Plan metadata:** recorded in the docs(01-09) commit that follows this file.

## Files Created/Modified
- `components/browse/error-panel.tsx` - ErrorPanel (role=alert, aria-disabled Retry)
- `components/browse/use-online-status.ts` - useOnlineStatus via useSyncExternalStore
- `components/browse/empty-panel.tsx` - EmptyPanel with Clear filters
- `components/card/card-skeleton.tsx` - CardSkeleton, SkeletonGrid
- `components/browse/browse-fallback.tsx` - static Suspense fallback
- `components/browse/browse-view.tsx` - error, skeleton and empty branching, retry state, clearFilters
- `components/browse/results-toolbar.tsx` - optional `unavailable` prop (blank count slot)
- `app/browse/page.tsx` - fallback switched to `BrowseFallback`
- `app/globals.css` - skeleton-pulse keyframes and nth-child count rules

## Decisions Made
- Retry keeps the panel mounted through a `retryKey` (see deviation 1).
- Skeleton bars take their heights from the real card's CSS (see deviation 2).
- The error state blanks the count slot rather than showing "Counting..." (see deviation 3).
- The empty-panel and error-panel class strings are duplicated rather than shared: two usages, and the plan's acceptance greps expect `role="alert"`, `aria-disabled` and `EMPTY_HEADING` literally in their own files.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Retry would have unmounted its own button**
- **Found during:** Task 1
- **Issue:** The plan wires `retrying={isFetching}` while rendering the panel only when `isError && data === undefined`. TanStack v5 `fetchState` resets a data-less query to `status: "pending"` on refetch (confirmed in `node_modules/@tanstack/query-core/build/modern/query.js`), so the panel would be replaced by the skeleton the moment Retry is pressed: the focused button disappears, focus drops to the body, and `retrying` is never true.
- **Fix:** `BrowseView` stores `retryKey` (the filter key being retried), cleared when `refetch()` settles. While `retryKey === currentKey` with no data, the panel stays mounted with `retrying` true. A different filter key never inherits it. A second press while fetching is ignored both in the button and in `retry()`.
- **Files modified:** components/browse/browse-view.tsx
- **Verification:** typecheck, lint, tests; behaviour itself is a human-check item.
- **Commit:** cc0ea60

**2. [Rule 1 - Bug] Plan's skeleton bar heights do not match the real card**
- **Found during:** Task 3
- **Issue:** The plan specifies a 29 px badge bar and 21 px species bar, which assume line-height 1.5. The real card's badge is `text-sm leading-[1.2] py-1` (14 x 1.2 + 8 = 24.8 px) and its species line is `text-sm` (line-height calc(1.25 / 0.875) = 20 px); confirmed in the compiled CSS. Using 29 and 21 would make skeletons about 5.2 px taller than cards, which is exactly the layout shift the plan forbids.
- **Fix:** Bars use `h-[24.8px]` and `h-5`; the derivation is in a comment in `card-skeleton.tsx`.
- **Files modified:** components/card/card-skeleton.tsx
- **Verification:** arithmetic from the card's classes and compiled CSS; pixel match is a human-check item (not measured in a browser).
- **Commit:** d76f2e4

**3. [Rule 1 - Bug] "Counting..." next to the error panel**
- **Found during:** Task 1 (01-08 listed this as an interim state this plan supersedes)
- **Issue:** On a first-page failure `total` is null, so the toolbar would show "Counting..." forever beside "Couldn't load characters".
- **Fix:** `ResultsToolbar` gained an optional `unavailable` prop that renders an empty slot of the same 16ch width; `BrowseView` passes `showError`. Row height and layout are unchanged.
- **Files modified:** components/browse/results-toolbar.tsx (not in the plan's files list), components/browse/browse-view.tsx
- **Commit:** cc0ea60

### Plan assumption not verifiable here

**4. Filter bar reserved height is computed, not measured**
- The plan asks to "measure the real bar once". No browser is allowed in Phase 1, so `BrowseFallback` reserves `min-h-80` (320 px), derived from the bar's CSS: search 48 + gap 24 + 3 x 72 + 2 x 16. It is a minimum and identical at both breakpoint groups for single-row chips. At about 640 px the Species row may wrap (estimated 584 px of chips in a 592 px container), adding roughly 52 px and a one-time shift on hydration. Added to the human-check list.

**Total deviations:** 3 auto-fixed (all Rule 1), 1 unverifiable assumption recorded.
**Impact on plan:** behaviour matches the plan's must-haves; no new dependencies.

## Issues Encountered
- Node prints `MODULE_TYPELESS_PACKAGE_JSON` for `.ts` scripts; pre-existing, out of scope (same as 01-08).
- Plan 01-10 still owns the next-page inline error, Load more and the sentinel. The grid branch has no loader yet for a Human step that returns zero exact Humans with a next page; that is 01-10's territory.

## Human-check items (browser-only, not run; harvest into end-of-phase UAT)
Per the tasks' `<human-check>`: `npm run build`, then `node node_modules/next/dist/bin/next start -p 3000`.
1. Type "zzzz": the "No characters in this dimension" panel appears (not an error, no empty grid). Clear filters restores all characters with focus in the search box.
2. DevTools Network "Offline", load `/browse?q=morty` in a fresh tab: "You appear to be offline" with Retry; press Retry twice quickly: one request, the button keeps focus and stays on screen while retrying; set "No throttling", Retry: cards load.
3. Block `*rickandmortyapi.com/api/character?*` and reload: "Couldn't load characters" with Retry; the count slot is blank, never "Counting...", and empty and error panels never appear together.
4. "Slow 4G" at 320, 700, 1100, 1400 px: skeletons show before hydration, 4, 6, 8, 10 cards, pulsing; when cards arrive nothing jumps (checks the 24.8 and 20 px bars and the 320 px reserved filter bar, especially near 640 px). A chip change shows skeletons again while the filter bar stays put.
5. DevTools Rendering "prefers-reduced-motion: reduce": skeletons are static and slightly dimmed.
6. A 429 with an HTML body (rate limit) shows the generic error panel, never a crash or JSON parse error (needs a way to force a 429, for example a DevTools request override).

## Verification Run
- Per task: `npm test` (120 pass, 0 fail), `npx tsc --noEmit`, `npm run lint` clean; Task 3 also `node scripts/check-contrast.ts` ending `CONTRAST OK`; all acceptance_criteria greps pass for all three tasks.
- Slow gate: `npm run build && node scripts/smoke.ts route:/browse "Browse characters" "skeleton-grid" "Counting..." "aria-busy"` printed PASS for all four strings and `SMOKE OK`. The smoke runner starts and stops its own server; I started no other local server.

## Known Stubs

None.

## Threat Flags

None. The error panel is the T-01-21 and T-01-22 mitigation; no new network surface.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ready for 01-10 (Load more, infinite scroll, end note, inline next-page error): `SkeletonGrid variant="row"` and its CSS exist; `retry` and the error panel only cover the first page.

---
*Phase: 01-foundation-browse*
*Completed: 2026-11-12*
