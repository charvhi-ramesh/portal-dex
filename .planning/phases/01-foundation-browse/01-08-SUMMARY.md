---
phase: 01-foundation-browse
plan: 08
subsystem: ui
tags: [react, nextjs, tanstack-query, infinite-query, live-region, a11y, exact-species]

requires:
  - phase: 01-foundation-browse
    provides: "Plan 01-06 fetchBrowseStep, flattenSteps, deriveTotal, countAnnouncement"
  - phase: 01-foundation-browse
    provides: "Plan 01-03 Filters model (filtersKey, toListParams), fetchCharacterPage, QueryClient defaults"
  - phase: 01-foundation-browse
    provides: "Plan 01-07 BrowseView applyFilters and ResultsToolbar count prop"
provides:
  - "browseOptions(filters): infinite query over load steps, keyed by filtersKey, query signal forwarded to every sub-request"
  - "humanoidCountOptions(filters): count-only page-1 request for species=Humanoid under the same other filters, 404 gives 0"
  - "BrowseView derived total: exact-Human count behind Counting... (D-08)"
  - "useAnnouncer and LiveRegion: one always-mounted polite atomic region, ref-written, 500 ms settle"
affects: [01-09, 01-10]

actuals:
  tokens: 4400
  tasks: 2
  commits: 3
plan_head_before: 6ddc34f22ac9f6cca8a813a48c1eb29d26d7eb47
plan_head_after: 12e16c72b62c131c482e46e408a55fc13666db95

tech-stack:
  added: []
  patterns:
    - "queryFn runs the tested pure step function with the injected fetcher and the query signal"
    - "Type-only names imported with inline type specifiers in lib/ (Node type stripping keeps plain brace imports)"
    - "Announcement effect keyed on filter key and total, with a ref of the last announced key; text written to the DOM through a ref, never state"
    - "Total is null (Counting...) until final, so the raw Humanoid-inflated count can never reach the screen or the live region"

key-files:
  created:
    - lib/query/options.test.ts
    - components/browse/live-region.tsx
  modified:
    - lib/query/options.ts
    - components/browse/browse-view.tsx

key-decisions:
  - "Humanoid count failure keeps total null: the line stays on Counting... and nothing is announced, rather than showing the inflated number (flagged assumption from the plan)"
  - "A step's count comes from pages[0].count; humanoid query is enabled only for Human with firstCount > 0, so a zero-result Human search makes no extra request"
  - "Live region announce() is a stable useCallback so the BrowseView effect can list it as a dependency without re-firing"

patterns-established:
  - "Live-region writes go through useAnnouncer only; visible count text stays non-live"

requirements-completed: [BRW-04, BRW-07, DATA-05]

coverage:
  - id: D1
    description: "Human chip lists only exact Humans; short API pages are filled by load steps; count shows Counting... until the derived total is final"
    requirement: "BRW-04"
    verification:
      - kind: other
        ref: "lib/query/options.test.ts (Humanoid dropped, 4-page cap, same signal); lib/browse/steps and species tests from 01-06; npm test && npx tsc --noEmit && npm run lint"
        status: pass
    human_judgment: true
    rationale: "The visible Counting... to 366 transition and the absence of Humanoid cards while scrolling need a browser and the live API"
  - id: D2
    description: "Settled result count announced once per search or filter change from one polite atomic region; never interim, never Humanoid-inflated"
    requirement: "BRW-07"
    verification:
      - kind: other
        ref: "grep acceptance criteria (aria-live, aria-atomic, countAnnouncement, LiveRegion); npm run build && node scripts/smoke.ts route:/browse (prerender only)"
        status: pass
    human_judgment: true
    rationale: "Screen-reader output and debounce behaviour need assistive technology; no browser automation in Phase 1"
  - id: D3
    description: "Each filter set has its own query key and every API sub-request of a load step receives the query AbortSignal"
    requirement: "DATA-05"
    verification:
      - kind: test
        ref: "lib/query/options.test.ts#browseOptions queryFn drops Humanoid and forwards the same signal to every sub-request"
        status: pass
      - kind: test
        ref: "lib/query/options.test.ts#browseOptions keys differ when any single value differs"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-11-12
status: complete
---

# Phase 1 Plan 08: Exact-Species Steps, Derived Human Total and Settled Live Region Summary

**Browse now reads load steps with exact-species filtering, shows the Human total (API count minus Humanoid count) only once final behind "Counting...", and announces the settled count once through a ref-written polite live region.**

## Performance

- **Duration:** about 8 min
- **Completed:** 2026-11-12T03:03Z
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- `browseOptions(filters)` takes `Filters`, keys on `["characters","browse",filtersKey]`, and its queryFn runs `fetchBrowseStep` with `fetchCharacterPage` and the query signal, so each filter set caches separately and a superseded search cancels every sub-request.
- `humanoidCountOptions(filters)` fetches page 1 of the Humanoid filter set for `info.count` (404 gives 0), keyed so Human and Humanoid chips under the same other filters share one cached value.
- BrowseView flattens steps without duplicate cards, runs the humanoid query only for the Human chip after page 1 settles with `count > 0`, and passes `deriveTotal` output (null while unknown) to ResultsToolbar. Raw `firstCount` is never rendered.
- `useAnnouncer`/`LiveRegion`: always-mounted `aria-live="polite" aria-atomic="true"` sr-only div; `announce` debounces 500 ms, clears the text, rewrites 100 ms later (so identical strings repeat), and clears its timers on unmount.
- BrowseView announces once per settled filter key and never while the total is null.

## Task Commits

1. **Task 1: Human chip shows only exact Humans with the derived total behind "Counting..."** (tracer) - `bf81980` (feat)
2. **Task 2 test: query key, signal-forwarding and humanoid count tests** - `3546019` (test)
3. **Task 2 implementation: settled count through a single polite live region** - `12e16c7` (feat)

