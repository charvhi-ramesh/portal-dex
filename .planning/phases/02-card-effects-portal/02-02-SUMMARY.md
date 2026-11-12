---
phase: 02-card-effects-portal
plan: 02
subsystem: ui
tags: [portal, motion, react, tanstack-query, reduced-motion, accessibility]

requires:
  - phase: 01-foundation-browse
    provides: "fetchCharacter/fetchCharacterPage, query client defaults, useAnnouncer/LiveRegion, useOnlineStatus, useMediaQuery, CharacterCard"
provides:
  - "Home page with headline, explanation, Start browsing and the portal (HOME-01 to HOME-06)"
  - "lib/portal/portal.ts: pickRandomId, revealAnnouncement, stored-count helpers, portalReducer (React-free, tested)"
  - "lib/query/portal.ts: totalCountOptions and characterOptions (key shared with the Phase 3 detail page)"
  - "PortalStage and PortalDisc components"
  - "motion 14.12.0 as an exact-pinned runtime dependency (reused by plan 02-04 for card tilt)"
affects: [02-03, 02-04, 03-detail-collection]

actuals:
  tokens: 8600
  tasks: 3
  commits: 4
plan_head_before: 1bf4882307edace939a117607a5f46d782357009
plan_head_after: 1312c4e226be6d38b4ad1fd11afae06a9d51f2ac

tech-stack:
  added: [motion@14.12.0 (exact pin; transitive framer-motion 14.12.0, motion-dom 14.12.0, motion-utils 14.7.0)]
  patterns:
    - "Spin handler guarded by busyRef plus a token-checked reducer; AbortController aborts timer and request on unmount"
    - "Refs touched only in handlers and effects; Math.random only inside the handler (react-hooks purity)"
    - "Rotation held in a motion value driven by animate(); no setState in effects"

key-files:
  created:
    - lib/portal/portal.ts
    - lib/portal/portal.test.ts
    - lib/query/portal.ts
    - components/home/portal-stage.tsx
    - components/home/portal-disc.tsx
  modified:
    - app/page.tsx
    - package.json
    - package-lock.json

key-decisions:
  - "Motion approved by the user at exactly 14.12.0 and installed with --save-exact; nothing else added"
  - "PortalDisc rotates a motion.span (not a div) because the disc sits inside the portal button, where only phrasing content is valid"
  - "Server snapshot of useMediaQuery is reduced=true, so the prerendered portal is static and the idle turn starts only after hydration when motion is allowed"
  - "The portal disc and the Open portal pill are one button, giving keyboard users a single tab stop"

patterns-established:
  - "One user activation is one spin: cached count, then last-known count in portal-dex:character-count, then a requested count"
  - "Fixed error copy only (The portal didn't open. / You appear to be offline.); API error text is never rendered or announced"

requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06]

coverage:
  - id: D1
    description: "Random ID draw, announcement text, stored-count parsing, reducer and query options behave per the edge cases"
    requirement: "HOME-02"
    verification:
      - kind: unit
        ref: "npm test (lib/portal/portal.test.ts)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Home prerenders with headline, Open portal, Start browsing and the shell; Motion bundles in the production build"
    requirement: "HOME-01"
    verification:
      - kind: integration
        ref: "npm run build && node scripts/smoke.ts route:/ ... (SMOKE OK)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Portal turns about once per 8 s, spins up for about 1.2 s, card scales out from the centre, no flashing, 320 px layout"
    requirement: "HOME-01"
    verification: []
    human_judgment: true
    rationale: "Animation smoothness and timing need a real browser; no browser automation or test library is allowed"
  - id: D4
    description: "Open by mouse and keyboard, single polite announcement, focus stays put, no overlapping spins or repeats, offline Retry with one request and focus to the new card, leaving mid-spin"
    requirement: "HOME-04"
    verification: []
    human_judgment: true
    rationale: "Live-region output, focus and network overlap need a real browser"
  - id: D5
    description: "Under prefers-reduced-motion the portal never turns and the card fades in"
    requirement: "HOME-05"
    verification: []
    human_judgment: true
    rationale: "Reduced-motion rendering needs a real browser with the preference toggled"

