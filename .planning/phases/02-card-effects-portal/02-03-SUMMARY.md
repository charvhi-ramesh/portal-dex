---
phase: 02-card-effects-portal
plan: 03
subsystem: ui
tags: [favourites, localStorage, useSyncExternalStore, tanstack-query, accessibility, tdd]
status: complete

requires:
  - phase: 01-foundation-browse
    provides: "formatCount, displayName, header shell, query client defaults"
  - phase: 02-card-effects-portal
    provides: "star slot on CharacterCard (02-01), totalCountOptions (02-02)"
provides:
  - "lib/favourites/store.ts: FAVOURITES_KEY, parseFavourites, toggleFavourite, favouriteLabel, createFavouritesStore (React-free, 28 tests)"
  - "components/favourites/use-favourites.ts: useFavouriteIds, useIsFavourite, toggleFavouriteId over a lazily created browser singleton"
  - "FavouriteStar on every card (CARD-06) and a live CollectedCounter in the header (COL-03)"
affects: [02-04, 03-detail-collection]

actuals:
  tokens: 5700
  tasks: 2
  commits: 4
plan_head_before: f6cee08ae02df12dba8452941c50943732d298c0
plan_head_after: 89b150245974f5afaf9af1e94493529d2ae97b53

tech-stack:
  added: []
  patterns:
    - "Subscribable store over injected storage and event target; useSyncExternalStore with an empty server snapshot so hydration matches and storage is first read after mount"
    - "Only toggle writes storage; read, parse failure, storage event and unavailable storage never write"
    - "Memory-only fallback for the session when getStorage, getItem or setItem throws"

key-files:
  created:
    - lib/favourites/store.ts
    - lib/favourites/store.test.ts
    - components/favourites/use-favourites.ts
    - components/card/favourite-star.tsx
    - components/layout/collected-counter.tsx
  modified:
    - components/card/character-card.tsx
    - components/layout/header.tsx

key-decisions:
  - "The star's accessible name is constant ('Add {name} to collection') and aria-pressed carries the state, so screen readers never announce 'Remove ..., pressed'"
  - "Header counter is responsive and the user accepted this: 'N collected' below 640 px, 'N / {total} collected' from 640 px once the total has loaded, instead of the spec showing the total at every width (320 px header budget)"
  - "An unknown, failed or zero total keeps the 'N collected' form, so the counter never reads 'N / 0'"
  - "A storage event before anything has read the list is ignored: the first read is already fresh"

patterns-established:
  - "Phase 3 Collection reads FAVOURITES_KEY / useFavouriteIds; the key and JSON array-of-IDs format are fixed (changing them after deploy needs a migration in parseFavourites)"

requirements-completed: [CARD-06, COL-01, COL-02, COL-03, CARD-01]

coverage:
  - id: D1
    description: "Favourites parsing, toggling, label, lazy read, write-only-on-toggle, storage events, memory fallback and listener lifecycle behave per the edge cases"
    requirement: "COL-02"
    verification:
      - kind: unit
        ref: "node --test lib/favourites/store.test.ts (28 pass); npm test (202 pass)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every card renders the star in the star slot; the header counter prerenders the contiguous zero-state text on /, /collection and /browse"
    requirement: "CARD-06"
    verification:
      - kind: integration
        ref: "npm run build && node scripts/smoke.ts route:/ '0 collected' 'Open portal' route:/collection '0 collected' 'Your collection' route:/browse 'Browse characters' (SMOKE OK)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Star toggles without flipping, persists across reload, syncs across tabs, screen reader name and pressed state, unreachable when flipped, corrupt and mixed stored values, blocked storage, Home card star"
    requirement: "CARD-01"
    verification: []
    human_judgment: true
    rationale: "Storage events across tabs, private mode, screen reader output and focus need a real browser; no browser automation is available"
  - id: D4
    description: "Counter updates the moment a star is toggled on any page, shows N / total from 640 px without a header jump, short form at 320 px, never N / 0 with the count request blocked"
    requirement: "COL-03"
    verification: []
    human_judgment: true
    rationale: "Cross-page reactivity and the responsive header need a real browser"
---

# Phase 2 Plan 03: Favourites Summary

**Defensive localStorage favourites store (parse, toggle, cross-tab sync, memory fallback) wired into a 44 px aria-pressed star on every card and a live responsive header counter that shows the API total from 640 px.**

## Performance

- **Duration:** about 20 min
- **Tasks:** 2 of 2
- **Files:** 7 (5 created, 2 modified)
- **No dependency added or changed**

## Accomplishments

