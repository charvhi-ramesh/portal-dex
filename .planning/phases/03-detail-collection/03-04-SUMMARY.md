---
phase: 03-detail-collection
plan: 04
subsystem: ui
tags: [accessibility, focus-management, browse, review-fixes]
status: complete

requires:
  - phase: 03-detail-collection
    provides: "03-02: components/card/focus-card.ts (focusCard)"
  - phase: 01-foundation-browse
    provides: "01-REVIEW.md warnings WR-02, WR-03, WR-06"
provides:
  - "WR-02 fixed: focus lands on the first card's flip button (or Clear filters when empty) after a successful first-page Retry"
  - "WR-03 fixed: a scroll-started load, or a Retry that adds nothing, never drops focus to the page body when focus was in the Load more area"
  - "WR-06 fixed: the pending focus hand-off is tied to the filter key it was made for"
  - "LOAD_MORE_ID (load-more.tsx) and CLEAR_FILTERS_ID (empty-panel.tsx) hand-off ids"
affects: [03-detail-collection]

scope: "REDUCED by the user for time on 2026-11-12 (see Scope Reduction)"

actuals:
  tokens: 4200
  tasks: 1
  commits: 3
plan_head_before: f3dee13e29ea368c799cc3e877e21d2e966e03f6
plan_head_after: 7d6d5eb2d777fc013f23672b68bc491e0fddd579

tech-stack:
  added: []
  patterns:
    - "Focus requests are refs carrying the filter key they were made for; an effect drops a request whose key no longer matches"
    - "A scroll-started load moves focus only to repair a loss (focus was in the load area and is now on body or detached)"

key-files:
  created: []
  modified:
    - components/browse/browse-view.tsx
    - components/browse/load-more.tsx
    - components/browse/empty-panel.tsx

key-decisions:
  - "Hand-off order after a settled load: inline Retry, first new card (focusCard), end note, else the Load more button"
  - "Scroll loads move focus only when hadFocus and focusLost; button presses always hand off"

requirements-completed: []
requirements-note: "A11Y-01 to A11Y-06 are NOT marked complete: scope reduced by the user for time on 2026-11-12; static accessibility gates not built; A11Y-01 to A11Y-06 remain Pending and rest on the end-of-phase browser and Lighthouse UAT"

coverage:
  - id: F1
    description: "WR-02, WR-03 and WR-06 focus fixes in the Browse view compile, lint clean, leave all 279 existing tests green and the production build and routes serving"
    requirement: "A11Y-01"
    verification:
      - kind: integration
        ref: "npx tsc --noEmit; npx eslint app components lib scripts; npm test (279 pass, 0 fail); npm run build; node scripts/smoke.ts (SMOKE OK, 9 PASS)"
        status: pass
    human_judgment: false
  - id: F2
    description: "Real focus behaviour of the three fixes (Retry then focus, end of list, failed scroll load, chip pressed during Load more)"
    requirement: "A11Y-01"
    verification: []
    human_judgment: true
    rationale: "Focus movement, assistive-technology output and network conditions need a real browser; no browser automation is approved and the user chose one consolidated UAT at the end of Phase 3"

duration: 20 min
completed: 2026-11-12
---

# Phase 3 Plan 04: Accessibility pass (reduced scope: Phase 1 focus warnings only) Summary

**Scope reduced by the user for time on 2026-11-12; static accessibility gates not built; A11Y-01 to A11Y-06 remain Pending and rest on the end-of-phase browser and Lighthouse UAT. What was built: the three open Phase 1 focus warnings WR-02, WR-03 and WR-06 are fixed in the Browse view.**

## Scope Reduction

The user approved, in the orchestrator's conversation on 2026-11-12 because time is critical, doing only the Phase 1 review-warning fixes (plan Task 2: WR-02, WR-03, WR-06). Nothing skipped was built or approximated.

## Accomplishments

