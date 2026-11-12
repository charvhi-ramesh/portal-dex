---
phase: 01-foundation-browse
plan: 03
subsystem: ui
tags: [nextjs, tanstack-query, url-state, history-api, filters, accessibility, node-test]

requires:
  - phase: 01-foundation-browse
    provides: "Plan 01-01 typed API client (fetchCharacterPage, ApiError), node:test harness, approved @tanstack/react-query 5.107.1"
  - phase: 01-foundation-browse
    provides: "Plan 01-02 dark shell, Providers seam, scripts/smoke.ts"
provides:
  - "QueryClient defaults and retry policy (DATA-05): staleTime 1 h, gcTime 2 h, no refetch on focus or reconnect, networkMode always, no retry on 4xx"
  - "browseOptions infinite-query factory that forwards the query AbortSignal"
  - "Providers now wraps children in QueryClientProvider (server per-request client, browser singleton)"
  - "/browse route: static h1 outside Suspense, BrowseView inside Suspense"
  - "Pure URL to Filters model with case-sensitive allow-lists (lib/browse/filters.ts) and 25 node:test cases"
  - "useBrowseUrl single seam for URL reads (useSearchParams) and history writes (native pushState/replaceState)"
  - "FilterGroup labelled aria-pressed toggle-chip group"
affects: [01-04, 01-05, 01-06, 01-07, 01-08, 01-09, 01-10]

actuals:
  tokens: 6500
  tasks: 2
  commits: 4
plan_head_before: db136aa1c0f456aa9162c6d9dc47c30b9de3ea2c
plan_head_after: 41250be0cf07c690f3aa62be88266c64e681ae97

tech-stack:
  added: ["@tanstack/react-query 5.107.1 (exact, user-approved in 01-01)"]
  patterns:
    - "lib/query/*.ts and lib/browse/filters.ts are React-free and use relative .ts imports with import type, so node --test loads them under type stripping"
    - "All Browse URL reads and writes go through useBrowseUrl; only buildBrowseUrl(window.location.pathname, filters) output is ever written to history (T-01-08)"
    - "Filters serialise in fixed key order q, status, gender, species so identical sets give identical URLs and query keys"
    - "Chips use stable keys and are never remounted on toggle, so focus stays on the pressed chip"

key-files:
  created:
    - lib/query/client.ts
    - lib/query/options.ts
    - app/browse/page.tsx
    - components/browse/browse-view.tsx
    - lib/browse/filters.ts
    - lib/browse/filters.test.ts
    - components/browse/use-browse-url.ts
    - components/browse/filter-group.tsx
  modified:
    - app/providers.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "Native History API behind useBrowseUrl (planning decision 3): a router.push/replace fallback touches only components/browse/use-browse-url.ts"
  - "filters.ts parse trims then caps q with Array.from(...).slice(0, 60) so a surrogate pair is never split; serialize and toListParams also trim q so a whitespace-only q sends no name param"

patterns-established:
  - "TDD for pure URL model: RED stubs commit (d635bac), GREEN implementation commit (e79cf63)"
  - "Chip styling per UI-SPEC: inactive surface plus border-ui, active blue fill with navy text, instant colour change, active:scale-[0.97] 150 ms with motion-reduce:transition-none"

requirements-completed: [DATA-05, BRW-03, BRW-06]

