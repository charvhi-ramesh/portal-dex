---
phase: 01-foundation-browse
plan: 05
subsystem: ui
tags: [nextjs, next-image, tailwind, react, node-test, remotepatterns, card-grid]

requires:
  - phase: 01-foundation-browse
    provides: "Plan 01-01 Character type and API layer; plan 01-03 BrowseView, labelFor and filters; plan 01-04 header and layout"
provides:
  - "CharacterCard: final D-01 card markup (flip button, front face, empty star slot, empty link slot, inert back face) with static status frames and badges"
  - "CardAvatar and AVATAR_SIZES: next/image avatar with surface-raised placeholder, 200 ms opacity fade-in and labelled initial fallback tile"
  - "CharacterGrid: 2/3/4/5 column responsive grid, first 5 avatars eager"
  - "isAvatarUrl, AVATAR_ORIGIN, AVATAR_PATH_PREFIX: avatar URL guard mirroring images.remotePatterns"
  - "next.config.ts images.remotePatterns pinned to the API avatar path, covered by lib/config.test.ts"
  - "Back-navigation spike decision: native-ok"
affects: [01-07, 01-08, 01-09, 01-10, phase-02-card-effects]

actuals:
  tokens: 2400
  tasks: 3
  commits: 3
plan_head_before: c69f5d83590de9ad0f433b0e4509948783dad2be
plan_head_after: 0f61f8053774e3dc76e69bf406f9070573c0084e

tech-stack:
  added: []
  patterns:
    - "Status colour chosen by data-status attribute variants (data-[status=alive]:border-teal), no JS and no hover state"
    - "URL guard (isAvatarUrl) mirrors the framework allow-list so next/image never receives an unconfigured URL"
    - "Config pinned by a node:test suite that imports next.config.ts directly"

key-files:
  created:
    - components/card/character-card.tsx
    - components/card/card-avatar.tsx
    - components/browse/character-grid.tsx
    - lib/api/avatar.ts
    - lib/config.test.ts
  modified:
    - next.config.ts
    - components/browse/browse-view.tsx

key-decisions:
  - "Back-navigation spike: option native-ok selected, so no extra code; plan 01-10 Task 3 only re-verifies Back restore with several loaded pages"
  - "Card markup locked in its final D-01 shape now so Phase 2 only adds behaviour (flip, tilt, favourite star)"

patterns-established:
  - "Card DOM order inside each li: article[tabindex=-1][data-status] containing flip button, front face, star slot, link slot, inert back face"
  - "API strings render as React text children only; no raw HTML injection prop under components/"

requirements-completed: [CARD-08, PERF-01, BRW-01]
# CARD-01 is PARTIAL (D-03): card front delivered, favourite star ships with CARD-06 in Phase 2.
# BRW-11 is not complete here: this plan only decided the path; plan 01-10 completes it.
# BRW-01 is delivered by this plan but stays Pending in REQUIREMENTS.md: requirements.ready-ids
# blocked it (shared-ID gate, other Phase 1 plans also declare it).

coverage:
  - id: D1
    description: "images.remotePatterns holds a single https rickandmortyapi.com /api/character/avatar/** entry with search empty, and the production build accepts it"
    requirement: "PERF-01"
    verification:
      - kind: unit
        ref: "lib/config.test.ts (node --test lib/config.test.ts)"
        status: pass
      - kind: other
        ref: "npm run build && node scripts/smoke.ts route:/browse \"Browse characters\" \"Browse · Portal Dex\" (SMOKE OK)"
        status: pass
    human_judgment: false
  - id: D2
    description: "isAvatarUrl accepts only https API avatar URLs with no port, query or hash; everything else renders the fallback tile"
    requirement: "CARD-08"
    verification:
      - kind: unit
        ref: "lib/config.test.ts (isAvatarUrl cases)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Cards render as static final-markup fronts in a 2/3/4/5 column grid with status frames, badges, two-line name clamp and one-line species"
    requirement: "BRW-01"
    verification:
      - kind: other
        ref: "npx tsc --noEmit && npm run lint && npm test; build plus smoke serve /browse around the grid"
        status: pass
    human_judgment: true
    rationale: "Breakpoint layout, avatar fade-in and visual frame colours need a browser; no browser automation is allowed in Phase 1 (planning decision 3). Plan 01-10 and verify-work cover the visual pass."
  - id: D4
    description: "Back-navigation spike recorded for plan 01-10"
    verification:
      - kind: manual_procedural
        ref: "Task 3 checkpoint, option native-ok answered by the user"
        status: pass
    human_judgment: true
    rationale: "Needs a real browser; the answer is the user's own."

duration: n/a (resumed across a human checkpoint; task commits span 10:04 to 10:06 +0800)
completed: 2026-11-12
status: complete
---

# Phase 1 Plan 05: Card grid, avatars and Back-navigation spike Summary

**Real character cards in a 2/3/4/5-column grid with the final D-01 card markup, next/image avatars locked to the API avatar path (placeholder, fade-in, labelled initial fallback), and a native-ok Back-navigation spike decision for plan 01-10**

## Performance

- **Duration:** n/a (resumed across the Task 3 human checkpoint; task commits at 10:04:46, 10:05:17 and 10:06:43 +0800)
- **Completed:** 2026-11-12
- **Tasks:** 3 (1 tracer, 1 TDD auto, 1 human decision)
- **Files modified:** 7 (248 insertions, 5 deletions)

