---
phase: 01-foundation-browse
plan: 10
subsystem: ui
tags: [react, nextjs, tanstack-query, infinite-scroll, intersection-observer, a11y, live-region, focus-management]

requires:
  - phase: 01-foundation-browse
    provides: "Plan 01-08/01-09 BrowseView (useInfiniteQuery over load steps, LiveRegion, SkeletonGrid row variant)"
  - phase: 01-foundation-browse
    provides: "Plan 01-06 flattenSteps de-duplication, moreLoadedAnnouncement, 404-ends-the-list step logic"
  - phase: 01-foundation-browse
    provides: "Plan 01-05 CharacterGrid, article[tabindex=-1] cards, and the native-ok Back spike decision"
provides:
  - "LoadMore: Load more button, IntersectionObserver sentinel, end-of-list note, inline next-page error row"
  - "BrowseView next-step wiring: fetchNextPage handlers, focus hand-off effect, more-loaded announcement effect, appended skeleton row"
  - "CharacterGrid ref prop (React 19 regular prop) for the focus hand-off"
  - "BRW-11 confirmed through the native-ok route (no code, human-check recorded)"
affects: [phase-02-card-effects, phase-03-detail-collection]

actuals:
  tokens: 2890
  tasks: 3
  commits: 2
plan_head_before: 9b84d0420b20e2e70de7357fea7e4b9e2edeb81c
plan_head_after: 16d8ec6b8cbc3c61178184b0a034251fcbb53d2e

tech-stack:
  added: []
  patterns:
    - "Sentinel IntersectionObserver re-created per page and fetch state; callback reads the latest handler through a ref written in an effect"
    - "Button-started loads record pendingFocusIndex; a settle effect hands focus to the first new card, the inline Retry after a failure, or the end note when the button unmounted"
    - "Announcement baseline ref { key, pages, cards }: only a page-count increase under an unchanged filter key with at least one earlier page announces"
    - "Next-page error row stays mounted while Retry is in flight (aria-disabled), so focus is never dropped"

key-files:
  created:
    - components/browse/load-more.tsx
  modified:
    - components/browse/browse-view.tsx
    - components/browse/character-grid.tsx

key-decisions:
  - "Spike option applied: native-ok. use-browse-url.ts and use-scroll-memory.ts are untouched (the latter does not exist); Activity route retention plus the 2 h query cache cover BRW-11"
  - "onLoadMore takes a trigger argument ('button' | 'scroll') so BrowseView can set pendingFocusIndex for button presses only; scroll-triggered loads never move focus"
  - "The inline Retry also requests the focus hand-off, and a failed button-started load hands focus to the inline Retry, because the Load more button unmounts into the error row"

patterns-established:
  - "Focus and announcement bookkeeping lives in refs touched only in handlers and effects (react-hooks/refs clean)"
  - "Fixed copy constants for user-facing error text; API error text never reaches the screen"

requirements-completed: [BRW-08, BRW-09, BRW-11, DATA-03]

coverage:
  - id: D1
    description: "Infinite scroll via a 400 px sentinel observer plus a keyboard Load more button, no duplicate cards (flattenSteps), loading continues on tall screens"
    requirement: "BRW-08"
    verification:
      - kind: unit
        ref: "npm test (120 pass, includes flattenSteps and step tests from 01-06)"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit && npm run lint"
        status: pass
    human_judgment: true
    rationale: "Scroll-driven loading, observer re-creation on a 2560 px tall window and request behaviour need a browser; no browser automation in Phase 1"
  - id: D2
    description: "Focus hand-off to the first new card, aria-disabled Loading more... button, n more characters loaded announcements"
    requirement: "BRW-08"
    verification:
      - kind: unit
        ref: "lib/browse/announce.test.ts (moreLoadedAnnouncement)"
        status: pass
    human_judgment: true
    rationale: "Focus movement and screen reader announcements are only observable in a browser with assistive technology"
  - id: D3
    description: "End-of-list note replaces the button with no error or empty state; failed next-page load keeps cards, shows role=alert Retry row and pauses auto-loading"
    requirement: "DATA-03"
    verification:
      - kind: unit
        ref: "lib/browse/steps.test.ts (404 after page 1 ends the list)"
        status: pass
    human_judgment: true
    rationale: "Offline next-page failure and the visible end note need a browser with DevTools network throttling"
  - id: D4
    description: "Back from another route restores filters, loaded pages and scroll via the native-ok decision (no code)"
    requirement: "BRW-11"
    verification:
      - kind: other
        ref: "git diff --quiet HEAD -- components/browse/use-browse-url.ts"
        status: pass
    human_judgment: true
    rationale: "Back-navigation restore and cache hits can only be confirmed in a real browser; Phase 3 re-checks with the detail route"
  - id: D5
    description: "Production build and combined Phase 1 smoke check still serve /, /browse and /collection"
    verification:
      - kind: integration
        ref: "npm run build && node scripts/smoke.ts (slow gate and phase gate): SMOKE OK"
        status: pass
    human_judgment: false

