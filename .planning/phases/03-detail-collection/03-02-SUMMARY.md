---
phase: 03-detail-collection
plan: 02
subsystem: ui
tags: [collection, tanstack-query, motion, animate-presence, focus-management, live-region, accessibility, tdd]
status: complete

requires:
  - phase: 02-card-effects-portal
    provides: "useFavouriteIds and the favourites store (02-03), CharacterCard, TiltFrame, FavouriteStar"
  - phase: 01-foundation-browse
    provides: "fetchCharactersByIds and toIdList, ErrorPanel, SkeletonGrid, useAnnouncer and LiveRegion"
  - phase: 03-detail-collection
    provides: "scripts/smoke.ts !absent tokens (03-01)"
provides:
  - "lib/collection/collection.ts: orderByFavourites, nextFocusIndex, removalAnnouncement (React-free, tested)"
  - "lib/query/collection.ts: collectionOptions keyed ['characters','collection', sorted ID list]"
  - "components/collection/collection-view.tsx: CollectionView with skeleton, empty, error and grid states, removal hand-off and live region"
  - "components/collection/collection-item.tsx: CollectionItem, a motion.li that is inert while exiting"
  - "components/card/focus-card.ts: focusCard(container) shared hand-off helper (plan 03-04 reuses it)"
  - "/collection page with the 'Your collection' h1 (id collection-heading)"
affects: [03-detail-collection]

actuals:
  tokens: 5800
  tasks: 2
  commits: 4
plan_head_before: d960efc16717fc74721625550263a094168e75e2
plan_head_after: 89617ea4bcf83627b0c0e5f206532f3d4ea87c70

tech-stack:
  added: []
  patterns:
    - "Capture-phase click listener on a grid records which card is being removed, with a hadFocus flag read before the card turns inert; every side effect runs in AnimatePresence onExitComplete, never in render or a setState effect"
    - "A server-false useSyncExternalStore (useHydrated) gates 'read after mount' views so the empty state cannot flash"
    - "A data-less failed query keeps the error panel mounted through Retry with a click-handler flag cleared in the refetch promise"

key-files:
  created:
    - lib/collection/collection.ts
    - lib/collection/collection.test.ts
    - lib/query/collection.ts
    - components/collection/collection-view.tsx
    - components/collection/collection-item.tsx
    - components/card/focus-card.ts
  modified:
    - app/collection/page.tsx

key-decisions:
  - "Order is favourited (insertion) order; the query key is the sorted ID list, so re-ordering never refetches and an older list's response cannot fill the current key"
  - "Removal side effects run in onExitComplete; focus and scroll move only when a removed card held focus as its star was pressed (hadFocus), and focus has not moved on since"
  - "Placeholder data that holds none of the current favourites counts as loading (skeleton), not empty, so adding a favourite in another tab cannot flash the empty state"
  - "The grid branch takes precedence over the empty state while a card is exiting, so the last card finishes its exit first"

patterns-established:
  - "focusCard(container): focus .card-flip else the article; true only when focus landed"

requirements-completed: [COL-04, COL-05, COL-06]

coverage:
  - id: D1
    description: "orderByFavourites, nextFocusIndex, removalAnnouncement and collectionOptions: favourited order, duplicates, missing IDs, clamping, one-to-many wording, sorted-ID key, one request with the query signal, [] without a request, single-object normalisation"
    requirement: "COL-04, COL-05"
    verification:
      - kind: unit
        ref: "node --test lib/collection/collection.test.ts (19 pass); npm test (241 pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "/collection prerenders its heading and the aria-busy skeleton region and never the empty state or the interim copy; the other routes still build with the Motion-driven grid"
    requirement: "COL-04, COL-06"
    verification:
      - kind: integration
        ref: "npm run build && node scripts/smoke.ts (plan command) ended SMOKE OK, 8 PASS lines"
        status: pass
    human_judgment: false
  - id: D3
    description: "Cards from one request in favourited order, empty-state links and Tab order, error panel and Retry focus"
    requirement: "COL-04, COL-06"
    verification: []
    human_judgment: true
    rationale: "Hydration timing, the network panel, the storage panel and focus after Retry need a real browser; no browser automation is available"
  - id: D4
    description: "Removal animation (fade only under reduced motion), focus hand-off only when the removed card held focus, one announcement per batch, double-press safety, other-tab add and remove without moving focus or scroll"
    requirement: "COL-05"
    verification: []
    human_judgment: true
    rationale: "Exit animation, real focus and scroll behaviour, cross-tab storage events and screen-reader output need a real browser"