## Accomplishments

- /browse now renders each result as a card front: avatar, two-line-clamped h2 name with full name in `title`, status badge with text, and a one-line species with "Unknown species" for empty values. Frames are static 2 px borders in the status colour (D-04).
- Card markup is final per D-01: disabled `aria-hidden` flip button as a sibling of an empty 44 x 44 star slot and an empty link slot, the front face, and an `inert` back face. No card element is a tab stop and no star is rendered (D-02, D-03).
- Avatars show a surface-raised block while loading, fade in over 200 ms (opacity only), and fall back to a same-size initial tile (`role="img"`, `aria-label` = name) on image error or a non-API URL. The initial is the first code point of the trimmed name via `Array.from`.
- `next.config.ts` allows only `https://rickandmortyapi.com/api/character/avatar/**` with `search: ""`; `isAvatarUrl` mirrors it so the optimiser never sees an unconfigured URL. `lib/config.test.ts` pins both. First 5 avatars load eagerly, the rest lazily.
- Slow gate passed (`npm run build` then the `/browse` smoke, SMOKE OK), and the automated spike evidence for the image allow-list (T-01-12) passed against the live build.

## Spike decision

**Option selected: `native-ok`** (Native history works and scroll is restored).

**Observations for steps 2, 4 and 5:** none supplied. The user chose the option in the orchestrator's option dialog and gave no further written observations.

**Consequence for plan 01-10:** no extra code. Plan 01-10 Task 3 only re-verifies Back restore with several loaded pages, relying on Activity retention (up to 3 routes). The `useBrowseUrl` native History API path stays as built in plan 01-03; the router fallback and a scroll-memory hook are not needed. Deeper navigation chains are re-checked in Phase 3.

## Task Commits

1. **Task 1: Every result renders as the final static card front in the responsive grid (tracer)** - `6c9d074` (feat)
2. **Task 2: Avatar placeholder, fade-in, fallback tile, eager first row and the remotePatterns test (TDD)**
   - RED: `7e214a0` (test)
   - GREEN: `0f61f80` (feat)
3. **Task 3: Back-navigation spike** - no commit; human decision recorded in this file

**Plan metadata:** the docs commit that adds this SUMMARY and the tracking updates.

## Files Created/Modified

- `components/card/character-card.tsx` - final D-01 card markup, static status frame, badge, name and species
- `components/card/card-avatar.tsx` - next/image avatar with load states, fallback tile, eager/lazy; exports `AVATAR_SIZES`
- `components/browse/character-grid.tsx` - responsive `ul` grid, `eager={index < 5}`, `aria-busy`
- `lib/api/avatar.ts` - `isAvatarUrl` guard plus origin and path-prefix constants
- `lib/config.test.ts` - node:test suite for `images.remotePatterns` and `isAvatarUrl`
- `next.config.ts` - added `images.remotePatterns`; existing keys kept
- `components/browse/browse-view.tsx` - renders `CharacterGrid` in place of the name list

## Decisions Made

- Spike answer `native-ok` (see "Spike decision"): plan 01-10 adds no history or scroll code.
- Card markup locked in its final D-01 form now, so Phase 2 only adds behaviour to it.

## Deviations from Plan

No behavioural deviations. Two small additions beyond the plan text, reported by the original executor at its checkpoint:

- The `inert` back-face and the star and link slots carry `data-slot` attributes (`star`, `link`) as stable hooks for Phase 2. Not in the plan.
- The loading and error placeholders in `BrowseView` keep `mt-12`. Only the real grid sits 16 px below the filter group, as the plan says. Plan 01-07 owns skeleton and error layout.

## Issues Encountered

None. Minor notes:

- CARD-01 is delivered for its Phase 1 scope only: the card front (avatar, clamped name, status badge with text, species) and the reserved empty star slot. The favourite star itself ships with CARD-06 in Phase 2 (D-03), so CARD-01 stays partial in REQUIREMENTS.md.
- BRW-11 is not complete after this plan: the spike only chose its path. Plan 01-10 completes it.
- STATE.md's current-plan pointer already read "Plan: 6 of 10" before this plan finished, because plan 01-06 (which ran before 01-05 in this phase) had advanced it. The pointer note was reported rather than hand-edited.
- The checkpoint-report notes referred to in the continuation prompt were not part of the prompt text and are therefore not reproduced here.
- Flagged assumptions from the plan remain unverified in a browser by automation: avatar `img.complete` detection on Activity re-show (RESEARCH Pitfall 7), and Vercel image-optimisation quota for 826 avatars (checked at the Phase 3 deploy, RESEARCH A5).

## Known Stubs

None. The empty star slot, link slot and back face are intentional reserved markup (D-01, D-03) filled by Phase 2 plans, not data stubs.

## Threat Flags

None. All new surface (image optimiser allow-list, avatar URLs, API text rendering) is covered by T-01-12, T-01-13 and T-01-14 in the plan's threat model.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Cards, grid and avatars are in place for plan 01-07 onward (loading skeletons, states) and for the Phase 2 flip, tilt and star work on the final markup.
- Plan 01-10 Task 3 should re-verify Back restore with several loaded pages; no history rewrite is planned.

---
*Phase: 01-foundation-browse*
*Completed: 2026-11-12*

## Self-Check: PASSED

All created files exist and commits 6c9d074, 7e214a0 and 0f61f80 are reachable from HEAD; no raw HTML injection prop under components/.
