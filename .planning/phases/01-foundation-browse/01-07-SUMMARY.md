---
phase: 01-foundation-browse
plan: 07
subsystem: ui
tags: [react, nextjs, tailwind, tanstack-query, search, filter-chips, history-api]

requires:
  - phase: 01-foundation-browse
    provides: "Plan 01-03 Filters model, useBrowseUrl (pushFilters/replaceFilters), FilterGroup, browseOptions"
  - phase: 01-foundation-browse
    provides: "Plan 01-05 CharacterGrid in BrowseView"
  - phase: 01-foundation-browse
    provides: "Plan 01-06 countText in lib/browse/announce.ts"
provides:
  - "SearchField and SEARCH_DEBOUNCE_MS: 300 ms debounced name search, Enter/Escape/clear-button immediate commits"
  - "FilterBar: static search plus Status, Gender and Species chip groups"
  - "FilterGroup responsive row: scrolling with 24 px trailing fade under 640 px, wrapping from 640 px, check icon on the active chip"
  - "ResultsToolbar: count line with a reserved 16ch Counting... slot and a conditional Clear all, in a fixed 44 px row"
  - "BrowseView applyFilters(next, mode): typing replaces, chips and Clear all push, cached pages trimmed to page 1, conditional scroll to the toolbar"
affects: [01-08, 01-09, 01-10]

actuals:
  tokens: 3300
  tasks: 2
  commits: 2
plan_head_before: cc79cfe4240dc2424ac76f8349339af09b0c6eeb
plan_head_after: abee8b028d6f3d54e6f11d66b589fa92661966ca

tech-stack:
  added: []
  patterns:
    - "External prop value adopted into local draft state during render (guarded previous-value pattern), with a state copy of the last committed text for render and a ref mirror for effects (react-hooks/refs forbids reading refs in render)"
    - "Latest-callback ref (onCommitRef updated in an effect) so a debounce timer never commits with stale filters"
    - "Committed search text is stored trimmed, matching the URL's trimmed q, so the URL echo never clobbers a trailing space the user is still typing"
    - "Scroll-container rows get vertical padding balanced by negative margin so focus rings are not clipped"

key-files:
  created:
    - components/browse/search-field.tsx
    - components/browse/filter-bar.tsx
    - components/browse/results-toolbar.tsx
  modified:
    - components/browse/filter-group.tsx
    - components/browse/browse-view.tsx

key-decisions:
  - "Clear via x or Escape is a search edit and uses history replace like typing; Clear all and chips push (plan Claude's-discretion item)"
  - "Scroll to the toolbar when its top is above the sticky header (getBoundingClientRect().top < 64), per the plan's truths and RESEARCH Pitfall 8"
  - "FilterGroup lost its own top margin; FilterBar owns spacing (24 px search to first group, 16 px between groups)"

patterns-established:
  - "applyFilters is the single user-initiated change path; popstate bypasses it so Back/Forward keep all loaded pages and scroll position"

requirements-completed: [BRW-02, BRW-03, BRW-05, BRW-06, BRW-10]

coverage:
  - id: D1
    description: "Typing filters the grid 300 ms after the last keystroke; URL q follows by history replace; x and Escape clear immediately with the right focus"
    requirement: "BRW-02"
    verification:
      - kind: other
        ref: "npm test && npx tsc --noEmit && npm run lint (type/lint only; no unit test covers the component)"
        status: pass
    human_judgment: true
    rationale: "Debounce timing, history entries and focus behaviour need a browser; no browser automation in Phase 1"
  - id: D2
    description: "Status, Gender and Species aria-pressed chip groups combine with search, one value per group, chips push history"
    requirement: "BRW-03"
    verification:
      - kind: other
        ref: "npm test && npx tsc --noEmit && npm run lint; npm run build && node scripts/smoke.ts route:/browse"
        status: pass
    human_judgment: true
    rationale: "Combination behaviour and history semantics need a browser"
  - id: D3
    description: "Clear all appears only while a search or chip is active and resets everything in one history push, in a fixed 44 px toolbar row"
    requirement: "BRW-05"
    verification:
      - kind: other
        ref: "npm run build && node scripts/smoke.ts route:/browse (prerender only)"
        status: pass
    human_judgment: true
    rationale: "Single-entry Back behaviour and layout stability need a browser"
  - id: D4
    description: "Search and chips are static above the grid; chip rows scroll with a fade under 640 px and wrap from 640 px"
    requirement: "BRW-06"
    verification: []
    human_judgment: true
    rationale: "Responsive layout, fade and keyboard scroll-into-view need a browser at 320 px and 640 px"
  - id: D5
    description: "User-initiated changes restart at page 1 (cached pages trimmed) and scroll the toolbar below the header only when it is above it"
    requirement: "BRW-10"
    verification: []
    human_judgment: true
    rationale: "Scroll position and cache trimming interplay with Back/Forward need a browser"