duration: "about 20 min for this continuation (Tasks 2 closure and 3, slow gate, SUMMARY); Task 1 ran in an earlier session"
completed: 2026-11-12
status: complete
---

# Phase 2 Plan 02: Portal Summary

**Home now opens a conic-gradient portal that idles at one turn per 8 s, spins up for 1.2 s and scales out a random, announced character card, with Spin again, View details, an inline Retry and a still, fade-only reduced-motion path, built on an exact-pinned motion 14.12.0.**

## Performance

- **Duration:** about 20 min for this continuation; Task 1 was executed in the earlier session
- **Completed:** 2026-11-12
- **Tasks:** 3 (Task 1 tracer with TDD, Task 2 blocking-human checkpoint, Task 3 Motion)
- **Files modified:** 8 (5 created, 3 modified)

## Accomplishments

- The portal flow (HOME-02 to HOME-04, HOME-06): count from cache, then last-known localStorage hint, then a request; one uniform random ID that never repeats the previous reveal; one request per spin; a polite "Portal opened: {name}" announcement; inline error with Retry; cancellation when leaving Home.
- The motion (HOME-01, HOME-02, HOME-05): PortalDisc idles at 8 s per turn, spins up with three turns over 1.2 s on an ease-in curve then keeps a fast steady turn until the card arrives, and brightens the glow from 0.6 to 1 opacity during the spin. The reveal wrapper scales from 0.2 to 1 over 0.4 s. Under reduced motion nothing rotates and the card fades in over 0.2 s with no minimum spin wait.
- Only `transform` (rotate, scale) and `opacity` are animated.

## Task Commits

1. **Task 1: portal helpers, reducer, query options, PortalStage, Home page (TDD tracer)**
   - `a518a0f` test (RED), `4fff3e8` feat (GREEN), `25d46e5` feat (stage and page)
2. **Task 2: motion legitimacy checkpoint** - no commit (decision recorded below; nothing installed by the task itself)
3. **Task 3: Motion install, PortalDisc, reveal animation** - `1312c4e` (feat)

**Plan metadata:** recorded by the final docs commit.

## Legitimacy decision

Task 2 (`checkpoint:human-verify`, `gate="blocking-human"`) asked the user to verify `motion` before it was installed. The evidence presented: `package-legitimacy check` verdict SUS for the single reason `too-new`; version 14.12.0 published 2026-11-10; about 34M weekly downloads; repository github.com/motiondivision/motion; dependencies `tslib` and `framer-motion` 14.12.0; optional `react`, `react-dom` and `remix` peers; no install scripts; six releases in six days. The user chose through the orchestrator's option dialog (alternatives offered: `use 14.9.1`, `reject`), verbatim:

> approved 14.12.0

Recorded outcome:

- **Approved version:** `motion` 14.12.0, exact pin (`npm install --save-exact motion@14.12.0`).
- **Scope:** only `motion`, plus its transitive dependencies from the same repository: `framer-motion` 14.12.0, `motion-dom` 14.12.0 and `motion-utils` 14.7.0 (and `tslib`, already in the tree). The install added exactly four packages (motion, framer-motion, motion-dom, motion-utils). No test library or other package was added.
- **npm page:** the user was not asked to, and did not, open https://www.npmjs.com/package/motion; that step was left to them (the plan's how-to-verify step 2 remains theirs to do if they want it).
- **Result:** `package.json` runtime dependencies are exactly `@tanstack/react-query`, `motion`, `next`, `react`, `react-dom`; devDependencies are unchanged. The lockfile entries resolve from registry.npmjs.org at the versions above.

## Files Created/Modified

- `lib/portal/portal.ts` - pickRandomId, revealAnnouncement, parseStoredCount, readLastKnownCount, rememberCount, portalReducer
- `lib/portal/portal.test.ts` - node:test suite for the helpers, reducer and query options
- `lib/query/portal.ts` - totalCountOptions, characterOptions
- `components/home/portal-stage.tsx` - portal button, reveal, controls, error row, live region, reduced-motion wiring
- `components/home/portal-disc.tsx` - Motion-driven rotation and glow
- `app/page.tsx` - Home page content
- `package.json`, `package-lock.json` - motion 14.12.0