duration: 10min
completed: 2026-11-12
status: complete
---

# Phase 1 Plan 10: Infinite scroll, Load more and Back restore Summary

**Infinite scroll with a per-page-recreated 400 px IntersectionObserver and a keyboard Load more button, focus hand-off to the first new card, real-count "n more loaded" announcements, a calm end-of-list note and an inline next-page error with Retry, with BRW-11 satisfied by the native-ok spike route (no history or scroll code).**

## Performance

- **Duration:** 10 min
- **Started:** 2026-11-12T03:24:51Z
- **Completed:** 2026-11-12T03:35:06Z
- **Tasks:** 3 (Task 3 is a verification-only task under native-ok and produced no commit)
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- `LoadMore` renders the secondary Load more button, a sentinel observer (`rootMargin: 0px 0px 400px 0px`) re-created when page count or fetch state changes, the "Loading more..." state with `aria-disabled`, the end note and the inline `role="alert"` error row.
- Auto-loading is paused while fetching and after a failure until Retry (T-01-23); the handler in `BrowseView` repeats the guard so a press racing the observer never starts a second request.
- Button presses and the inline Retry record `pendingFocusIndex`; a settle effect focuses the first new card, or the end note if nothing was added and the button unmounted, or the inline Retry if the load failed. Scroll-triggered loads never move focus.
- Every finished next step announces `{n} more characters loaded` with n = cards actually added; filter changes, the first page and first mounts are baselines and announce nothing.
- One row of skeleton cards (2/3/4/5 by breakpoint) is appended while the next step loads, gap-matched to the grid.
- Applied spike decision `native-ok` from 01-05-SUMMARY.md exactly as the plan's option table says: no scroll-memory hook, no router fallback.

## Applied spike option

**`native-ok`.** `components/browse/use-browse-url.ts`: unchanged (`git diff --quiet HEAD -- components/browse/use-browse-url.ts` exits 0). `components/browse/use-scroll-memory.ts`: not created. Reason: the native History API path from plan 01-03 plus Activity route retention (up to 3 routes) and the 2 h query cache already keep filters, every loaded page and the scroll offset across a trip to another route. Back and Forward (popstate) do not go through `applyFilters`, which is the only place cached pages are trimmed (BRW-10), so they stay intact. The user supplied no spike observations, so this decision rests on their option choice; the multi-page re-verification is a human check (below).

## Task Commits

1. **Task 1: Scrolling to the end of the grid loads the next load step with no duplicates (tracer)** - `63f6863` (feat). Tracer verified end-to-end (automated verify re-run, passes), then expanded.
2. **Task 2: Load more focus hand-off, "n more loaded" announcements, end note, inline next-page error and skeleton row** - `16d8ec6` (feat)
3. **Task 3: Back restore (apply the 01-05 spike decision)** - no commit: `native-ok` changes no code. Precondition met (01-05-SUMMARY.md has "Spike decision": `native-ok`).

**Plan metadata:** the docs commit that carries this SUMMARY, STATE.md, ROADMAP.md and REQUIREMENTS.md.

## Files Created/Modified

- `components/browse/load-more.tsx` - LoadMore, `NEXT_RETRY_ID`, `LoadTrigger` type; button, sentinel observer, end note, inline error row
- `components/browse/browse-view.tsx` - `loadMore`/`retryNextPage`, focus hand-off effect, more-loaded announcement effect, appended skeleton row, `<LoadMore>` wiring
- `components/browse/character-grid.tsx` - `ref` prop attached to the `ul`

## Decisions Made

- `onLoadMore` takes a trigger argument (`"button" | "scroll"`), a small widening of the plan's `onLoadMore(): void` contract. It is the only way a single callback can tell BrowseView whether to record `pendingFocusIndex`. Callers that ignore the argument still type-check.
- The inline Retry also requests the focus hand-off, and a failed button-started load moves focus to the inline Retry (the Load more button it came from unmounts into the error row). The plan only specified the card and end-note cases.
- The error row stays mounted while Retry is in flight (Retry `aria-disabled`), mirroring the first-page ErrorPanel, so focus is never lost; TanStack keeps `isFetchNextPageError` true until the retry succeeds.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical] Focus is kept when a button-started load fails**
- **Found during:** Task 2
- **Issue:** The plan's focus effect covered success and the end note only. A failed press unmounts the focused Load more button into the error row, which would drop focus to the document body for keyboard users.
- **Fix:** After a failed settle, focus moves to the inline Retry (`NEXT_RETRY_ID`); the Retry row stays mounted during the retry and the Retry press itself records the hand-off.
- **Files modified:** components/browse/load-more.tsx, components/browse/browse-view.tsx
- **Verification:** tsc, lint and acceptance greps pass; behaviour covered by the Task 2 human check (offline then Retry).
- **Committed in:** 16d8ec6