duration: 7min
completed: 2026-11-12
status: complete
---

# Phase 1 Plan 07: Search, Chip Filters and Results Toolbar Summary

**Debounced name search (history replace), Status/Gender/Species aria-pressed chip groups with scroll-fade rows, a 44 px results toolbar with Clear all, and an applyFilters path that trims cached pages to page 1 and scrolls the grid top into view**

## Performance

- **Duration:** 7 min
- **Started:** 2026-11-12T02:46:29Z
- **Completed:** 2026-11-12T02:53:34Z
- **Tasks:** 2
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments
- SearchField commits 300 ms after the last keystroke (Enter, Escape and the clear button commit at once); external URL changes (Back, Forward, Clear all) are adopted into the box during render without clobbering text typed after a commit.
- FilterBar renders the three chip groups; FilterGroup is a labelled row that scrolls horizontally with a 24 px trailing fade under 640 px and wraps from 640 px, with a check icon on the active chip and stable chip keys so focus stays put.
- ResultsToolbar shows "N characters" or a reserved 16ch "Counting..." slot, with Clear all rendered only while something is active, inside a fixed 44 px row and no live-region attribute.
- BrowseView.applyFilters routes typing to replace and chips or Clear all to push, trims any cached infinite data for the target key to page 1, and scrolls the toolbar into view only when its top is above the 64 px header.

## Task Commits

1. **Task 1: Typing a name filters the grid after 300 ms through a history replace** (tracer) - `f528c81` (feat)
2. **Task 2: All chip groups, responsive rows, Clear all toolbar, reset to first page and scroll to grid top** - `abee8b0` (feat)

**Plan metadata:** recorded in the docs(01-07) commit that follows this file.

## Files Created/Modified
- `components/browse/search-field.tsx` - debounced search input, clear button, Escape handling, external value adoption
- `components/browse/filter-bar.tsx` - static bar: SearchField plus Status, Gender, Species groups
- `components/browse/results-toolbar.tsx` - count line and Clear all, ref as a regular prop
- `components/browse/filter-group.tsx` - responsive scroll/wrap row, check icon, focus-ring-safe padding
- `components/browse/browse-view.tsx` - applyFilters, toolbar ref, count, first-page trim, scroll-to-grid

## Decisions Made
- Clear via x or Escape uses replace (it is a search edit); Clear all and chips push, as flagged in the plan.
- Committed search text is stored trimmed. The URL's `q` is trimmed, so comparing untrimmed text would reset the box and eat a trailing space mid-phrase ("rick " then "morty").
- The debounce timer reads the latest `onCommit` through a ref so a chip pressed within the 300 ms window is not overwritten by stale filters.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Scroll condition wording in Task 2 contradicts the plan's truths**
- **Found during:** Task 2
- **Issue:** The action text says to scroll "if the toolbar's top is below 64"; the must_haves, flagged assumption and RESEARCH Pitfall 8 all say to scroll only when the toolbar is above the sticky header (`top < 64`). Following the action literally would scroll the input away while typing near the top.
- **Fix:** Implemented `getBoundingClientRect().top < 64`.
- **Files modified:** components/browse/browse-view.tsx
- **Committed in:** abee8b0

