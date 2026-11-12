---
phase: 01-foundation-browse
plan: 01
subsystem: api
tags: [typescript, node-test, fetch, rickandmortyapi, url-search-params]

requires: []
provides:
  - "Zero-dependency `npm test` harness (node --test over lib/**/*.test.ts)"
  - "Typed Rick and Morty API client core (getJson, ApiError taxonomy, API_BASE)"
  - "Character list, single and multi-ID endpoints; episode and location single/multi-ID endpoints"
  - "ID parsing and response normalisation helpers (parseId, extractId, toIdList, toArray)"
  - "Recorded user approval of @tanstack/react-query 5.107.1 (exact pin) for install in plan 01-03"
affects: [01-02, 01-03, 01-06, phase-02, phase-03]

actuals:
  tokens: 5500
  tasks: 3
  commits: 3
plan_head_before: 64a3264e608abb9bcd1c2b5f28e9d761e59e2a83
plan_head_after: e3e7b95166843c7bdbeb6186c67d4d5c9ebb2afe

tech-stack:
  added: []
  patterns:
    - "lib/api modules are React-free and import siblings with relative .ts-suffixed paths so node --test can load them"
    - "Type-only names imported with `import type` (verbatimModuleSyntax enforces it via TS1484)"
    - "Class fields assigned in the constructor body, no parameter properties (erasableSyntaxOnly)"
    - "All query strings built via URLSearchParams in a fixed key order; multi-ID paths built from toIdList (positive safe integers, deduped, ascending)"
    - "getJson returns null only for HTTP 404; abort rejections pass through untouched (never wrapped in ApiError)"

key-files:
  created:
    - lib/api/types.ts
    - lib/api/client.ts
    - lib/api/client.test.ts
    - lib/api/normalize.ts
    - lib/api/characters.ts
    - lib/api/resources.ts
    - lib/api/endpoints.test.ts
  modified:
    - package.json
    - tsconfig.json

key-decisions:
  - "node --test only for unit tests; no test library added (CLAUDE.md dependency constraint)"
  - "verbatimModuleSyntax plus allowImportingTsExtensions in tsconfig so Node type stripping and tsc agree on type-only imports"
  - "erasableSyntaxOnly kept on; tsc stayed clean, so the plan's fallback (remove it) was not needed"
  - "@tanstack/react-query approved by the user at exactly 5.107.1, installed in plan 01-03 with --save-exact"

patterns-established:
  - "Endpoint helpers validate input before fetching (invalid IDs dropped, bad page throws RangeError, no request made)"
  - "Fixed ApiError messages; response bodies never copied into errors"

requirements-completed: [DATA-01, DATA-02, DATA-03]

coverage:
  - id: D1
    description: "npm test runs the lib/api unit suites with Node's built-in runner and adds no dependency"
    requirement: "DATA-01"
    verification:
      - kind: unit
        ref: "npm test (37 tests, 0 failing)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Typed getJson client with network/http/parse error taxonomy, 404 to null, and abort passthrough; a live read returns the first character page"
    requirement: "DATA-03"
    verification:
      - kind: unit
        ref: "lib/api/client.test.ts"
        status: pass
      - kind: integration
        ref: "node --input-type=module live getJson('/character?page=1') printed LIVE READ OK count=826"
        status: pass
    human_judgment: false
  - id: D3
    description: "Character, episode and location single and multi-ID endpoints normalised to arrays, deterministic ordering, safe query encoding"
    requirement: "DATA-01"
    verification:
      - kind: unit
        ref: "lib/api/endpoints.test.ts"
        status: pass
    human_judgment: false
  - id: D4
    description: "Partial and empty multi-ID responses normalise to arrays (DATA-02)"
    requirement: "DATA-02"
    verification:
      - kind: unit
        ref: "lib/api/endpoints.test.ts#fetchCharactersByIds keeps the API order and omits missing ids"
        status: pass
    human_judgment: false
  - id: D5
    description: "User approval of the @tanstack/react-query version before any plan installs it"
    verification: []
    human_judgment: true
    rationale: "Package legitimacy is a human supply-chain decision; recorded verbatim below"

duration: 20min
completed: 2026-11-12
status: complete
---

# Phase 1 Plan 01: Typed API Client and Test Harness Summary

**Zero-dependency node:test harness plus a typed, React-free Rick and Morty API client (getJson with ApiError taxonomy, character/episode/location single and multi-ID helpers, 404-to-null) with 37 green unit tests and a verified live read, ending in a recorded approval of @tanstack/react-query 5.107.1.**

## Performance

- **Duration:** about 20 min (includes the human checkpoint wait)
- **Started:** 2026-11-12T00:20:01Z
- **Completed:** 2026-11-12T00:40:50Z
- **Tasks:** 3 (1 tracer, 1 TDD auto, 1 blocking-human checkpoint)
- **Files modified:** 9 (7 created, 2 modified)

## Accomplishments

- `npm test` runs `node --test "lib/**/*.test.ts"`: 37 tests pass, 0 fail, no new dependency.
- `lib/api/client.ts` exports `API_BASE`, `ApiError` (`kind` network/http/parse, `status`) and `getJson<T>`; 404 resolves to null, 429 HTML rejects as `ApiError` http 429 (no parse crash), aborts rethrow the original AbortError.
- `lib/api/characters.ts` and `lib/api/resources.ts` provide `fetchCharacterPage`, `fetchCharacter`, `fetchCharactersByIds`, `fetchEpisodesByIds`, `fetchLocation`, `fetchLocationsByIds`; multi-ID helpers dedupe, sort ascending, drop invalid IDs, and return `[]` for empty input without calling fetch.
- Live read through the typed client succeeded: `LIVE READ OK count=826` (count read from the API, not hardcoded).
- `npx tsc --noEmit` and `npm run lint` both exit 0 with `verbatimModuleSyntax`, `allowImportingTsExtensions` and `erasableSyntaxOnly` enabled.

