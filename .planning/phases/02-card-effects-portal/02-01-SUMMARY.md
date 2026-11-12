---
phase: 02-card-effects-portal
plan: 01
subsystem: ui
tags: [react, nextjs, tailwind, css-3d-flip, a11y, node-test]

requires:
  - phase: 01-foundation-browse
    provides: "D-01 card markup (disabled flip stub, empty star and link slots, inert back stub), CardSkeleton box parity, labelFor, formatCount, contrast gate"
provides:
  - "lib/card/card-text.ts: displayName, cardLabel, episodeCountText, backFacts, BackFact (pure, tested)"
  - "Flippable CharacterCard with aria-pressed flip button, inert hidden face, star slot and View details link slot"
  - "CardBack fact list"
  - "Card CSS: 3D flip, status rarity frames (pulse, grayscale, shimmer), hover glow, pseudo-element focus ring, reduced-motion rules"
  - "Contrast gate pairs for pink on bg, surface and surface-raised"
affects: [02-03 favourite star, 02-04 tilt and sheen, 03 character detail route, 04 polish]

actuals:
  tokens: 6000   # chars/4 over the added lines of the realized diff (approximate)
  tasks: 2
  commits: 4
plan_head_before: 1bf4882307edace939a117607a5f46d782357009
plan_head_after: 2ee1d158e5eb6b1d5f36a99fe8c6041e90d7cdd4

tech-stack:
  added: []
  patterns:
    - "Frame, clipping and flip live on each .card-face; the article only carries data-status and data-flipped"
    - "Pseudo-elements (never box-size changes) draw glow, shimmer, hover halo and the focus ring; only transform and opacity animate"
    - "Focus ring is a .card::after pseudo-element with a 2 px navy inset band, not an outline"
    - "Pure card text helpers in lib/card with relative .ts imports and import type, tested with node:test"

key-files:
  created:
    - lib/card/card-text.ts
    - lib/card/card-text.test.ts
    - components/card/card-back.tsx
  modified:
    - components/card/character-card.tsx
    - components/card/card-avatar.tsx
    - app/globals.css
    - scripts/check-contrast.ts

key-decisions:
  - "D-01 adjustment accepted by the user: frame and clipping move from the article onto each card face so the backface-hidden flip works; element order, card size and the inert back face are unchanged"
  - "Focus ring as a pseudo-element with an inset navy band rather than an outline, so the Alive glow cannot paint over the navy gap"
  - "Species, origin and location 'unknown' values read 'Unknown' on the back face via labelFor (same rule as gender)"

patterns-established:
  - "Card hooks for later plans: .card, .card-flip, .card-face, .card-front, .card-back, .card-slot, --card-frame, --card-glow"
  - "Star slot is an empty inert div[data-slot=star].card-slot.card-front for plan 02-03 to render into"

requirements-completed: [CARD-02, CARD-03, CARD-04, CARD-07]

coverage:
  - id: D1
    description: "Card text helpers: displayName, cardLabel, episodeCountText and backFacts, including the boundary, precision, empty, encoding and ordering edges"
    requirement: "CARD-02"
    verification:
      - kind: unit
        ref: "lib/card/card-text.test.ts (17 tests, node --test)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every card flips by click, tap, Enter or Space to a back face with facts and a View details link; flip button is an aria-pressed toggle; hidden face is inert"
    requirement: "CARD-03"
    verification:
      - kind: other
        ref: "npx tsc --noEmit && npm run lint && npm run build && node scripts/smoke.ts route:/browse (build and structure only; acceptance greps pass)"
        status: pass
    human_judgment: true
    rationale: "Flip animation, screen reader output, inert behaviour and touch input need a real browser; no browser automation or test library is allowed (CLAUDE.md)"
  - id: D3
    description: "Status rarity frames: Alive teal pulse, Dead grey with 60% grayscale photo, unknown purple-pink shimmer, static under reduced motion"
    requirement: "CARD-04"
    verification:
      - kind: other
        ref: "node scripts/check-contrast.ts (CONTRAST OK, includes pink pairs); CSS acceptance greps"
        status: pass
    human_judgment: true
    rationale: "Visual frame effects and animation rate need a real browser"
  - id: D4
    description: "Card label and a focus ring that stays distinct from the frame and glow on every status colour"
    requirement: "CARD-07"
    verification:
      - kind: unit
        ref: "lib/card/card-text.test.ts#cardLabel tests"
        status: pass
    human_judgment: true
    rationale: "Ring distinguishability on the Alive teal frame and glow, and screen reader announcement, need a real browser"