duration: 15 min
completed: 2026-11-12
---

# Phase 3 Plan 02: Collection Summary

**`/collection` shows every favourite as a full card from one multi-ID request in favourited order, with skeletons until favourites are read after mount, an empty state linking to Browse and the portal, and an animated removal that announces itself and moves focus only when the removed card held it.**

## Performance

- **Duration:** about 15 min of executor time
- **Tasks:** 2 of 2
- **Files:** 7 (6 created, 1 modified); no dependency added or changed

## Accomplishments

- `orderByFavourites`, `nextFocusIndex` and `removalAnnouncement` are React-free and covered by 19 `node:test` cases (with `collectionOptions`: sorted-ID key, one request to `/character/1,2,3` with the query signal, `[]` with no request, single-object response normalised).
- `CollectionView` renders, in order: skeleton (not yet hydrated), grid, empty state, error panel with a Retry that stays mounted, loading skeleton. The request is enabled only after hydration and with at least one ID, and `keepPreviousData` keeps remaining cards on screen while a smaller list refreshes in the background.
- Removal: a capture-phase click listener records `{index, name, hadFocus}` before the store updates and before the card turns `inert`; `CollectionItem` is `inert` while exiting (`useIsPresent`) and fades and shrinks out (fade only under reduced motion); `onExitComplete` announces all removals once ("A and B removed from collection") and moves focus (via `focusCard`, or to `#collection-heading` when none remain) only when a removed card held focus and focus has since fallen to the body, a disconnected node or an inert subtree. No `scrollIntoView` call exists in the component.
- After a successful Retry, focus moves to the first card's flip button or to the heading.

## TDD Cycle (Task 1)

- **RED** `e034a4b`: 19 tests against signature-only stubs returning wrong values; 13 failed on their assertions (the target `orderByFavourites returns cards in favourited order, not API ID order` failed with `[2,5,9]` against the expected `[9,2,5]`). `gsd_run check tdd-red-evidence` returned `RED_EVIDENCE_OK` (reason `target_test_failed`); semantic assessment: the target executed and failed on the planned assertion, not on an import, syntax or fixture fault.
- **GREEN** `338cf66`: implementation; 19 of 19 pass. **REFACTOR:** none.

## Task Commits

1. Task 1 RED: `e034a4b` test(03-02)
2. Task 1 GREEN: `338cf66` feat(03-02) helpers and `collectionOptions`
3. Task 1 view and page: `e5466b3` feat(03-02)
4. Task 2: `89617ea` feat(03-02) removal animation, focus hand-off, announcement

`commits: 4` is measured from `git rev-list --count d960efc..HEAD` against the persisted ledger, before the docs commit.

## Verification Results