## Decisions Made

- Approved Motion version taken exactly as the user chose (14.12.0), not the older 14.9.1 alternative.
- `PortalDisc` uses `motion.span` with `block` display instead of the plan's `motion.div`, since a `div` inside a `button` is invalid HTML.
- Reduced motion is the server snapshot, so the first paint is static and the idle turn starts after hydration.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] motion.span instead of motion.div in PortalDisc**
- **Found during:** Task 3
- **Issue:** The plan said `motion.div`, but the disc is rendered inside the portal `button`, whose content model allows phrasing content only.
- **Fix:** Used `motion.span` with `absolute inset-0 block`; behaviour and the `motion/react` / `repeat: Infinity` acceptance greps are unaffected.
- **Files modified:** components/home/portal-disc.tsx
- **Committed in:** `1312c4e`

---

**Total deviations:** 1 auto-fixed (1 bug-avoidance)
**Impact on plan:** None on behaviour; markup validity only.

## Issues Encountered

- **`npm run lint` reports errors only inside `.claude/worktrees/`** (207 errors and 3878 warnings from generated or checked-out copies there). Reported, not fixed, as instructed; lint config untouched. `npx eslint app components lib` is clean (exit 0), so the project sources pass.
- `npm install` printed "7 moderate severity vulnerabilities" from `npm audit`; none of the audit lines mention motion, framer-motion, motion-dom, motion-utils or tslib. Not acted on (out of scope).
- `MODULE_TYPELESS_PACKAGE_JSON` warning when running `scripts/smoke.ts` is the known open item from plan 01-01 (stderr noise only).

## Verification

- `npm test`: 157 tests, 157 pass, 0 fail.
- `npx tsc --noEmit`: clean.
- DEPS check: `DEPS OK 14.12.0`; devDependencies invariant holds.
- Slow gate: `npm run build` succeeded (Home prerendered static); `node scripts/smoke.ts route:/ ...` printed five PASS lines and `SMOKE OK`.

## Human-check items (end-of-phase UAT, not run here)

1. **02-02-T1:** build and `next start`; open by mouse, Enter and Space; confirm "Opening the portal...", a real card after about 1.2 s, "Portal opened: {name}" announced once, focus stays on the pressed control; ten quick "Spin again" presses give one request at a time and no repeats; "View details" goes to `/character/{id}` (404 until Phase 3 is expected); offline shows "You appear to be offline." with Retry, a double Retry sends one request and focus lands on the card; leaving mid-spin and returning shows an idle portal with no late card.
2. **02-02-T3:** watch idle for 20 s (one turn about every 8 s, no jump); spin-up about 1.2 s continuing fast while a "Slow 4G" request finishes, card grows from the centre, returns to the slow turn without a jump, glow brightens only during the spin and nothing flashes; with DevTools "prefers-reduced-motion: reduce" the portal never turns and the card fades in; at 320 px the portal is about 70% width and nothing scrolls horizontally.
3. Optional, left to the user: open https://www.npmjs.com/package/motion to confirm the publisher and repository.

Known limitation to confirm in the browser: when a spin ends and the idle turn restarts, the angle is continuous but the speed drops from the fast turn to the 8 s turn at once.

## Known Stubs

None.

## TDD Gate Compliance

Task 1 followed RED then GREEN: `a518a0f` (failing test against signature-only stubs) then `4fff3e8` (implementation). No refactor commit.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plans 02-03 and 02-04 can import `motion/react`, the portal contracts and the `PortalStage` reveal wrapper (plan 02-04 wraps it with TiltFrame).
- Plan 02-01 ran in a separate worktree and is merged by the orchestrator; no files in `.claude/worktrees/` were touched here.

## Self-Check: PASSED

Created files found: lib/portal/portal.ts, lib/portal/portal.test.ts, lib/query/portal.ts, components/home/portal-stage.tsx, components/home/portal-disc.tsx. Commits a518a0f, 4fff3e8, 25d46e5, 1312c4e are ancestors of HEAD.

---
*Phase: 02-card-effects-portal*
*Completed: 2026-11-12*