**2. [Rule 2 - Missing Critical] Chip row clipped the keyboard focus ring**
- **Found during:** Task 2
- **Issue:** `overflow-x-auto` makes the row clip vertically, so the 2 px ring plus 2 px offset on a focused chip would be cut off under 640 px (A11Y-01).
- **Fix:** 4 px vertical padding on the scroll row, balanced by `mt-1 -mb-1` so spacing is unchanged; reset from 640 px.
- **Files modified:** components/browse/filter-group.tsx
- **Committed in:** abee8b0

**3. [Rule 2 - Missing Critical] Stale-closure and trailing-space hazards in the debounce**
- **Found during:** Task 1
- **Issue:** A timer capturing `onCommit` could commit old filters after a chip press; comparing untrimmed text with the trimmed URL value would drop a typed trailing space.
- **Fix:** latest-callback ref and trimmed committed text (see Decisions).
- **Files modified:** components/browse/search-field.tsx
- **Committed in:** f528c81

**4. [Minor] `maxLength={60}` written as a literal**
- **Found during:** Task 1
- **Issue:** The acceptance grep requires the literal `maxLength={60}`; using the `MAX_QUERY_LENGTH` constant failed it.
- **Fix:** literal 60 with a comment pointing at `MAX_QUERY_LENGTH` in lib/browse/filters.ts (the value is also enforced by parseFilters).
- **Committed in:** f528c81

**5. [Minor] Reduced-motion press feedback**
- **Issue:** UI-SPEC Motion Contract removes the press transform under reduced motion; existing chips only dropped the transition.
- **Fix:** added `motion-reduce:active:scale-100` to chips, the clear button and Clear all.
- **Committed in:** f528c81, abee8b0

---

**Total deviations:** 5 (1 bug-wording, 2 missing-critical, 2 minor)
**Impact on plan:** All are small corrections within the plan's intent; no scope creep, no new dependencies.

## Issues Encountered
- The count line is still `pages[0].info.count` (plan-specified interim). For the Human species chip this is the raw API count, not the derived total; plan 01-08 replaces it with the derived total. While a query errors with no data the toolbar keeps showing "Counting..."; plan 01-08's error panel supersedes that.
- The loading and error placeholders in BrowseView changed from `mt-12` to `mt-4` so they sit under the new toolbar; plan 01-08 replaces them with skeletons.

## Human-check items (browser-only, not run; harvest into end-of-phase UAT)
Per the plan's Task 2 `<human-check>`: run `npm run build`, then `node node_modules/next/dist/bin/next start -p 3000`; open /browse with DevTools Network open.
1. Type "rick", wait: one request about 300 ms after the last keystroke, only names containing "rick", URL `?q=rick`, Back after typing goes to the page before /browse.
2. Press Alive: combines with rick, new history entry. Press Back.
3. Escape in the search: box clears, focus stays. x button clears and returns focus to the input.
4. Press Human then Clear all: Clear all vanishes when nothing is active; one Back restores search and chips together.
5. Scroll far down, press Dead: toolbar scrolls to just under the header. Typing near the top does not scroll the input away.
6. At 320 px: Species row scrolls horizontally with a right-edge fade, focused chips scroll into view, "1,000 characters" does not wrap or push Clear all out. From 640 px chips wrap.
7. Type 70 characters: stops at 60; x stays reachable. "Counting..." shows briefly and the row never jumps when Clear all appears.

## Verification Run
- Per task: `npm test` (110 pass, 0 fail), `npx tsc --noEmit`, `npm run lint` all clean; every acceptance_criteria grep passes.
- Slow gate: `npm run build && node scripts/smoke.ts route:/browse "Browse characters" "Browse · Portal Dex"` finished with `SMOKE OK` (build prerenders /browse; both smoke checks PASS). No local server was started.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Ready for 01-08: ResultsToolbar takes a `count` prop ready for the derived total, the toolbar ref and applyFilters are in place, and the count line carries no live-region attribute for the polite region plan 01-08 adds.

---
*Phase: 01-foundation-browse*
*Completed: 2026-11-12*

## Self-Check: PASSED

Found: all 5 key files on disk; commits f528c81 and abee8b0 are ancestors of HEAD; all task acceptance_criteria greps pass; slow gate SMOKE OK.