duration: 40min
completed: 2026-11-12
status: complete
---

# Phase 2 Plan 01: Flippable Rarity-Framed Cards Summary

**Every Browse card now flips by click, tap, Enter or Space (500 ms rotateY, 200 ms opacity crossfade under reduced motion) to an inert-managed back face with facts and a View details link, wrapped in status rarity frames (Alive teal pulse, Dead grey with 60% grayscale, unknown purple-pink shimmer) and a navy-banded teal focus ring, with pure tested card-text helpers behind the labels.**

## Performance

- **Duration:** about 40 min
- **Tasks:** 2 (Task 1 as TDD tracer: RED, GREEN, then components and CSS; Task 2 auto)
- **Files modified:** 7 (3 created, 4 modified), no dependency added or changed

## Accomplishments

- `lib/card/card-text.ts` with 17 `node:test` cases (RED first against signature-only stubs, then GREEN): `cardLabel` gives "Rick Sanchez, Alive, Human card, press to flip", with Unknown, Unknown species and Unknown character fallbacks, full untruncated trimmed names and fixed part order; `episodeCountText` gives "0 episodes", "1 episode", "1,000 episodes"; `backFacts` omits Type when the trimmed type is empty.
- `CharacterCard` is a client component with local flip state. The flip button is an `aria-pressed` sibling of the star slot and link slot, labelled by `cardLabel`. The hidden face and its slot are `inert`. The View details link targets `/character/{id}` with `prefetch={false}`.
- Rarity frames, hover and focus glow, and the pseudo-element focus ring (2 px teal ring, 2 px navy band, then the frame) in `app/globals.css`; every animation is opacity-only with cycles of 2.4 s or more.
- Avatar top corners rounded (`rounded-t-[18px]`) now that the face no longer clips; contrast gate extended with the pink pairs (pink on surface 7.20, minimum 3).

## Task Commits

1. **Task 1 (tracer, TDD): flippable card, back face, View details link**
   - RED `bd1c9c8` (test): 17 failing tests against signature-only stubs
   - GREEN `e7c3c05` (feat): card-text helpers
   - `1f282cc` (feat): CardBack, flippable CharacterCard, flip CSS
2. **Task 2: rarity frames and focus ring** - `2ee1d15` (feat)

**Plan metadata:** the SUMMARY commit follows this file.

## TDD Gate Compliance

RED then GREEN present for the card-text helpers (`test(02-01)` `bd1c9c8`, then `feat(02-01)` `e7c3c05`). No REFACTOR commit (no change needed).

RED evidence: `node --test lib/card/card-text.test.ts` ran 17 tests and failed all 17 on `ERR_ASSERTION` against stubs that return the raw name, the stringified count and an empty list. Semantic assessment: the target tests executed and failed on the planned assertions, not on import, syntax or discovery errors. `workflow.tdd_mode` is not enabled in this project, so the `gsd_run check tdd-red-evidence` classifier was not run.

## User Acceptance Recorded

The user accepted the D-01 adjustment in this plan (2026-11-12, recorded at plan check): the frame border and clipping move from the outer `article` onto each card face to make the flip work. Element order, card size and the inert back face are unchanged, so `CardSkeleton` still matches the outer box.

## Verification Results