**Plan metadata:** recorded in the docs(01-08) commit that follows this file.

## TDD Gate Compliance

Task 2 carries `tdd="true"`, but its `<behavior>` bullets describe `lib/query/options.ts`, which the plan's tracer Task 1 had already implemented. The sequence is therefore not a clean RED then GREEN:

- **RED:** the `test(01-08)` commit `3546019` ran green on first execution (10 of 10 pass). This is the "unexpected GREEN" case and it was investigated: the behaviour exists because the plan orders implementation (Task 1) before its tests (Task 2). No RED evidence record or `check tdd-red-evidence` run was produced, and none could validly have been (no failing target).
- **Substitute evidence that the tests can fail:** a temporary mutation of `lib/query/options.ts` (signal replaced by a fresh `AbortController().signal`, `q` dropped from the browse key) made 4 of 10 tests fail (key inequality, the Human page-1 signal test, the sub-request signal test, the abort test). The file was restored byte-for-byte before commit (`git status` clean for lib/query/options.ts).
- **GREEN:** `12e16c7` (`feat(01-08)`) adds the live region and announcement wiring; it follows the `test(01-08)` commit and passes. The live region and BrowseView effect have no unit test (React and DOM, no test library allowed); they are covered by the human-check below.
- No REFACTOR commit.

## Files Created/Modified
- `lib/query/options.ts` - browseOptions over load steps, humanoidCountOptions
- `lib/query/options.test.ts` - 10 `node:test` cases (keys, queryFn URL and signal, abort, count, 404)
- `components/browse/live-region.tsx` - useAnnouncer hook and LiveRegion component
- `components/browse/browse-view.tsx` - useInfiniteQuery over steps, humanoid query, derived total, announcement effect, LiveRegion

## Decisions Made
- A failed Humanoid count request leaves the total null (plan's flagged assumption): the line keeps "Counting..." and nothing is announced, instead of showing a number that includes Humanoid.
- The humanoid query is `enabled` only for Human with `firstCount > 0`, so zero-result searches and every other chip make no extra request (T-01-19).
- `announce` is memoised with `useCallback` so the effect's dependency list does not retrigger announcements.

## Deviations from Plan

### Auto-fixed Issues

**1. [Minor] `getNextPageParam` and `queryFn` annotated explicitly**
- **Found during:** Task 1
- **Issue:** The plan's `getNextPageParam: (last) => last.nextPage` relies on type inference through `infiniteQueryOptions`. I did not test whether inference alone would have type-checked; I annotated up front so `pages` is certainly `BrowseStep` for `flattenSteps`.
- **Fix:** annotated the parameter and the `Promise<BrowseStep>` return, importing `BrowseStep` with an inline `type` specifier.
- **Files modified:** lib/query/options.ts
- **Commit:** bf81980

### Process deviation (not a code fix)

**2. [TDD] Task 2 RED was an unexpected green** - see "TDD Gate Compliance" above. Mutation check used instead; no RED evidence record exists.

**Total deviations:** 1 minor, 1 process deviation (TDD gate).
**Impact on plan:** None on behaviour; no new dependencies.

## Issues Encountered
- Interim state remaining for plan 01-09: when the infinite query errors with no data, `total` is null so the toolbar still shows "Counting..." next to the existing "Couldn't load characters." paragraph; the loading placeholder is still an empty `<ul aria-busy>`. Plan 01-09's error panel and skeletons supersede both.
- Node prints a `MODULE_TYPELESS_PACKAGE_JSON` warning when loading `.ts` files; pre-existing, not caused by this plan, and no `"type": "module"` was added (out of scope).

## Human-check items (browser-only, not run; harvest into end-of-phase UAT)
Per Task 2's `<human-check>`: `npm run build`, then `node node_modules/next/dist/bin/next start -p 3000`; open /browse with a screen reader (NVDA or Narrator) or watch the live region div in DevTools Elements.
1. Press Human: the count line shows "Counting..." briefly, then the exact-Human total (366 unfiltered at research time, never hardcoded). No Humanoid card appears while scrolling.
2. The region text becomes "366 characters" once and is never "434 characters" (Human plus Humanoid).
3. Press Alive, Dead, Alive quickly: one announcement, for the final state.
4. Type "zzzz": the region announces "No characters in this dimension".
5. Revisit a recently used filter set (including via Back): cached results show without a new network request; the Humanoid count request appears at most once per filter set (DevTools Network).

## Verification Run
- Per task: `npm test` (120 pass, 0 fail after Task 2), `npx tsc --noEmit`, `npm run lint` clean; `node --test lib/query/options.test.ts` 10 pass; `OPTIONS LINK OK` printed; all acceptance_criteria greps pass; `verbatimModuleSyntax` still true.
- Slow gate: `npm run build && node scripts/smoke.ts route:/browse "Browse characters"` finished with `SMOKE OK` (build prerenders /browse, PASS /browse Browse characters). No local server was started.

## Known Stubs

None added by this plan. The loading placeholder and error paragraph in BrowseView are pre-existing interim UI that plan 01-09 replaces.

## Threat Flags

None. The only new network surface is the count-only request already covered by T-01-19; query keys derive from `filtersKey` (T-01-20).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ready for 01-09: BrowseView exposes `query` (infinite) and `total`, `characters` is the exact-species flattened list, and the live region ref is in place for the "N more characters loaded" announcement.

---
*Phase: 01-foundation-browse*
*Completed: 2026-11-12*

## Self-Check: PASSED

Found: all 4 key files on disk; commits bf81980, 3546019 and 12e16c7 are ancestors of HEAD; all acceptance_criteria greps pass; slow gate SMOKE OK.