- `lib/favourites/store.ts` is React-free with injected storage and event target. `parseFavourites` keeps only positive safe integers, de-duplicated (first occurrence wins), and never throws. `toggleFavourite` appends or removes and returns the same reference for an invalid ID. `createFavouritesStore` reads lazily, writes only in `toggle` (after re-reading storage, so another tab's ID is kept), notifies once per change, ignores unchanged storage events, and attaches the single `storage` listener only while subscribers exist.
- `FavouriteStar` sits in the card's star slot (a sibling of the flip button, so it cannot flip the card). It is a 44 x 44 toggle with `aria-pressed`, a constant label from `favouriteLabel(name)`, an outlined star when off and a filled pink `#FF7AC8` star when on, on a navy backing with a navy focus shadow.
- `CollectedCounter` replaces the static pill. The server and hydration render read an empty list, so prerendered HTML carries the contiguous text "0 collected" on every route (smoke confirms). From 640 px, `" / {total}"` is added once `totalCountOptions()` succeeds with a positive count.
- CARD-01 is complete: the Phase 1 card front now has avatar, two-line name, status badge, species and the favourite star.

## User Acceptance (on record)

The user accepted the responsive header counter in this plan: "N collected" below 640 px, "N / {total} collected" from 640 px once the total has loaded, instead of the spec showing the total at every width.

## TDD Cycle (Task 1)

- **RED** (`f6001b6`, `test(02-03)`): 28 `node:test` cases against signature-only stubs. Result: 28 tests, 5 pass, 23 fail. Every failure was an assertion on planned behaviour (for example `parseFavourites("[7]")` returned `[-1]`, `favouriteLabel` returned `""`, `toggle(4)` did not write `"[4]"`), not a load, syntax or discovery fault. The 5 passes are cases a stub satisfies by identity (same-reference return on invalid ID, empty read with no writes, unsubscribed listener not notified); no feature existed before. The `gsd_run check tdd-red-evidence` classifier was not run: the plan is `type: execute` (not `type: tdd`) and its RED evidence was inspected semantically from the TAP report.
- **GREEN** (`cea3902`, `feat(02-03)`): store implementation, 28 of 28 pass, tsc and eslint clean.
- **REFACTOR:** none needed.
- Task 1 UI (hooks, star, card wiring) followed as a second feat commit (`0516de4`).

## Task Commits

1. Task 1 RED: `f6001b6` test(02-03): add failing tests for the favourites store
2. Task 1 GREEN: `cea3902` feat(02-03): implement the defensive favourites store
3. Task 1 UI: `0516de4` feat(02-03): add the favourite star to every card
4. Task 2: `89b1502` feat(02-03): make the header counter live with the API total

`commits: 4` is measured from `git rev-list --count f6cee08..HEAD` (recorded in `plan_head_before`).

## Verification Results

- Per-task fast loop (`node --test lib/favourites/store.test.ts`, `npm test`, `npx tsc --noEmit`, `npm run lint`): all pass after each task (28 store tests, 202 total, 0 fail).
- Acceptance criteria for both tasks: all PASS (greps for the key, `"storage"`, `useSyncExternalStore`, `aria-pressed`, `favouriteLabel(`, `<FavouriteStar`, `<CollectedCounter`, `totalCountOptions()`, `useFavouriteIds()`, `sm:min-w-[19ch]`; absence of `0 collected` in header.tsx).
- Slow gate (`npm run build` then smoke): build compiled, 6 static pages, `SMOKE OK` (PASS `/` "0 collected" and "Open portal", `/collection` "0 collected" and "Your collection", `/browse` "Browse characters"). The smoke runner's own server was confirmed gone afterwards.
- The Phase gate (cumulative smoke plus contrast) is designated for the merged tree after 02-03 and 02-04 and was not run here.

## Human-check items (not run; need a real browser)

1. 02-03-T1: star toggles without flipping; three stars survive reload; a star set in a second tab appears in the first without reload; screen reader says "Add {name} to collection, toggle button, not pressed" then "pressed"; star unreachable when the card is flipped; `{oops` stored value shows no stars and no error; `["5", 1.5, 2]` shows only card 2 starred; starring works with storage blocked; the Home portal card's star works and is reflected on Browse.
2. 02-03-T2: counter changes instantly on any page; "N / total collected" at 1280 px with the total from the API and no header jump when it arrives; "N collected" on one row at 320 px with no horizontal scroll; "N collected" (never "N / 0") with `*rickandmortyapi.com/api/character?page=1*` blocked.
3. Flagged assumption to look at: a corrupt stored value is only replaced on the user's next toggle (no write on read, per the prohibition).

## Deviations from Plan

### Judgement call to surface

**Tracer feedback gate (Task 1 is `type="tracer"` with a `<human-check>`).** Strictly, the executor protocol (interactive, `end-of-phase`, tracer carrying a `<human-check>`) calls for a `checkpoint:human-verify` before expansion. The dispatching orchestrator instructed a single run to completion with browser-only checks recorded as human-check items, and the plan itself lists both human checks under "end-of-phase UAT". I therefore re-ran Task 1's full `<automated>` verify (all green) before starting Task 2, then continued, and queued the Task 1 human-check above for end-of-phase UAT. Task 2 touches a disjoint file set (header and counter), so nothing was layered onto an unproven star beyond what the UAT will confirm.

Otherwise: None - plan executed exactly as written. No Rule 1 to 3 fixes were needed.

**Total deviations:** 0 auto-fixed, 1 gate-handling judgement call. **Impact:** none on scope; the star and counter browser checks remain open for UAT.

## Authentication Gates

None.

## Known Stubs

None. (The stub `store.ts` existed only in the RED commit and was replaced in the GREEN commit.)

## Threat Flags

None. The new surface is localStorage reads and `storage` events, both covered by T-02-07, T-02-09 and T-02-10 (try/catch around `JSON.parse`, array-of-safe-integers only, only the favourites key or a clear handled, no write on event, no network use of the list).

## Next Phase Readiness

Ready for 02-04 (card tilt/frames wrap CharacterCard from outside; its props are unchanged). Phase 3 Collection can read `useFavouriteIds()` / `FAVOURITES_KEY`. The end-of-phase UAT still has to cover the two human-check items above.

## Self-Check: PASSED

All 5 created files exist; commits f6001b6, cea3902, 0516de4 and 89b1502 are ancestors of HEAD.
