---
phase: 03-detail-collection
plan: 03
subsystem: ui
tags: [view-transitions, tanstack-query, episodes, residents, accessibility, tdd]
status: complete

requires:
  - phase: 03-detail-collection
    provides: "03-01: CharacterDetail, DetailHero, CardAvatar sizes and rounded props, lib/detail/detail.ts"
  - phase: 02-card-effects-portal
    provides: "characterOptions query key, CharacterCard, Home portal View details link"
provides:
  - "lib/detail/episodes.ts: episodeIdsOf, episodeLabel, episodeChips (React-free, tested)"
  - "lib/detail/residents.ts: RESIDENT_LIMIT, locationIdOf, pickResidentIds, alsoFoundHeading (React-free, tested)"
  - "lib/query/detail.ts: episodesOptions, locationOptions, residentsOptions, seedCharacter"
  - "EpisodeStrip: labelled, focusable, horizontally scrolling episode region from one multi-ID request"
  - "ResidentsRow: 'Also found at {location}' mini cards from one location request and one multi-ID request"
  - "Card-to-hero View Transition (name character-{id}, class card-morph, type card-detail) plus detail-fade for unpaired arrivals and a reduced-motion opacity fade"
affects: [03-detail-collection]

actuals:
  tokens: 8400
  tasks: 3
  commits: 5
plan_head_before: 6cfedb0c8417f1d2082ce4e3335335d712609af7
plan_head_after: 9af303e7caf63f153245e7da06686e312c17686d

tech-stack:
  added: []
  patterns:
    - "Detail-page queries are keyed by their IDs (sorted, deduped) and forward the query AbortSignal; only extractId output ever builds a request path"
    - "seedCharacter writes the detail key only when it is absent (never an updater), so the destination renders in the navigation commit without restarting a staleTime clock"
    - "View Transition names come from numeric IDs only (character-{id}); share is typed by transition type with default none"

key-files:
  created:
    - lib/detail/episodes.ts
    - lib/detail/episodes.test.ts
    - lib/detail/residents.ts
    - lib/detail/residents.test.ts
    - lib/query/detail.ts
    - components/detail/episode-strip.tsx
    - components/detail/residents-row.tsx
  modified:
    - components/detail/character-detail.tsx
    - components/detail/detail-hero.tsx
    - components/card/character-card.tsx
    - components/home/portal-stage.tsx
    - lib/detail/detail.ts
    - app/globals.css

key-decisions:
  - "Whole card morphs into the hero avatar box (user decision 2026-11-12), not only the avatar"
  - "Only the loading and loaded episode region is a landmark; the enclosing section is unlabelled there so 'Episodes, region' is announced once"
  - "Mini cards carry no transition name, so a detail-to-detail hop fades instead of flying the old hero"

patterns-established:
  - "Keep-mounted Retry (retrying flag set in the click handler, cleared in the refetch promise) reused for the strip and the residents row"

requirements-completed: [DET-02, DET-03, DET-04]
requirements-note: "A11Y-05 is not marked: the requirements tool reports it blocked (it spans more than this plan). The episode-strip half is built here; the browser checks for all four are deferred to the end-of-phase UAT"

coverage:
  - id: D1
    description: "episodeChips, episodeLabel, episodeIdsOf: ordering (2 before 10, stable ties, unknown last), one chip per URL for 0, 1 and 51 URLs, adjacent duplicate chips, missing episode, unparsable and unsafe IDs, U+00B7 label with apostrophes and non-ASCII names; episodesOptions key, one request with the signal, [] without a request, single-object normalisation"
    requirement: "DET-03"
    verification:
      - kind: unit
        ref: "node --test lib/detail/episodes.test.ts (17 pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "pickResidentIds (exclusion, 12 cap, order, duplicates, invalid URLs, zero limit), locationIdOf, alsoFoundHeading, locationOptions and residentsOptions keys and single requests, seedCharacter fills only an absent key and keeps data and dataUpdatedAt"
    requirement: "DET-04"
    verification:
      - kind: unit
        ref: "node --test lib/detail/residents.test.ts (21 pass); npm test (279 pass)"
        status: pass
    human_judgment: false
  - id: D3
    description: "View Transition wiring compiles into the production build and the view-transition rules, including the reduced-motion override, survive Tailwind and the CSS minifier; every route still serves"
    requirement: "DET-02"
    verification:
      - kind: integration
        ref: "npm run build; grep card-morph in .next/static CSS (2 group rules, old, new, detail-fade present); node scripts/smoke.ts with the plan's exact command ended SMOKE OK (7 PASS)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Morph quality, Back restoring Browse, reduced-motion fade, strip keyboard behaviour and screen-reader output, residents network behaviour and mini card naming"
    requirement: "DET-02, DET-03, DET-04, A11Y-05"
    verification: []
    human_judgment: true
    rationale: "Visual, keyboard, screen-reader and network-panel behaviour need a real browser; no browser automation is available and the user chose one consolidated UAT at the end of Phase 3"

