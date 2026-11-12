---
phase: 01-foundation-browse
plan: 06
subsystem: data
tags: [typescript, node-test, tanstack-query, species-filter, pagination, live-region, intl]

requires:
  - phase: 01-foundation-browse
    provides: "Plan 01-01 API layer: Character/CharacterPage/CharacterListParams types, fetchCharacterPage (null = 404), ApiError"
  - phase: 01-foundation-browse
    provides: "Plan 01-03 Filters/Species/toListParams and QueryClient defaults (queryDefaults, shouldRetry, makeQueryClient, ONE_HOUR)"
provides:
  - "exactSpecies and deriveTotal: exact, case-sensitive species matching and the derived Human total (BRW-04)"
  - "fetchBrowseStep, flattenSteps, STEP_TARGET (20), STEP_MAX_API_PAGES (4), BrowseStep, FetchPage: load-step fill loop with the DATA-03 404 rules, abort checks and id de-duplication"
  - "formatCount, countText, countAnnouncement, moreLoadedAnnouncement, EMPTY_HEADING: every count and live-region string (BRW-07, BRW-08)"
  - "lib/query/client.test.ts: DATA-05 defaults and retry policy pinned by tests"
affects: [01-05, 01-07, 01-08, 01-09, 01-10]

actuals:
  tokens: 5100
  tasks: 2
  commits: 4
plan_head_before: 257e9005495ab79613f2f7af292ac33925c854c0
plan_head_after: 778bc24cb76ef8f48092c8946ee2e93419532879

tech-stack:
  added: []
  patterns:
    - "Policy as pure, injectable functions: fetchPage is passed into fetchBrowseStep so node --test stubs it"
    - "Type-only imports use import type (single-line for api/types.ts); inline type specifiers beside the value import of toListParams"
    - "One shared Intl.NumberFormat('en') instance for every visible and announced number"

key-files:
  created:
    - lib/browse/species.ts
    - lib/browse/species.test.ts
    - lib/browse/steps.ts
    - lib/browse/steps.test.ts
    - lib/browse/announce.ts
    - lib/browse/announce.test.ts
    - lib/query/client.test.ts
  modified: []

key-decisions:
  - "Kept the RESEARCH A4 interpretation: one load step fills to at least 20 exact items with a 4 API page cap (reversible, confined to fetchBrowseStep)"
  - "deriveTotal returns 0 whenever firstCount is 0, before the Human/humanoid branch, so an empty result never waits on a humanoid count"
  - "A page-1 404 is detected as startPage === 1 on the first call of the step; a 404 on the first call of a later step returns no items and ends the list"
  - "moreLoadedAnnouncement formats the added count with formatCount, so 1500 reads '1,500 more characters loaded'"

patterns-established:
  - "Step cap plus abort check between sub-requests bound request bursts per user action (T-01-15)"
  - "Count text and announcement text come from one module, so the visible line and the live region cannot drift"

requirements-completed: []

coverage:
  - id: D1
    description: "Exact-species filtering and derived Human total (366 = 434 - 68, 73 = 80 - 7), null until the humanoid count is known, never negative"
    requirement: "BRW-04"
    verification:
      - kind: unit
        ref: "lib/browse/species.test.ts (node --test, 10 cases)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Load-step fill loop: 20-item target, 4 API page cap, page-1 and later-page 404 rules, abort between sub-requests, RangeError on a bad startPage, id de-duplication"
    requirement: "DATA-03"
    verification:
      - kind: unit
        ref: "lib/browse/steps.test.ts (node --test, 14 cases)"
        status: pass
      - kind: integration
        ref: "live one-liner: fetchBrowseStep(Human, page 1) printed 'LIVE STEP OK items=36 nextPage=3' using 2 requests, no Humanoid"
        status: pass
    human_judgment: false
  - id: D3
    description: "Count line and live-region strings: zero/one/many, empty-state announcement instead of '0 characters', en thousands separators, real added count"
    requirement: "BRW-07"
    verification:
      - kind: unit
        ref: "lib/browse/announce.test.ts (node --test, 8 cases)"
        status: pass
    human_judgment: false
  - id: D4
    description: "QueryClient defaults (staleTime >= 1 h, gcTime > staleTime, no focus/reconnect refetch, networkMode always) and retry policy"
    requirement: "DATA-05"
    verification:
      - kind: unit
        ref: "lib/query/client.test.ts (node --test, 11 cases)"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-11-12
status: complete
---

# Phase 1 Plan 06: Browse data policies Summary

**Exact-species load steps (fill to 20, 4 API page cap, DATA-03 404 rules), the derived Human total, id de-duplication and every count and announcement string as pure unit-tested functions, plus tests pinning the DATA-05 QueryClient defaults; a live Human step returned 36 exact items in 2 requests.**

## Performance

- **Duration:** about 12 min (start time was not captured at launch; derived from the first RED commit at 09:54 and the last task commit at 09:59, UTC+8)
- **Completed:** 2026-11-12
- **Tasks:** 2 (Task 1 tracer, Task 2 auto, both TDD)
- **Files modified:** 7 created, 0 modified

## Accomplishments