## Task Commits

1. **Task 1: Live character-list read through the typed client under npm test (tracer)** - `da9402a` (feat)
2. **Task 2 RED: failing endpoint and normalisation tests** - `215323f` (test)
3. **Task 2 GREEN: normalisation helpers and character, episode, location endpoints** - `e3e7b95` (feat)
4. **Task 3: Package legitimacy checkpoint** - no code commit (decision recorded below)

**Plan metadata:** recorded in the docs commit that follows this SUMMARY (docs: complete plan).

## Legitimacy decision

Task 3 (`checkpoint:human-verify`, `gate="blocking-human"`) asked the user to verify `@tanstack/react-query` before any plan installs it. The user answered in the orchestrator conversation, verbatim:

> approved 5.107.1

Recorded outcome:

- **Approved version:** `@tanstack/react-query` 5.107.1, exact pin.
- **Scope:** only this one package is approved. Motion and any test library remain unapproved (CLAUDE.md: no other libraries without asking).
- **Install timing:** nothing was installed in this plan. Plan 01-03 Task 1 performs the install with `npm install --save-exact @tanstack/react-query@5.107.1`.
- **Basis for the check (from the plan and RESEARCH):** flagged SUS only because the release is younger than the freshness window; about 84M weekly downloads, source at github.com/TanStack/query, single dependency `@tanstack/query-core` at the same version, no postinstall script.

No dependency was added or changed by this plan; `package.json` dependencies are identical to the scaffold.

## Files Created/Modified

- `package.json` - added `test` script (`node --test "lib/**/*.test.ts"`); dependencies untouched
- `tsconfig.json` - added `allowImportingTsExtensions`, `erasableSyntaxOnly`, `verbatimModuleSyntax`
- `lib/api/types.ts` - API response and request types (type-only module)
- `lib/api/client.ts` - fetch core, `ApiError`, `getJson`
- `lib/api/client.test.ts` - 7 getJson cases with stubbed fetch
- `lib/api/normalize.ts` - `parseId`, `extractId`, `toIdList`, `toArray`
- `lib/api/characters.ts` - character list, single and multi-ID requests
- `lib/api/resources.ts` - episode and location requests
- `lib/api/endpoints.test.ts` - normalise and endpoint suite (no live API)

## Decisions Made

- Unit tests use only `node:test` and `node:assert/strict`; no test library (planning decision 3, CLAUDE.md dependency rule).
- `@tanstack/react-query` pinned to exactly 5.107.1 after explicit user approval (see Legitimacy decision).
- `erasableSyntaxOnly` kept enabled: `tsc --noEmit` is clean, so the plan's removal fallback was not triggered.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] RED commit used signature-only stubs**
- **Found during:** Task 2 (TDD RED)
- **Issue:** With `verbatimModuleSyntax` and Node type stripping, importing not-yet-existing modules makes the test file fail at link time rather than at assertion time, which would not be a meaningful RED.
- **Fix:** The RED commit added signature-only stubs so the suite loaded and failed on assertions; GREEN replaced them with real implementations.
- **Files modified:** lib/api/normalize.ts, lib/api/characters.ts, lib/api/resources.ts, lib/api/endpoints.test.ts
- **Verification:** RED failed on assertions, GREEN passes 37/37.
- **Committed in:** `215323f` (RED), `e3e7b95` (GREEN)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary to get a valid RED under Node type stripping. No scope creep.

## Issues Encountered

- **Open item, MODULE_TYPELESS_PACKAGE_JSON warning:** Node prints a harmless warning when running the live-read one-liner and `.ts` tests ("To eliminate this warning, add "type": "module" to package.json"). `package.json` `type` was deliberately left unchanged because changing it to `module` can affect Next.js and config-file loading in later plans. Decide in a later plan whether to add `"type": "module"`. Impact today: noise on stderr only, exit codes unaffected.
- **Cosmetic:** the `package.json` diff shows the closing brace line changed (trailing newline normalised by the editor); no content change beyond the `test` script.

## Known Stubs

None. The RED-phase signature stubs were fully replaced in `e3e7b95`.

## Threat Flags

None. The only network surface is the planned requests to `https://rickandmortyapi.com/api`; T-01-01 through T-01-04 are mitigated and covered by unit tests, and T-01-SC is mitigated by the recorded human approval and the `--save-exact` install rule for plan 01-03.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `lib/api` is ready for plan 01-02 onward and for the Browse tracer in 01-03.
- Plan 01-03 Task 1 may install `@tanstack/react-query@5.107.1` with `npm install --save-exact`; no other package.
- Open item to schedule: `"type": "module"` question above.

## Self-Check: PASSED

- Created files exist: lib/api/types.ts, client.ts, client.test.ts, normalize.ts, characters.ts, resources.ts, endpoints.test.ts (all present in the `64a3264..HEAD` diff).
- Commits `da9402a`, `215323f`, `e3e7b95` are ancestors of HEAD; `git rev-list --count 64a3264..HEAD` is 3.
- Plan verification re-run: `npm test` 37 pass / 0 fail, `npx tsc --noEmit` exit 0, `npm run lint` exit 0, live read printed `LIVE READ OK count=826`.

---
*Phase: 01-foundation-browse*
*Completed: 2026-11-12*
