---
phase: 02-card-effects-portal
plan: 04
subsystem: ui
tags: [motion, tilt, sheen, pointer-events, reduced-motion, accessibility, tdd]
status: complete

requires:
  - phase: 02-card-effects-portal
    provides: "CharacterCard article.card (02-01), motion 14.12.0 and the reveal motion.div in portal-stage (02-02), star slot (02-03)"
provides:
  - "lib/card/tilt.ts: MAX_TILT_DEG, TILT_PERSPECTIVE_PX, TiltValues, tiltFromPointer (React-free, 12 tests)"
  - "components/card/tilt-frame.tsx: TiltFrame with Motion springs, holographic sheen overlay, off for touch, pen, coarse pointers and reduced motion"
  - "Every Browse grid card and the revealed Home card tilt toward a desktop mouse and shine (CARD-05)"
affects: [03-detail-collection, 04-light-polish]

actuals:
  tokens: 2600
  tasks: 2
  commits: 4
plan_head_before: 024a6e09e6caf9889d9e5b5620c043991afd3ef8
plan_head_after: 9e85fe0ed9d0fec8d087f3529cbe2b2cadc0ab96

tech-stack:
  added: []
  patterns:
    - "Pointer effects write Motion values only (useMotionValue, useSpring, useTransform): no React render per move, only transform and opacity change"
    - "Effects are gated by two media queries with off-by-default server snapshots; the overlay is not rendered at all when disabled"
    - "Hit testing and rect measurement happen on an untransformed outer box, so a tilted card never changes its own hover area"

key-files:
  created:
    - lib/card/tilt.ts
    - lib/card/tilt.test.ts
    - components/card/tilt-frame.tsx
  modified:
    - components/browse/character-grid.tsx
    - components/home/portal-stage.tsx

key-decisions:
  - "Pointer handlers and the rect measurement sit on the untransformed outer div instead of the rotating motion.div, to avoid enter/leave flicker at tilted edges (a rotated element's hit area changes with its own rotation)"
  - "Sheen position follows the pointer directly (plain Motion values); only the sheen opacity is a spring"
  - "tiltFromPointer returns the flat values for a non-finite point as well as a zero-size rect"

patterns-established:
  - "Wrap a card from outside with TiltFrame; the wrapper fills its parent (h-full) so grid rows and focus hand-off code that queries `article` are untouched"

requirements-completed: [CARD-05]

coverage:
  - id: D1
    description: "tiltFromPointer: flat at the centre, +/-12 at edges and corners, clamping outside the card, offset rect, zero-size rect, custom max, never -0 or NaN"
    requirement: "CARD-05"
    verification:
      - kind: unit
        ref: "node --test lib/card/tilt.test.ts (12 pass); npm test (214 pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "TiltFrame and the sheen bundle with Motion into /browse and /; prerendered shells are intact and the sheen gradient class is compiled into the CSS"
    requirement: "CARD-05"
    verification:
      - kind: integration
        ref: "npm run build && node scripts/smoke.ts route:/browse 'Browse characters' 'skeleton-grid' route:/ 'Open portal' 'Start browsing' (SMOKE OK)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Cards tilt toward the mouse up to about 12 degrees and settle flat in about 0.2 s; sheen follows the pointer and fades; flip, star, View details and focus ring work on a tilted card; revealed Home card tilts; no tilt or sheen for touch or reduced motion; no per-move React renders; Load more focus hand-off and equal row heights intact"
    requirement: "CARD-05"
    verification: []
    human_judgment: true
    rationale: "Pointer-driven 3D motion, perceived timing, sheen appearance, click-through, DevTools performance recording and touch emulation need a real browser; no browser automation is available"

duration: 12 min
completed: 2026-11-12
---

# Phase 2 Plan 04: Card Tilt and Sheen Summary

**Desktop-mouse 3D tilt (up to 12 degrees, perspective 800 px) with a pointer-following holographic sheen on every Browse card and the revealed Home card, driven by Motion springs with no React renders per move and disabled for touch, pen, coarse pointers and reduced motion.**

## Performance

- **Duration:** 12 min (2026-11-12T08:22:58Z to 08:34Z)
- **Tasks:** 2 of 2
- **Files:** 5 (3 created, 2 modified)
- **No dependency added or changed**

## Accomplishments

- `lib/card/tilt.ts` computes rotation and sheen position from a pointer and a rect, clamped, with a `+ 0` normalisation so `-0` never escapes and a guard for zero-size rects and non-finite points.
- `TiltFrame` measures the card once per pointer enter, sets two Motion targets feeding springs (stiffness 300, damping 30) bound to `rotateX` and `rotateY`, and renders a clipped, `pointer-events-none` overlay whose radial-gradient spot moves with `x` and `y` transforms and fades with a spring opacity. Only `mouse` pointers are handled. Switching reduced motion on while hovering snaps the card flat and hides the sheen (`jump(0)`).
- `CharacterGrid` wraps each card; `PortalStage` wraps the revealed card inside the existing reveal `motion.div` (key, `revealRef` and the focus-after-Retry effect untouched).

## TDD Cycle (Task 1, tilt maths)