- `node --test lib/card/card-text.test.ts`: 17 pass, 0 fail
- `npm test`: 137 pass, 0 fail
- `npx tsc --noEmit`: exit 0 (after `next typegen`, see Issues)
- `npm run lint`: exit 0, no errors
- `node scripts/check-contrast.ts`: includes `PASS pink on surface 7.20 (min 3)`, last line `CONTRAST OK`
- Task 1 and Task 2 acceptance criteria (all grep checks, the `disabled` baseline check, the transition-property invariant and the `dangerouslySetInnerHTML` invariant): all pass
- Slow gate: `npm run build` succeeded (/browse prerendered static); `node scripts/smoke.ts route:/browse "Browse characters" "Browse · Portal Dex" "skeleton-grid"` printed 3 PASS lines and `SMOKE OK`

## Tracer feedback gate

Task 1 is the tracer and carries a `<human-check>`. Auto mode is off and `human_verify_mode` is `end-of-phase`, so a strict reading stops for a human here. The plan and the dispatching orchestrator both schedule these browser checks as end-of-phase UAT and require every task to run, so the tracer's automated `<verify>` (tests, tsc, lint) was re-run end to end, passed, and execution expanded to Task 2. The browser-only checks below remain open. Flagged for the orchestrator.

## Human-check items (pending, end-of-phase UAT)

1. **02-01 Task 1:** `npm run build`, `node node_modules/next/dist/bin/next start -p 3000`, open /browse at 1280 px. Click a card twice; Tab to a card and press Enter then Space; with NVDA or Narrator confirm the label "Rick Sanchez, Alive, Human card, press to flip, toggle button, not pressed" and "pressed" after flipping; with the front showing Tab never lands on View details, with the back showing it does and the front is not read; tap a card in DevTools touch mode; with "prefers-reduced-motion: reduce" the faces crossfade with no rotation; cards and skeletons are the same height on Slow 4G.
2. **02-01 Task 2:** filter Alive, Dead, Unknown and watch each frame for 10 s (Alive pulse about 2.4 s, Dead desaturated photo with unchanged text, Unknown shimmer); hover glow; Tab to a card in each filter and confirm the teal ring with a navy band is distinct from the frame and Alive glow; Load more hand-off shows the same ring; reduced motion keeps glow and shimmer static; avatar top corners stay rounded; zoom an Alive card to 400% to inspect the ring.

## Deviations from Plan

None - plan executed exactly as written.

The plan flagged two unresolved edge assumptions (double click flips twice; frame effects never change box size); both hold by construction in the implemented markup and CSS but are browser-observable only and are part of the pending human checks.

## Issues Encountered

- `npx tsc --noEmit` first failed with `TS2304: Cannot find name 'LayoutProps'` in `app/layout.tsx`. This was environmental: a fresh worktree has no generated `.next/types` (gitignored). `npx next typegen` regenerated the route types, no dependency or source change, and tsc then passed. Not caused by this plan's changes.
- Worktree-isolation tooling refused compound git commands, so guards and checks were run as plain separate commands. No effect on the result.

## Known Stubs

None. The star slot is intentionally empty (Phase 1 D-03; plan 02-03 renders the star inside it) and is an inert `div` with no placeholder content.

## Threat Flags

None. No new endpoints, auth paths or schema. T-02-01 (API strings as React text only; no `dangerouslySetInnerHTML` under components or app) and T-02-02 (link href is `/character/` plus the numeric id; `prefetch={false}`) are mitigated as planned. T-02-SC: no packages installed, `package.json` and `package-lock.json` untouched.

## Next Phase Readiness

- Plan 02-03 can render the favourite star inside `div[data-slot="star"]`; plan 02-04 can add tilt on `.card` (note `.card` already sets `perspective: 800px`, and the faces own the flip transform).
- `CharacterCard` props are unchanged (`{ character, eager }`), so plan 02-02 can render it as is.
- The `/character/[id]` route does not exist until Phase 3; the View details link is correct but leads to a 404 for now.

## Self-Check

Files, commits and acceptance criteria verified after writing (see below).

---
*Phase: 02-card-effects-portal*
*Completed: 2026-11-12*