- Fast loop after each task: `npm test` 241 pass 0 fail; `npx tsc --noEmit` clean; `npx eslint app components lib scripts` clean (react-hooks rules included). All acceptance greps for both tasks pass, including `hadFocus` appearing 3 times outside comments and no `scrollIntoView` or `toggleFavouriteId` in `components/collection`.
- Tracer gate: Task 1's automated verify was green before Task 2 began; its browser human-check is deferred (see below).
- Slow gate: `npm run build` succeeded (`/collection` static). Smoke with the plan's exact command ended `SMOKE OK` (8 PASS: heading, title, `collection-heading`, `aria-busy`, no empty-state text, no interim copy, `/browse`, `/`). The `next start` server was stopped by the runner.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Placeholder data of an older ID list could flash the empty state.**
- **Found during:** Task 1 (writing the render precedence)
- **Issue:** with `keepPreviousData`, a new ID list whose placeholder holds none of the current favourites (for example the earlier response was `[]` because every ID was missing, then a card is starred in another tab) gives zero matching characters while the real request is still pending, which would show "No cards collected yet" for a user who has favourites.
- **Fix:** `loading` is true when `query.data` is undefined or when the data is placeholder, no current favourite matches and IDs exist; that shows the skeleton instead.
- **Files modified:** `components/collection/collection-view.tsx`
- **Committed in:** `e5466b3`

**2. [Rule 1 - Bug] A failed Retry could leave the focus-after-retry flag set.**
- **Found during:** Task 2
- **Issue:** if Retry fails again the flag would stay true and a later unrelated load (a cross-tab change) would pull focus to the first card.
- **Fix:** the refetch promise clears the flag when the result still has no data; a successful result is handled (and cleared) by the data effect.
- **Files modified:** `components/collection/collection-view.tsx`
- **Committed in:** `89617ea`

**Other judgement notes (no behaviour change from the plan):** the TDD GREEN commit contains the helpers and query only, and the view and page are a separate `feat` commit; the Task 2 render order puts the grid branch before the empty and error branches so a leaving last card can finish its exit.

---

**Total deviations:** 2 auto-fixed (both Rule 1). **Impact:** both are small guards inside the planned files; no scope creep.

## Issues Encountered

None. The RED TAP report needed `NODE_NO_WARNINGS=1` and stderr dropped so it starts with `TAP version 13` for the classifier.

## Human-check items (end-of-phase UAT, not run; need a real browser)

1. **Tracer (03-02-T1), deferred to the end-of-phase UAT by the user's package choice, not yet run:** `npm run build`, `node node_modules/next/dist/bin/next start -p 3000`; star three cards on /browse (third, first, second), open /collection and reload with Slow 4G. Expected: cards in starring order from exactly one `/api/character/{ids}` request, skeletons first with no "No cards collected yet" flash; `[1, 99999]` shows only card 1, no error, stored value unchanged; `{oops` and a missing key show the empty state (Browse characters, then Open the portal) with no API request.
2. **03-02-T2:** with four favourites and a screen reader, remove the second card (focus lands on the card that took its place), the last card (focus on the new last card), press a star twice quickly (one removal, one announcement), remove every card (focus on "Your collection", then the empty state). Other-tab add and remove without reload and without moving focus; other-tab removal while focus sits on the body (Live expression `document.activeElement` stays `body`, page does not jump, nothing announced). Fade only under reduced motion. Offline then online then Retry puts focus on the first card.
3. **320 px:** two columns, empty-state links wrap, no horizontal scroll; Tab order Browse characters then Open the portal.
4. **Known browser limitation (flagged in the plan):** Safari does not focus a button on mouse click, so a mouse removal there records `hadFocus: false` and leaves focus where it was.

## Authentication Gates

None.

## Known Stubs

None. (Signature-only stubs existed only in the RED commit.)

## Threat Flags

None beyond the plan's register. T-03-05 holds: IDs reach the request path only through `toIdList` inside `fetchCharactersByIds`. The Collection never writes favourites (no `toggleFavouriteId` in `components/collection`; writes happen only through the card's own star), and the only outgoing request is the one multi-ID call to rickandmortyapi.com.

## Next Phase Readiness

Plan 03-04 can reuse `focusCard` from `components/card/focus-card.ts`. Open items: the deferred browser UAT, and the first-hit HTTP 404 decision recorded in 03-01.

## Self-Check: PASSED

All created files exist; commits e034a4b, 338cf66, e5466b3 and 89617ea are ancestors of HEAD.