- **RED** (`c0be2c0`, `test(02-04)`): 12 `node:test` cases against a signature-only stub that returns `-1` for every value. Result: 12 tests, 2 pass, 10 fail. Every failure was an assertion on planned behaviour (for example centre gave `{-1,-1,-1,-1}` instead of `{0,0,50,50}`, the right edge gave `-1` instead of `12`, custom max gave `-1` instead of `6`); no load, syntax or discovery fault. The 2 passes are the constants test (the stub already exports them) and the `-0`/NaN test (a constant `-1` is neither); the latter only becomes meaningful at GREEN. The `gsd_run check tdd-red-evidence` classifier was not run: the plan is `type: execute`, so the RED evidence was inspected semantically from the node test output.
- **GREEN** (`fb99a42`, `feat(02-04)`): implementation, 12 of 12 pass, tsc and eslint clean.
- **REFACTOR:** none needed.

## Task Commits

1. Task 1 RED: `c0be2c0` test(02-04): add failing tests for tiltFromPointer
2. Task 1 GREEN: `fb99a42` feat(02-04): implement tiltFromPointer
3. Task 1 UI: `ee46a0a` feat(02-04): tilt Browse cards toward a desktop mouse
4. Task 2: `9e85fe0` feat(02-04): add the pointer-following sheen and tilt the revealed Home card

`commits: 4` is measured from `git rev-list --count 024a6e0..HEAD`.

## Verification Results

- Per-task fast loop (`node --test lib/card/tilt.test.ts`, `npm test`, `npx tsc --noEmit`, `npm run lint`): all pass after each task (12 tilt tests, 214 total, 0 fail).
- Acceptance criteria for both tasks: all PASS (greps for `MAX_TILT_DEG = 12`, `from "motion/react"`, `useSpring`, `pointerType`, `(hover: hover) and (pointer: fine)`, `prefers-reduced-motion: reduce`, `<TiltFrame` in grid and portal stage, `radial-gradient`, `pointer-events-none`, `useTransform`).
- Plan slow gate (`npm run build` then `scripts/smoke.ts` for /browse and /): `SMOKE OK`. The compiled CSS contains the sheen gradient (`radial-gradient(circle,#ffffff47,#a66bff1f 25%,#0000 45%)`) and `mix-blend-mode:soft-light`.
- **Phase 2 gate** (on the merged tree after 02-03 and 02-04): `npm test` 214 pass 0 fail; `node scripts/check-contrast.ts` `CONTRAST OK`; `npx tsc --noEmit` clean; `npm run lint` clean; `npm run build` compiled, 6 static pages; cumulative smoke over `/`, `/collection` and `/browse` (26 PASS lines) ended with `SMOKE OK`.

## Human-check items (not run; need a real browser)

1. 02-04-T1: `npm run build`, `next start`, /browse at 1280 px with a mouse. The card face turns toward the pointer (edge under the cursor dips away), never beyond about 12 degrees, settles flat in about 0.2 s; flip, star and focus ring still work on a tilted card; DevTools recording shows no React renders per move and only transform changes; touch emulation and `prefers-reduced-motion: reduce` give no tilt and tap still flips; Load more still focuses the first new card; grid rows keep equal heights.
2. 02-04-T2: the sheen follows the pointer on Dead, Alive and unknown cards and fades on leave, sits over the frame colours without hiding text, and never blocks the star, flip area or View details; on / the revealed card tilts and shines the same way; none of it under reduced motion or touch.
3. Flagged assumption to look at: "toward the cursor" is implemented as the face turning to face the pointer (the edge under the cursor dips away). If it looks inverted in the browser, flip the sign of the two rotations in `lib/card/tilt.ts` and the tests.
4. Edge to look at: on Home, hovering the revealed card during its 0.4 s scale-out measures the rect mid-scale, so tilt maths can be off until the pointer leaves and re-enters.

## Deviations from Plan

### Judgement calls to surface

**1. Tracer feedback gate (Task 1 is `type="tracer"` with a `<human-check>`).** As in 02-03: the dispatching orchestrator instructed a single run to completion with browser-only checks recorded as human-check items, and the plan lists both human checks under end-of-phase UAT. I re-ran Task 1's full `<automated>` verify (all green) before starting Task 2, then continued, and queued the Task 1 human-check for UAT.

**2. Handlers on the outer div.** The plan puts the pointer handlers on the `motion.div`. They are on the untransformed outer `div` instead, and the rect is measured from it, so a card that is mid-tilt or still springing back does not change its own hit area or measured size (no enter/leave flicker at the edges). Behaviour and the enter-once measurement are as specified.

**3. Extra guard.** `tiltFromPointer` also returns the flat values for a non-finite point (NaN would otherwise escape through the clamp). This is within the "never -0 or NaN" must-have.

No Rule 1 to 3 fixes were needed. **Total deviations:** 0 auto-fixed, 3 judgement calls. **Impact:** none on scope; the tilt and sheen browser checks remain open for UAT.

## Authentication Gates

None.

## Known Stubs

None. (The stub `tilt.ts` existed only in the RED commit and was replaced in the GREEN commit.)

## Threat Flags

None. T-02-11 is mitigated as planned: Motion values and springs update transforms without React renders, the rect is measured once per pointer enter, handlers return early for touch, pen, coarse pointers and reduced motion, and only transform and opacity animate.

## Next Phase Readiness

Phase 2 plans are all complete. Remaining before the phase can be verified: the end-of-phase UAT harvested from every `<human-check>` in plans 02-01 to 02-04 (all browser-only). Phase 4 may tune the spring values (stiffness 300, damping 30).

## Self-Check: PASSED

All 3 created files exist; commits c0be2c0, fb99a42, ee46a0a and 9e85fe0 are ancestors of HEAD.