- **WR-02:** `retry()` records the filter key in `pendingFirstFocus`. An effect keyed on `currentKey`, `showError` and the presence of data waits while the error panel shows or data is missing, then focuses the first card's flip button through `focusCard`, falling back to `#browse-clear-filters` when the result is empty. A request for a different key is dropped.
- **WR-06:** the index-only ref is replaced by `pendingFocus = { key, index, trigger, hadFocus }`. The settle effect now depends on `currentKey` and drops a request whose key differs, so pressing a filter chip while Load more is in flight never moves focus into another result set.
- **WR-03:** both triggers record a request. `hadFocus` is whether focus was inside the new `loadAreaRef` wrapper around `<LoadMore>` when the load started. A scroll load hands off only when `hadFocus` and focus is now lost (on `body`, null or detached); button presses always hand off. Order: inline Retry after a failure, first new card (`focusCard`), end note when the list ended, else the Load more button (a Retry that added no new card).
- The first-new-card hand-off now goes through `focusCard` (the flip button, named by the card label) instead of `querySelector("article")`, which is also the Browse part of the focus fix in IN-05.
- Disposition file `01-REVIEW-DISPOSITION.md`: WR-02, WR-03 and WR-06 are now "fixed" with their commits.

## Task Commits

1. WR-02 `cf89e93` fix(03-04): hand focus to the first card or Clear filters after a first-page Retry (also adds `CLEAR_FILTERS_ID`)
2. WR-06 `1a4da78` fix(03-04): tie the pending focus hand-off to its filter key
3. WR-03 `7d6d5eb` fix(03-04): keep focus after scroll-started loads and Retry that add nothing (also adds `LOAD_MORE_ID`)

`commits: 3` is measured from `git rev-list --count f3dee13..HEAD` against the persisted ledger, before the docs commit.

## Verification Results

- Fast loop after each commit: `npx tsc --noEmit` clean, `npx eslint app components lib scripts` clean (no set-state-in-effect, refs or exhaustive-deps findings), `npm test` 279 pass, 0 fail. No dependency added or changed.
- Slow gate (shrunk by the user to build plus the existing smoke): `npm run build` succeeded; the smoke run ended `SMOKE OK` (9 PASS) on `/`, `/browse`, `/collection`, `/character/1`, `/no-such-page` (404) and `/character/abc`. No new smoke tokens were added. The smoke runner starts and stops its own server; none was left running.

## Deviations from Plan

### Skipped by the user's scope reduction (nothing silently dropped)

- **Task 1 (tracer) not built:** `lib/a11y/html-checks.ts` and its test, `lib/a11y/css-checks.ts` and its test, and the `@a11y` token in `scripts/smoke.ts` (lang, one h1, landmarks, alt text, labelled regions, tabindex, nesting, aria-labelledby targets, heading levels) were not created or edited. The stylesheet node:test of `app/globals.css` (keyframes, focus ring, reduced-motion overrides) was not created. `scripts/smoke.ts` is unmodified. The tracer's automated verify was therefore not applicable; only the baseline fast loop was run.
- **Task 2 items outside WR-02, WR-03, WR-06 not done:** `components/home/portal-stage.tsx` (Retry hand-off through `focusCard`) and `components/card/card-avatar.tsx` (alt and fallback label from `displayName`, the empty-alt hardening) were not changed. The Home portal Retry still uses its existing article lookup, and an empty API name can still give an empty alt. IN-05 is therefore still open apart from the Browse hand-off now using `focusCard`.
- **Lighthouse-related additions:** none added beyond the text already in the plan (listed below).
- **Slow gate shrunk:** plan command with `@a11y` tokens replaced by the existing expectations only.
- **Requirements:** A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05 and A11Y-06 were not marked complete and `requirements mark-complete` was not called for them.

### Minimum shared with Task 1 / Task 2

- `LOAD_MORE_ID` and `CLEAR_FILTERS_ID` (plan Task 2 steps 1 and 2) were added because the WR-02 and WR-03 hand-offs need them. No Task 1 helper was needed.

### Gate adjustment (carried from 03-01)

- The plan's slow-gate command uses `route404:/character/abc`; this build returns status 200 on the first request for an unseen invalid ID (documented in `03-01-SUMMARY.md`: partial prerender flushes before `notFound()`; the body has `noindex`). The gate was run with `route:/character/abc "noindex"`, matching the 03-01 decision. No repo change.