duration: 35 min
completed: 2026-11-12
---

# Phase 3 Plan 03: Episodes, Residents and the Card-to-Hero Morph Summary

**The detail page now ends with a keyboard-scrollable episode strip (one multi-ID request, "S01E01 · Pilot" chips in ID order) and an "Also found at {location}" row of up to 12 other residents, and View details morphs the whole card into the hero through React's ViewTransition with a fade for every unpaired arrival and under reduced motion.**

## Performance

- **Duration:** about 35 min
- **Tasks:** 3 of 3
- **Files:** 13 (7 created, 6 modified); no dependency added or changed

## Accomplishments

- `episodeChips` always returns exactly `urls.length` chips, sorted by numeric ID with a stable comparator; unparsable IDs ("007", "1.5", beyond the safe-integer range, empty) become "Unknown episode" chips at the end, a missing episode becomes "Episode {id}".
- `EpisodeStrip` shows "Appears in N episodes" and a `role="region"`, `tabIndex={0}` strip labelled by its "Episodes" heading, with `aria-busy` and pulse placeholders while loading, "No episodes listed." with no region and no request for zero episodes, and a keep-mounted Retry on failure.
- `ResidentsRow` makes no request for an unknown location, renders nothing for a 404 location, no other residents or an empty response, shows skeleton tiles while residents load, and otherwise renders mini cards that are one link each, named by the avatar alt with the visible name `aria-hidden`.
- `seedCharacter` runs on View details (card) and on mini card click so the hero renders in the navigation commit and no extra character request is made.
- `globals.css` adds `::view-transition { pointer-events: none }`, a 350 ms `.card-morph` group, the `detail-fade` arrival fade, and a reduced-motion block that turns the group animation off and crossfades in place.

## TDD Cycles

- **Task 1 RED** `a339cdd`: 17 tests against signature-only stubs; 15 failed on their planned assertions (labels, ordering, keys, request URL and signal), the 2 that passed were the empty-list cases that a stub returning `[]` satisfies by construction. Semantic assessment: every target test ran and the failures were value mismatches, not import, syntax or fixture faults. **GREEN** `7b98f08` (with the strip component). **REFACTOR:** none.
- **Task 2 RED** `5c90761`: 21 tests against stubs; 18 failed on assertions (stub IDs, keys, headings, un-seeded cache), 3 passed by construction (the 404 `null`, the `seedCharacter` no-overwrite cases, which a no-op satisfies). Semantic assessment as above. **GREEN** `a386785` (with the residents row). **REFACTOR:** none.
- The RED evidence was judged by reading the node test output; `gsd_run check tdd-red-evidence` was not run (no `tdd_mode` gate was passed to this executor).

## Task Commits

1. Task 1 RED: `a339cdd` test(03-03): add failing tests for episode chips, labels and the episodes query
2. Task 1 GREEN: `7b98f08` feat(03-03): show a labelled, keyboard-scrollable episode strip from one multi-ID request
3. Task 2 RED: `5c90761` test(03-03): add failing tests for resident selection, headings, queries and cache seeding
4. Task 2 GREEN: `a386785` feat(03-03): show up to 12 other residents of the last location as linked mini cards
5. Task 3: `9af303e` feat(03-03): morph the card into the detail hero with View Transitions and fade other arrivals

`commits: 5` is measured from `git rev-list --count 6cfedb0..HEAD` against the persisted ledger, before the docs commit.

## Verification Results