coverage:
  - id: D1
    description: "QueryClient defaults meet DATA-05: staleTime at least 1 h, gcTime above staleTime, no refetch on window focus or reconnect, networkMode always, and shouldRetry never retries 4xx or aborts"
    requirement: "DATA-05"
    verification:
      - kind: other
        ref: "node --input-type=module one-liner importing lib/query/client.ts and options.ts printed DEFAULTS OK; greps for networkMode and refetchOnWindowFocus exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Runtime dependencies are exactly next, react, react-dom and @tanstack/react-query at an exact semver; no test or motion library in devDependencies"
    verification:
      - kind: other
        ref: "DEPS OK 5.107.1 and devDependencies set check exit 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "URL filter model: allow-list rejection of junk params, q trim and 60 code point cap without splitting a surrogate pair, whitespace-only q omitted, fixed key order, one value per group toggle, round trip for awkward characters"
    requirement: "BRW-03"
    verification:
      - kind: unit
        ref: "node --test lib/browse/filters.test.ts (25 tests, 0 fail); npm test (62 tests, 0 fail)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Production build prerenders /browse with the h1 'Browse characters', the title 'Browse · Portal Dex' and the reserved aria-busy Suspense region (Cache Components accepts the useSearchParams boundary)"
    requirement: "BRW-06"
    verification:
      - kind: integration
        ref: "npm run build (exit 0, /browse static) && node scripts/smoke.ts route:/browse ... (3 PASS lines, SMOKE OK)"
        status: pass
    human_judgment: false
  - id: D5
    description: "In a real browser: real characters load, Alive writes /browse?status=Alive as a history push, refresh keeps aria-pressed true, pressing Alive again returns to /browse, and Back after Alive then Dead shows ?status=Alive from cache with no network request"
    requirement: "BRW-06"
    verification: []
    human_judgment: true
    rationale: "Client-rendered list, history entries and cache hits need a real browser; no browser automation is allowed in Phase 1 (planning decision 3). This also exercises flagged assumption A3 (native pushState integrated with useSearchParams), which the plan 01-05 spike confirms or rejects"

duration: not measured (resumed after the first executor died mid-run on a network error)
completed: 2026-11-12
status: complete
---

# Phase 1 Plan 03: Browse Walking Skeleton Summary

**/browse reads real characters through TanStack Query with the DATA-05 defaults, and a Status chip writes `?status=` to the URL through a native history push behind a single `useBrowseUrl` seam, backed by a 25-case unit-tested URL model that rejects junk params.**

## Performance

- **Duration:** not measured. The first executor died mid-run on a network error; this run resumed after Task 1 and the Task 2 RED commit.
- **Completed:** 2026-11-12
- **Tasks:** 2 (1 tracer, 1 auto with TDD)
- **Files modified:** 11 (8 created, 3 modified, of which package-lock.json is npm-generated)

## Accomplishments

- Task 1 tracer: `@tanstack/react-query` 5.107.1 installed exactly; `lib/query/client.ts` carries staleTime 3,600,000 ms, gcTime 7,200,000 ms, no refetch on focus or reconnect, `networkMode: "always"` and a `shouldRetry` that never retries aborts, 4xx (429 included) or parse errors and retries network or 5xx once. `browseOptions` forwards the query `AbortSignal`. `/browse` has its h1 outside Suspense and `BrowseView` inside it.
- Task 2: `lib/browse/filters.ts` implements every contracted export; `useBrowseUrl`, `FilterGroup` and the Status chip in `BrowseView` complete the write path (chip press, history push, refetch with `status`).
- Slow gate passed: `npm run build` exit 0 (`/browse` prerendered static) then smoke printed 3 PASS lines and `SMOKE OK`.

## Task Commits

1. **Task 1: /browse reads real characters end to end (tracer)** - `093b856` (feat)
2. **Task 2 RED: failing tests for the browse URL filter model** - `d635bac` (test)
3. **Task 2 GREEN: implement the browse URL filter model** - `e79cf63` (feat)
4. **Task 2 wiring: Status chip pushes the filter to the URL and refetches** - `41250be` (feat)

**Plan metadata:** recorded in the docs commit that follows this SUMMARY.

Tracer gate: Task 1's `<verify>` is automated-only and `HUMAN_VERIFY_MODE` is end-of-phase, so it was re-run on resume (fast loop plus DEFAULTS OK and DEPS OK) and passed; the build and smoke later proved the slice. The resumed run did not recommit Task 1.

## Resume Notes