### Auto-fixed Issues

None.

## Known Stubs

None.

## Threat Flags

None. No new network endpoints, auth paths or file access. T-03-13 (focus hand-off) is mitigated as planned: hand-offs fire only for the key they were recorded for and only after a press or a lost focus; the ids used with `getElementById` are fixed constants.

## Human-check items (deferred to the end-of-phase UAT, NOT yet run, nothing here is claimed as passed)

Run on `npm run build` plus `node node_modules/next/dist/bin/next start -p 3000`.

1. **Tracer 03-04-T1 human-check (deferred, not run; its automated half was not built):** Lighthouse Accessibility (Desktop, incognito, no extensions) on `/`, `/browse`, `/collection`, `/character/1` and `/no-such-page`: no failed audits, score 90 or more, scores recorded (A11Y-06).
2. **03-04-T2 focus checks, keyboard only, with a screen reader where noted:**
   - (a) DevTools Network Offline, open `/browse?q=morty` in a new tab, Tab to Retry, go online, press Enter: focus lands on the first card's flip button with the teal ring and the card label is read; repeat with `/browse?q=zzzz`: focus lands on Clear filters (WR-02).
   - (b) Search "rick", Tab to Load more and wait while the list auto-loads to the end: focus lands on "You've reached the end of the dimension.", never on the page body (WR-03).
   - (c) Tab to Load more, go Offline, scroll to the bottom; go online and press the inline Retry: after the failed load focus is on the inline Retry; after a Retry that adds no new card focus is on Load more (WR-03).
   - (d) Press Load more and, before it finishes, press the Alive chip: focus stays on the Alive chip (WR-06).
   - (e) Home Retry to the revealed card's flip button: not covered by this reduced plan (portal-stage not changed); record the current behaviour only.
3. **Phase 1 deferred UAT 37:** screen reader on `/browse`, press Human: one announcement of the exact-Human total, never the Humanoid-inflated number; Alive, Dead, Alive quickly gives one announcement.
4. **Phase 1 deferred UAT 38:** DevTools Network: type "rick" then quickly "rickx": the superseded request shows as cancelled; revisiting a filter set makes no request; `node --test lib/query/options.test.ts` is green.
5. **Phase 1 deferred UAT 41:** "Slow 4G" at 320, 700, 1100 and 1400 px: 4, 6, 8 and 10 skeleton cards, no layout shift when cards replace them (watch near 640 px); under reduced motion the skeletons are static.
6. **Phase 1 deferred UAT 44:** Load more by keyboard: "Loading more..." then focus on the first new card's flip button with the ring and "{n} more characters loaded" announced.
7. **Keyboard pass** on `/`, `/browse`, `/collection` (empty and with cards), a detail page and the 404: every control reachable in visual order, the 2 px teal ring always visible, no trap except the open mobile menu.
8. **Screen-reader pass** (NVDA with Firefox or Chrome, or Narrator with Edge) on the same pages: landmarks, one h1, card labels, star pressed states, live announcements.
9. **Reduced motion (A11Y-02, manual-only):** items 9a to 9i exactly as written in `03-04-PLAN.md` (Human-check items, item 9).
10. **Status never by colour alone:** every card badge and the hero badge show text.
11. **Touch targets and reflow (A11Y-04, manual-only):** items 11a to 11c exactly as written in `03-04-PLAN.md` (Human-check items, item 11).

Because the served-HTML and stylesheet gates were not built, the checks they would have automated (lang, single h1, landmarks, alt text, labelled regions, no positive tabindex, no nested interactive elements, aria-labelledby targets, heading order, keyframe properties, focus ring, reduced-motion overrides) are covered only by items 1, 7, 8 and 9 above.

## Self-Check: PASSED

- FOUND: `components/browse/browse-view.tsx`, `components/browse/load-more.tsx`, `components/browse/empty-panel.tsx`
- FOUND commits: `cf89e93`, `1a4da78`, `7d6d5eb`