**2. [Rule 3 - Blocking] `onLoadMore` trigger argument**
- **Found during:** Task 1
- **Issue:** The contract `onLoadMore(): void` cannot distinguish a button press from an observer report, which Task 2's `pendingFocusIndex` rule needs.
- **Fix:** `onLoadMore(trigger: LoadTrigger)`.
- **Files modified:** components/browse/load-more.tsx, components/browse/browse-view.tsx
- **Committed in:** 63f6863

---

**Total deviations:** 2 auto-fixed (1 Rule 2, 1 Rule 3)
**Impact on plan:** Both are accessibility or wiring necessities with no scope creep.

## Verification Results

- Per-task fast loop (`npm test && npx tsc --noEmit && npm run lint`): pass after Task 1 and Task 2 (120 tests pass, 0 fail, tsc clean, eslint clean).
- All Task 1 and Task 2 acceptance greps: PASS. Task 3: `use-browse-url.ts` unchanged: PASS.
- **Slow gate** (`npm run build && node scripts/smoke.ts route:/browse "Browse characters" route:/collection "Your collection"`): build succeeded, `SMOKE OK`.
- **Phase gate** (full suite, `check-contrast.ts`, tsc, lint, build, combined smoke across /, /collection, /browse): 120 pass 0 fail, `CONTRAST OK`, tsc and lint clean, 24 smoke assertions PASS, last line `SMOKE OK`.
- The smoke runner starts and stops its own server; no server was left running by this plan.

## Human-check items (not run: no browser automation in Phase 1)

Run on a production build (`npm run build`, `node node_modules/next/dist/bin/next start -p 3000`):

1. **Task 2 (scroll, Load more, announcements, end, errors):** On /browse scroll to the bottom twice (each appends cards, no repeated character). Tab to Load more and press Enter: it reads "Loading more..." then focus lands on the first new card with the teal ring, and "20 more characters loaded" (or the real number) is announced. Search "rick" and load to the end: the note "You've reached the end of the dimension." replaces the button with no error. Reload /browse, load one step, go Offline, scroll to the bottom: all cards stay, "Couldn't load more characters." with Retry appears, no further requests until Retry; back online, Retry loads the step and focus lands on the first new card. A skeleton row shows while loading. On a 2560 px tall zoomed-out window loading continues until the viewport is filled.
2. **Task 3 (BRW-11, native-ok re-verification with several loaded pages):** On /browse press Alive, load at least three steps, note the top visible card, click "Collection" in the header, press Back: URL is /browse?status=Alive, all loaded steps present with no new network request, noted card near the top. Repeat on bare /browse. Repeat after visiting /, /collection, / before pressing Back three times. If scroll is not restored on the longer chain, that is the Phase 3 re-check noted in the spike decision; it is not a Phase 1 blocker by that decision.
3. **End-of-phase UAT:** the harvested `<human-check>` items from plans 01-02 to 01-10.

## Issues Encountered

- `python` is not available in this shell, so one planned scripted multi-edit was redone with the Edit tool. No effect on the result.
- Node prints a `MODULE_TYPELESS_PACKAGE_JSON` warning when running `scripts/smoke.ts`; harmless, pre-existing, out of scope.

## Known Stubs

None. No placeholder data or empty values flow to the UI in the files this plan touched.

## Threat Flags

None. No new endpoints, auth paths or storage; scroll events only trigger the existing, step-capped list request (T-01-23 mitigated). T-01-24 does not apply under `native-ok` (no router fallback, no scroll memory).

## Phase 1 requirement status at the last plan

`requirements.ready-ids` returned all four of this plan's IDs as ready and `requirements.mark-complete` marked BRW-08, BRW-09, BRW-11 and DATA-03 complete. After this plan, 24 Phase 1 requirement rows read Complete and one does not:

- **CARD-01** stays `Pending` by decision D-03: Phase 1 delivers the card front without the favourite star; the star ships with CARD-06 in Phase 2, so CARD-01 can only close then.

The human-check items above are still outstanding for the whole phase (browser-only evidence), which `/gsd-verify-work` will collect.

## Next Phase Readiness

- Phase 1 plans are all summarised; ready for `/gsd-verify-work` and the end-of-phase UAT of every `<human-check>`.
- Phase 3 should re-run the BRW-11 Back check with the detail route in the chain.

---
*Phase: 01-foundation-browse*
*Completed: 2026-11-12*

## Self-Check: PASSED

Files found: load-more.tsx, browse-view.tsx, character-grid.tsx, this SUMMARY. Commits found on this branch: 63f6863, 16d8ec6. All task acceptance greps and both gates pass.