- The first executor died after the RED commit, leaving `lib/browse/filters.ts` modified but uncommitted and `use-browse-url.ts`, `filter-group.tsx` and the `BrowseView` chip wiring unwritten. Treated the leftover edit as untrusted: read it in full, confirmed it matched the contract and the RED tests (25/25 pass, tsc, lint), then committed it as GREEN unchanged. The remaining three files were written fresh in this run.
- The plan-head ledger `.git/gsd-plan-head-before-01-03` existed (`db136aa`), so `commits: 4` is measured with `git rev-list --count db136aa..HEAD` and covers the first executor's two commits plus the two made here.

## Files Created/Modified

- `lib/query/client.ts`, `lib/query/options.ts` - QueryClient defaults, retry policy and the browse infinite-query factory
- `app/providers.tsx` - QueryClientProvider with per-request server client and browser singleton
- `app/browse/page.tsx` - static route, metadata title "Browse", h1 and Suspense boundary
- `components/browse/browse-view.tsx` - client orchestrator: URL filters, `useInfiniteQuery(browseOptions(toListParams(filters)))`, Status FilterGroup, character names list
- `lib/browse/filters.ts`, `lib/browse/filters.test.ts` - pure URL model and its node:test suite
- `components/browse/use-browse-url.ts` - URL read and history write seam
- `components/browse/filter-group.tsx` - labelled toggle-chip group
- `package.json`, `package-lock.json` - the single approved dependency (npm-managed)

## Decisions Made

- Kept the native History API inside `useBrowseUrl` only, so the planning-decision-3 router fallback stays a one-file change.
- Normalised q consistently: parse trims and caps, while serialize and toListParams also trim, so a hand-built Filters object with a whitespace q still cannot reach the URL or API.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Open item (inherited from 01-01 and 01-02):** Node prints `MODULE_TYPELESS_PACKAGE_JSON` to stderr when running `.ts` files directly. Exit codes are unaffected; adding `"type": "module"` remains deferred.
- **Human check not run:** Task 2's browser `<human-check>` (see D5) and the flagged BRW-06 assumption A3 remain owed; the plan 01-05 spike is the confirmation point.
- **Tool state left alone:** `.planning/config.json` (modified) and `.planning/state.json` (untracked) are tool state and were neither edited nor committed.

## Known Stubs

None. `BrowseView` renders plain character names by design; plans 01-05 to 01-10 replace the list with cards, search, further chip groups, states and infinite scroll. Only the Status group is wired by design here.

## Threat Flags

None. T-01-08 mitigated (allow-lists, q cap, history writes only via `buildBrowseUrl(window.location.pathname, ...)`, covered by unit tests for junk params). T-01-09 mitigated (signal forwarded, no 4xx retry). T-01-SC mitigated (exact approved version, dependency-set check passes).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plans 01-05 to 01-10 can extend `BrowseView`, `FilterGroup` (01-07 adds the scroll row and check icon) and `browseOptions` (01-08 switches its parameter to `Filters`).
- Browser verification of the chip, refresh and Back behaviour is owed at the plan 01-05 spike and the phase gate.

## Self-Check: PASSED

- Created files exist: lib/query/client.ts, lib/query/options.ts, app/browse/page.tsx, components/browse/browse-view.tsx, lib/browse/filters.ts, lib/browse/filters.test.ts, components/browse/use-browse-url.ts, components/browse/filter-group.tsx.
- Commits `093b856`, `d635bac`, `e79cf63` and `41250be` are ancestors of HEAD; `git rev-list --count db136aa..HEAD` is 4.
- Re-run on resume: `node --test lib/browse/filters.test.ts` 25 pass 0 fail, `npm test` 62 pass 0 fail, `npx tsc --noEmit` exit 0 (verbatimModuleSyntax true), `npm run lint` exit 0, DEFAULTS OK, DEPS OK, all acceptance greps pass, `npm run build` exit 0, smoke SMOKE OK.

---
*Phase: 01-foundation-browse*
*Completed: 2026-11-12*