- `lib/browse/species.ts`: `exactSpecies` drops Humanoid for the Human chip (case-sensitive); `deriveTotal` gives Human = first count minus humanoid count, clamped at 0, null until the humanoid count is known, `firstCount` for every other species.
- `lib/browse/steps.ts`: `fetchBrowseStep` reads API pages until it holds 20 exact items, the API has no next page, or 4 pages were read. A page-1 404 is the empty state; a later 404 ends the list and keeps the items. `flattenSteps` de-duplicates by id. The tracer proof against the live API returned 36 Human items (none Humanoid) with count 434 and nextPage 3.
- `lib/browse/announce.ts`: `"1 character"` / `"826 characters"` / `"1,234 characters"` via one `Intl.NumberFormat("en")`; zero announces `"No characters in this dimension"` instead of `"0 characters"`; `"{n} more characters loaded"` uses the number actually added.
- `lib/query/client.test.ts` locks the DATA-05 defaults and the retry policy (network and 5xx once, never 4xx, parse or abort).
- Full suite: `npm test` 105 pass, 0 fail; `npx tsc --noEmit` and `npm run lint` clean.

## Task Commits

1. **Task 1: Exact-Human load step (tracer, TDD)**
   - RED `16c4747` (test): 24 cases, 18 fail on assertions against skeleton exports; the classifier returned `RED_EVIDENCE_OK`
   - GREEN `3891d1e` (feat): species.ts and steps.ts implemented, 24/24 pass, live step OK
2. **Task 2: Count and announcement strings, QueryClient tests (TDD)**
   - RED `520e3a4` (test): 7 of the announce cases fail on assertions; the client tests pass at once because they pin code already shipped in 01-03
   - GREEN `778bc24` (feat): announce.ts implemented, 19/19 pass

**Plan metadata:** committed separately as `docs(01-06)` after this summary.

## Files Created/Modified

- `lib/browse/species.ts`, `lib/browse/species.test.ts` - exact matching and derived total, 10 cases
- `lib/browse/steps.ts`, `lib/browse/steps.test.ts` - fill loop and flattening, 14 cases with synthetic page fixtures
- `lib/browse/announce.ts`, `lib/browse/announce.test.ts` - strings, 8 cases
- `lib/query/client.test.ts` - DATA-05 defaults and retry policy, 11 cases

## TDD Gate Compliance

Each task has a `test(01-06)` commit followed by a `feat(01-06)` commit. No refactor commits were needed.

- **RED semantic assessment, Task 1:** target `exactSpecies keeps only exact Human and drops Humanoid` ran and failed on its assertion (actual ids `[1,2,3,4,5]`, expected `[1,3]`); the skeleton returned wrong values on purpose so the suites linked and no failure came from import or syntax errors.
- **RED semantic assessment, Task 2:** target `countText reads zero, one and many` ran and failed on its assertion (actual `'0'`, expected `'0 characters'`). `lib/query/client.test.ts` had no failing target: it characterizes `queryDefaults` and `shouldRetry` from plan 01-03, which the plan asks to pin, so an immediate green there is expected, not a broken test.

## Decisions Made

- Kept the fill-to-20 load-step interpretation (RESEARCH A4, flagged in the plan as reversible). Strict per-page loading would change only `fetchBrowseStep`.
- `deriveTotal` short-circuits `firstCount === 0` to 0 before the Human branch.
- `fetchBrowseStep` rejects (async) with `RangeError` for a bad `startPage` rather than throwing synchronously, which is the same contract for callers using `await` or TanStack's `queryFn`.

## Deviations from Plan

None in behaviour. Two small points:

- The RED commits include skeleton exports (wrong-valued stubs) so the new test files link under `node --test`; without them the failure would be a link error, which the TDD reference classes as INVALID_RED. The GREEN commits replace them.
- `steps.ts` carries its `import type { Character, CharacterListParams, CharacterPage } from "../api/types.ts"` on one line because the plan's acceptance grep (`^import type .* from`) is single-line.

**Total deviations:** 0 auto-fixed. **Impact:** none.

## Authentication Gates

None.

## Issues Encountered

- `requirements.ready-ids` reported all four IDs (BRW-04, BRW-07, DATA-03, DATA-05) as blocked, because sibling plans in this phase also declare them and have no SUMMARY yet. Following the tool, none were marked complete here (`requirements-completed: []`); they become ready when the last declaring plan finishes.
- The live one-liner prints a Node `MODULE_TYPELESS_PACKAGE_JSON` warning on stderr (package.json has no `"type"`). It is harmless and pre-existing; the plan's verify command passes.

## Known Stubs

None. The RED-phase skeletons were replaced in the GREEN commits.

## Threat Flags

None. T-01-15 (request bursts) is mitigated by the 4-page cap, the abort check between sub-requests and the unit-tested cap. T-01-16 (species matching) is mitigated by exact comparison against allow-listed chip values only.

## Next Phase Readiness

Plans 01-08 and 01-10 can wire `fetchBrowseStep`, `flattenSteps`, `deriveTotal` and the announce helpers into `browseOptions` and the UI. The `browseOptions` code should pass `fetchCharacterPage` as `fetchPage`, and the humanoid-count request is the caller's job (`deriveTotal` takes it as input).

## Self-Check: PASSED

- All 7 created files exist on disk.
- Commits `16c4747`, `3891d1e`, `520e3a4`, `778bc24` are ancestors of HEAD.
- `node --test` on the four plan test files, `npm test` (105 pass, 0 fail), `npx tsc --noEmit` and `npm run lint` all exit 0.
- Acceptance greps (`STEP_MAX_API_PAGES = 4`, `STEP_TARGET = 20`, `humanoidCount`, `import type ... "../api/types.ts"`, `Intl.NumberFormat("en")`, `No characters in this dimension`) all match.