- Fast loop after each task: `npm test` (258, then 279 pass, 0 fail), `npx tsc --noEmit` clean, `npx eslint app components lib scripts` clean. All acceptance greps for Tasks 1 to 3 pass, including the `prefetch={false}` invariant, the transition-property invariant, `card-morph` count of 2 in `app/globals.css`, and no `dangerouslySetInnerHTML` in app, components or lib.
- Slow gate: `npm run build` succeeded (routes `/`, `/browse`, `/collection`, `/character/[id]`, `/character/1`); the CSS grep for `card-morph` in `.next/static` passed and shows the group rule twice plus old, new and `detail-fade` rules; the plan's exact smoke command ended `SMOKE OK` (7 PASS). The smoke runner starts and stops its own server; no server was left running.
- The View Transitions morph could not be judged clean or not clean: no browser was available. The one-edit fallback (remove the card's `ViewTransition` wrapper) was not applied and not needed for the build or lint.

## Accepted Decisions and Exceptions (recorded as the plan requires)

- **(a) Whole card morphs, not only the avatar (user decision, 2026-11-12).** The card's `article` is the named element, so the whole card morphs into the hero avatar box. This knowingly deviates from the literal "the avatar morphs" wording of DET-02 and SPEC 5.4 (the avatar sits on the rotated, backface-hidden front face while View details, on the back face, is pressed). The fallback is unchanged: remove the card's `ViewTransition` wrapper in `components/card/character-card.tsx` and every arrival fades in via the hero's `enter="detail-fade"`.
- **(b) Accepted exception (checker I-3).** The browser-generated `::view-transition-group(.card-morph)` animation that moves the card snapshot onto the hero box interpolates `width` and `height` as well as `transform`, an accepted exception to "only transform and opacity". The CSS written in this plan animates opacity only (`detail-fade-in`), and the reduced-motion override disables the group animation.
- **(c) UAT verdict pending.** Whether the whole-card snapshot is clean (no mirrored text, no squashed text, no second copy, nothing left outside the hero box) and whether the fallback is needed will be known only when the user runs Task 3's human-check; no verdict has been reached.

## Deviations from Plan

**1. [Rule 1 - Accessibility bug] Duplicate landmark avoided on the episode section.**
- **Found during:** Task 1
- **Issue:** the plan gives both the enclosing `section` and the scroll `div role="region"` `aria-labelledby` pointing at the same heading, which makes two nested landmarks with the same name ("Episodes, region" read twice).
- **Fix:** the section carries `aria-labelledby` only in the branches without a scroll region (no episodes, error); in the loading and loaded branches only the scroll region is labelled. The required greps (`role="region"`, `tabIndex={0}`, `aria-labelledby`, `useId()`) still pass.
- **Files modified:** `components/detail/episode-strip.tsx`
- **Commit:** `7b98f08`

**2. [Judgement note] GREEN commits include the component work.** Each task's RED commit holds tests plus signature stubs; its GREEN commit holds the implementation and the component that uses it, since the plan defines one task per commit pair.

**3. Tracer feedback gate.** Task 1's human-check is deferred to the end-of-phase UAT by the user's package choice (recorded 2026-11-12), not yet run and not approved. Its full automated verify (`node --test lib/detail/episodes.test.ts`, `npm test`, `tsc`, lint) was re-run green before Task 2.

**Total deviations:** 1 auto-fix, 2 judgement notes. **Impact:** none on the plan's goals.

## Human-check items (end-of-phase UAT, not run; need a real browser)

1. **03-03-T1 (tracer, deferred to the end-of-phase UAT by the user's package choice, not yet run):** one episode request, "S01E01 · Pilot" chips in ID order, chip count equals "Appears in N episodes", Tab reaches the strip with the teal ring, announced once as "Episodes, region", arrow keys scroll it, single-episode character shows one chip, page never scrolls sideways at 320 px.
2. **03-03-T2:** "Also found at {location}" with at most 12 others and never the current character, one location plus one multi-ID request in the network panel, one Tab stop and one announcement per mini card, an unknown last location shows no section and makes no location request.
3. **03-03-T3:** morph from Browse, Collection and Home in Chromium or Edge 125+; Back restores Browse (filters, steps, scroll position, no new list request) with no morph; header navigation never morphs; mini cards fade the hero in; reduced motion only fades; other browsers do not error; the "clean within about 30 minutes" call and the fallback if needed.
4. **03-03-T3 whole-card snapshot:** DevTools Animations at 10% speed, View details from a Browse card at 1280 px and 375 px: the portrait card scales into the square hero avatar box and crossfades into the photo with no mirrored text, no visibly stretched or squashed card text, no second copy and nothing left outside the hero box at the end; otherwise record "not clean" and apply the one-edit fallback.
5. **Also to look at in the browser:** the strip and residents row focus rings are not clipped, the residents grid at 320 px, and a retry after going offline keeps focus on Retry.

## Authentication Gates

None.

## Known Stubs

None. (Stub signatures existed only in the two RED commits.)

## Threat Flags

None beyond the plan's register. T-03-08 holds (only `extractId` output builds paths; resident and location URLs are never requested; the resident list is capped at 12 and excludes the current ID), T-03-09 (API strings render as React text, no raw-HTML prop), T-03-10 (`::view-transition` has `pointer-events: none`, names are `character-{numeric id}`) and T-03-11 (per detail page at most one character, one episode, one location and one resident request, signal forwarded) are in place.

## Next Phase Readiness

Plans 03-04 and 03-05 can rely on `lib/query/detail.ts`, the `card-morph` rules in `app/globals.css` (03-04's CSS test checks the override sits inside the reduced-motion block; there are exactly two `view-transition-group(.card-morph)` rules) and the `CARD_DETAIL_TRANSITION` and `cardTransitionName` exports. Open: the deferred browser UAT, including the morph verdict.

## Self-Check: PASSED

All 13 files exist; commits a339cdd, 7b98f08, 5c90761, a386785 and 9af303e are ancestors of HEAD.
