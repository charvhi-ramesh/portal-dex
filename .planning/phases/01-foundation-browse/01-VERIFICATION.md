---
phase: 01-foundation-browse
verified: 2026-11-12T06:30:00Z
status: human_needed
score: 20/23 must-haves verified
covered_files:
  - ".planning/phases/01-foundation-browse/01-01-PLAN.md"
  - ".planning/phases/01-foundation-browse/01-01-SUMMARY.md"
  - ".planning/phases/01-foundation-browse/01-02-PLAN.md"
  - ".planning/phases/01-foundation-browse/01-02-SUMMARY.md"
  - ".planning/phases/01-foundation-browse/01-03-PLAN.md"
  - ".planning/phases/01-foundation-browse/01-03-SUMMARY.md"
  - ".planning/phases/01-foundation-browse/01-04-PLAN.md"
  - ".planning/phases/01-foundation-browse/01-04-SUMMARY.md"
  - ".planning/phases/01-foundation-browse/01-05-PLAN.md"
  - ".planning/phases/01-foundation-browse/01-05-SUMMARY.md"
  - ".planning/phases/01-foundation-browse/01-06-PLAN.md"
  - ".planning/phases/01-foundation-browse/01-06-SUMMARY.md"
  - ".planning/phases/01-foundation-browse/01-07-PLAN.md"
  - ".planning/phases/01-foundation-browse/01-07-SUMMARY.md"
  - ".planning/phases/01-foundation-browse/01-08-PLAN.md"
  - ".planning/phases/01-foundation-browse/01-08-SUMMARY.md"
  - ".planning/phases/01-foundation-browse/01-09-PLAN.md"
  - ".planning/phases/01-foundation-browse/01-09-SUMMARY.md"
  - ".planning/phases/01-foundation-browse/01-10-PLAN.md"
  - ".planning/phases/01-foundation-browse/01-10-SUMMARY.md"
  - "app/browse/page.tsx"
  - "app/collection/page.tsx"
  - "app/globals.css"
  - "app/layout.tsx"
  - "app/page.tsx"
  - "app/providers.tsx"
  - "components/browse/browse-fallback.tsx"
  - "components/browse/browse-view.tsx"
  - "components/browse/character-grid.tsx"
  - "components/browse/empty-panel.tsx"
  - "components/browse/error-panel.tsx"
  - "components/browse/filter-bar.tsx"
  - "components/browse/filter-group.tsx"
  - "components/browse/live-region.tsx"
  - "components/browse/load-more.tsx"
  - "components/browse/results-toolbar.tsx"
  - "components/browse/search-field.tsx"
  - "components/browse/use-browse-url.ts"
  - "components/browse/use-online-status.ts"
  - "components/card/card-avatar.tsx"
  - "components/card/card-skeleton.tsx"
  - "components/card/character-card.tsx"
  - "components/layout/footer.tsx"
  - "components/layout/header.tsx"
  - "components/layout/mobile-menu.tsx"
  - "components/layout/nav-links.tsx"
  - "components/layout/route-focus.tsx"
  - "components/layout/star-field.tsx"
  - "components/layout/use-media-query.ts"
  - "lib/api/avatar.ts"
  - "lib/api/characters.ts"
  - "lib/api/client.test.ts"
  - "lib/api/client.ts"
  - "lib/api/endpoints.test.ts"
  - "lib/api/normalize.ts"
  - "lib/api/resources.ts"
  - "lib/api/types.ts"
  - "lib/browse/announce.test.ts"
  - "lib/browse/announce.ts"
  - "lib/browse/filters.test.ts"
  - "lib/browse/filters.ts"
  - "lib/browse/species.test.ts"
  - "lib/browse/species.ts"
  - "lib/browse/steps.test.ts"
  - "lib/browse/steps.ts"
  - "lib/config.test.ts"
  - "lib/query/client.test.ts"
  - "lib/query/client.ts"
  - "lib/query/options.test.ts"
  - "lib/query/options.ts"
  - "next.config.ts"
  - "package.json"
  - "scripts/check-contrast.ts"
  - "scripts/smoke.ts"
  - "tsconfig.json"
covered_digest: "v4:sha256:5e1d905dd6fd14497bdcd5f9c8d2a3aa153c129cee183aff46e6067284bb2257"
behavior_unverified: 3
overrides_applied: 0
re_verification:
  previous_status: human_needed
  previous_score: 10/21
  gaps_closed: []
  gaps_remaining: []
  regressions: []
behavior_unverified_items:
  - truth: "SC4: '{n} characters' (settled count) and '{n} more characters loaded' are announced politely, once per settled change, never an interim or Humanoid-inflated figure"
    test: "With a screen reader, change filters rapidly, then press Load more; also open the Human chip"
    expected: "One announcement per final filter state; '{n} more characters loaded' with n equal to the cards really added; the Human total is announced only once final"
    why_human: "Imperative live region with a 500 ms settle and 100 ms rewrite; announcement behaviour is only audible in assistive tech. UAT tests 37 and 44 were skipped. DEFERRED BY USER to the Phase 3 accessibility pass on 2026-11-12 (see 01-UAT.md Deferred Follow-Ups)"
  - truth: "SC4/BRW-08: activating Load more hands focus to the first newly added card; the button stays mounted as aria-disabled 'Loading more...'; end note takes focus if nothing was added"
    test: "Tab to Load more, press Enter, watch focus; repeat to the end of the list and after a forced failure"
    expected: "Focus lands on the first new card (article tabindex -1) with the standard ring; no focus loss to body"
    why_human: "Focus hand-off is an effect-ordering invariant with no test. UAT test 44 was skipped. DEFERRED BY USER to the Phase 3 accessibility pass. Related open warnings WR-03 and WR-06 are real focus-loss paths (see below)"
  - truth: "SC5: loading shows card-sized skeletons (4/6/8/10 by breakpoint, opacity pulse, static 0.75 under reduced motion) and the swap to real cards causes no layout shift"
    test: "Load /browse and change filters at 639/640/1023/1024/1279/1280 px with and without reduce-motion; watch for shift when cards replace skeletons"
    expected: "4/6/8/10 skeleton cards; zero visible shift; static 0.75 opacity under reduced motion"
    why_human: "Counts are pure CSS nth-child rules and heights are hand-mirrored from CharacterCard; shift is only observable in a browser. UAT test 41 was skipped. DEFERRED BY USER to the Phase 3 accessibility pass"
coincidental_reliance_items: []
human_verification:
  - test: "Screen-reader pass for the count and 'more loaded' announcements (UAT 37 and the announcement half of UAT 44)"
    expected: "One polite announcement per settled state; zero results announces 'No characters in this dimension'; Human total never announced as the raw Humanoid-inflated figure"
    why_human: "Audible only. Deferred by the user to Phase 3 (not a failure)"
  - test: "Load more focus hand-off (UAT 44)"
    expected: "Focus goes to the first new card; Loading more... button stays focused while in flight; end note or inline Retry takes focus when appropriate"
    why_human: "Focus invariant, no test. Deferred by the user to Phase 3 (not a failure)"
  - test: "Skeleton counts and layout shift (UAT 41)"
    expected: "4/6/8/10 skeletons by breakpoint, no shift on swap near 640 px, static under reduced motion"
    why_human: "Layout and motion only resolve in a browser. Deferred by the user to Phase 3 (not a failure)"
  - test: "Sign-off of the four judgment-tier prohibitions (flagged: unverified-prohibition, human review recommended)"
    expected: "No data sent to any host but rickandmortyapi.com; no show logo, art or quotes; unofficial disclaimer on every route; no decorative motion under reduced motion and no flashing above 3 per second. Verifier's NON-AUTHORITATIVE read: all four hold in code (see Prohibitions)"
    why_human: "Judgment-tier items are never a silent pass. The UAT does not explicitly cover any of the four (only reduced-motion behaviour is touched, by row 10 and the skipped row 41)"
---

# Phase 1: Foundation + Browse Verification Report

**Phase Goal:** Users can browse, search and filter every character as cards in an accessible dark cosmic layout, with state that survives refresh and back navigation.
**Verified:** 2026-11-12T06:30:00Z
**Status:** human_needed
**Re-verification:** Yes. The earlier report was marked stale because covered source changed after it ran (fixes WR-01, WR-04, WR-05). It had no `gaps:` section, so there was nothing to close; every truth was re-checked against the code as it is now.

## Summary

No gap, no failed truth, no missing or stubbed artifact, no unwired key link, no debt marker. The goal is achieved in code, and a real-browser UAT (42 passed, 0 issues, 4 skipped) now supplies human evidence for most behaviours the previous report could only route to a human.

The status is `human_needed`, not `passed`, for two reasons that the decision tree in my instructions treats the same way (Step 9, rule 2: any non-empty human-verification list means `human_needed`, and a flagged prohibition counts as a human-verification item):

1. Three truths are still present-and-wired but behaviour-unverified: the screen-reader announcements (UAT 37, and the announcement half of 44), the Load more focus hand-off (UAT 44), and skeleton counts with no layout shift (UAT 41). The user explicitly deferred these four UAT checks to the Phase 3 accessibility pass. That is a recorded user decision, not a failure, and I report it as such. It does not turn them into verified truths: nothing exercised them, so they stay unconfirmed. I did not move them to `deferred:` (Step 9b) because Phase 3's roadmap text (SC5, A11Y-06) asks for a generic keyboard and screen-reader pass, not these Phase 1 behaviours by name, and my instructions say to defer only on clear, specific evidence.
2. The four judgment-tier prohibitions need human sign-off. The UAT does not explicitly cover them. My read is that all four hold, but it is non-authoritative and they stay flagged.

## What was re-run by this verifier (not taken from SUMMARY or UAT)

| Check | Command | Result |
| ----- | ------- | ------ |
| Unit tests | `npm test` | 120 of 120 pass, 0 fail, 0 skipped |
| Types | `npx tsc --noEmit` | exit 0, no output |
| Lint | `npx eslint .` | clean, no output |
| Contrast gate | `node scripts/check-contrast.ts` | CONTRAST OK (all text pairs at least 4.5:1, borders and focus at least 3:1, star-dot composites 12.54 / 6.51 / 5.20) |
| Production build | `npm run build` | compiled, TypeScript finished, `/`, `/_not-found`, `/browse`, `/collection` all static |
| Smoke over the production build | `node scripts/smoke.ts` with route expectations | SMOKE OK, 11 of 11 (see note) |
| Live API reads through the real modules | `fetchCharacterPage` | page 1: 826 characters, 20 results; `name=zzzzqqq` resolves to `null` (404); Human count 434, Humanoid count 68, so derived Human total 434 - 68 = 366, matching the recorded fixture |
| Plan artifacts and key links | `verify.artifacts`, `verify.key-links` on all 10 plans | artifacts 9/9, 9/9, 9/9, 5/5, 6/6, 7/7, 4/4, 4/4, 6/6, 3/3; links 3/3, 4/4, 5/5, 4/4, 3/3, 3/3, 3/3, 3/3, 3/3, 3/3; every plan `all_passed` / `all_verified` true |
| Debt markers | grep `TBD`, `FIXME`, `XXX`, `TODO`, `HACK` over `app`, `components`, `lib`, `scripts` | none |
| Dependencies | `package.json` | runtime deps exactly next, react, react-dom, @tanstack/react-query (exact versions); no test or motion library |

Smoke note: my first smoke run reported one FAIL on the string "unofficial". That was my own wrong expectation (the footer says "Unofficial fan project", capital U). Rerun with the real text, including `rel="noopener noreferrer"`, passes 11 of 11. The page was right; I was wrong.

The prior report's file set equals today's `git ls-files` set for the covered directories, so the new `covered_digest` is the same scope with the post-fix content.

## Review fixes since the last run (checked in the source, not the disposition file)

| Fix | Commit | What the code now does | Verdict |
| --- | ------ | ---------------------- | ------- |
| WR-01 | 4ff4c2e | `applyFilters` in `browse-view.tsx` (lines 173-191): the `setQueryData` updater returns `undefined` when nothing is trimmed (no-op) and, when it does trim, passes `{ updatedAt: queryClient.getQueryState(targetKey)?.dataUpdatedAt }`, so the 1 h staleTime clock is not restarted | Fixed. No unit test pins it, but the logic is direct and the 120 tests still pass |
| WR-04 | 70abf15 | `countFailed = isHuman && humanoid.isError`; `ResultsToolbar` gets `unavailable={showError || countFailed}` and renders an empty count slot instead of "Counting..." forever; `total` stays `null`, so nothing is announced and no Humanoid-inflated figure appears | Fixed |
| WR-05 | aa64cff | `mobile-menu.tsx` adds `onPanelClick` (lines 109-113): any activated `a[href]` inside the panel closes the menu and returns focus to the hamburger, so a same-route link no longer leaves the menu open and the page inert; listener is removed in effect cleanup | Fixed. UAT row 21 (mobile menu) ran after this fix and passed |

Still open by the user's choice (all re-read in the current source, all still real): WR-02 (no focus hand-off after a successful first-page Retry; nothing in `browse-view.tsx` moves focus once the error panel unmounts), WR-03 (focus can fall to `body` when a scroll-started load ends the list or fails, or Retry adds no card; the hand-off effect only runs for `pendingFocusIndex`), WR-06 (`pendingFocusIndex` is a bare ref not tied to `currentKey`, so a filter change onto a cached key during a Load more can steal focus), plus IN-01 to IN-06. None breaks a roadmap success criterion by its letter, so none is a gap. WR-02, WR-03 and WR-06 sit on exactly the focus behaviour the deferred UAT 44 would have exercised, which is why that item matters.

## Goal Achievement

### Observable Truths

Truths 1-21 are the previous report's set, re-evaluated. The old truths 15 and 19 each bundled a human-confirmed behaviour with a user-deferred one, so the deferred halves are split out as 22 and 23 rather than hidden inside a pass.

| #  | Truth | Status | Evidence |
| -- | ----- | ------ | -------- |
| 1  | SC1: card front shows avatar (placeholder, fallback tile), two-line-clamped name, status badge with text, species, reserved empty star slot | VERIFIED | `character-card.tsx`, `card-avatar.tsx` read; UAT 25 (cards, frames, badges, clamp) passed in a browser. CARD-01 partial by decision D-03 |
| 2  | SC1: responsive grid 2 / 3 / 4 / 5 columns | VERIFIED | `character-grid.tsx` classes `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`; UAT 25 passed in a browser |
| 3  | SC1: dark cosmic theme, sticky header (wordmark, Browse and Collection, "N collected"), footer with API link and disclaimer | VERIFIED | `globals.css` tokens, contrast gate re-run OK, `footer.tsx` (link with `noopener noreferrer`, "Unofficial fan project; not affiliated with the show or its owners."), header read; smoke OK; UAT 9 and 19 passed. Counter is the literal "0 collected" by D-03 (live count is Phase 2, COL-03) |
| 4  | SC2: "Skip to content" is the first focusable element and targets focusable `main#main-content` | VERIFIED | `layout.tsx` skip link first in `body`; smoke asserts it; UAT 9 passed (first Tab stop, Enter moves focus into main) |
| 5  | SC2: focused elements never hidden behind sticky header | VERIFIED | `scroll-padding-top: 80px` on `html`; UAT 22 passed in a browser |
| 6  | SC2: hamburger closes on Escape, outside tap, route change; traps focus; returns focus | VERIFIED | `mobile-menu.tsx` re-read after the WR-05 fix; UAT 21 passed (focus to first link, Tab trap, inert page, Escape and outside tap, link follow, widening closes) |
| 7  | SC2: focus lands on h1 after client-side navigation, title updates | VERIFIED | `route-focus.tsx`; titles in prerendered HTML; UAT 20 passed (focus on h1 after link click, never on typing or chip changes) |
| 8  | SC2: star-field drifts slowly, static under reduced motion | VERIFIED | `star-drift` keyframes and `@media (prefers-reduced-motion: reduce) { .star-layer { animation: none } }` in `globals.css`; UAT 10 passed at the UAT's level of detail |
| 9  | SC3: URL to filters model (allow-list, one value per group, deselect, key order, junk ignored, q trimmed and capped) | VERIFIED | `filters.ts` plus `filters.test.ts` pass in the 120; UAT 13 (automated) and 32 passed |
| 10 | SC3: 300 ms debounce, x and Escape clear, Clear all, typing replaces history while chips push | VERIFIED | `search-field.tsx`, `filter-bar.tsx`, `use-browse-url.ts`; UAT 31, 32, 33 passed (including Clear all as one history push, plan 01-07 backstop) |
| 11 | SC3: refresh and shared links keep search and filters; Back keeps loaded pages and scroll (BRW-11) | VERIFIED | Filters read from the URL via `useSearchParams` and tested `parseFilters`; UAT 15 (refresh keeps `aria-pressed`, Back shows cached filter with no network request) and 46 (Back restores filters, loaded pages and scroll) passed. Rests on the native-ok spike decision (route retention plus 2 h cache) with no code of its own; the longer chain beyond three retained routes is re-checked in Phase 3 SC1 |
| 12 | SC3: Human chip never shows Humanoid; Human total equals exact-Human results | VERIFIED | `species.ts` plus tests; live read 434 - 68 = 366; `browse-view.tsx` keeps total `null` until the Humanoid count arrives; UAT 27 (automated) and 36 passed |
| 13 | SC3: a superseded search never overwrites newer results; revisiting a recent query does not refetch | VERIFIED | Query key per `filtersKey`; `options.test.ts` proves the AbortSignal reaches every sub-request and aborts stop the step; `client.test.ts` pins staleTime 1 h, gcTime above it, no focus or reconnect refetch, `networkMode: "always"`. Behaviour evidence is the passing named unit tests; UAT 38 was skipped but is covered by these 10 passing tests, as the user noted |
| 14 | SC4: next step adds no duplicate cards; a 404 on page > 1 ends the list without error or empty state | VERIFIED | `steps.ts` `flattenSteps` de-dups; `steps.test.ts` passes; live 404 gives `null`; UAT 43 and 45 passed (no duplicates, end note replaces the button with no error or empty state) |
| 15 | SC4: scrolling or Load more loads the next step; end note at the last page | VERIFIED | `load-more.tsx` (400 px sentinel recreated per page, paused on error, Load more button, end note); UAT 43 passed (infinite scroll, keyboard Load more, tall screens) and 45 passed (end note, failed next page keeps cards with role=alert Retry and pauses auto-loading) |
| 16 | SC4: "{n} characters" and "{n} more characters loaded" announced politely, once, never interim | PRESENT_BEHAVIOR_UNVERIFIED (deferred by user) | Strings verified by `announce.test.ts`; `live-region.tsx` is `aria-live="polite" aria-atomic="true"` written through a ref with a 500 ms settle; `browse-view.tsx` once-per-key guard and real-added-count effect; Human count never announced while `total` is `null`. UAT 37 skipped, user deferred to Phase 3 |
| 17 | SC4: changing search or filters returns to page 1 at the top of the grid | VERIFIED | `applyFilters` trims cached pages and scrolls the toolbar only when above the header; UAT 35 passed |
| 18 | SC5: a page-1 404 shows the empty state ("No characters in this dimension" plus Clear filters), never the error state | VERIFIED | `steps.ts` page-1 404 gives an empty step; `browse-view.tsx` branch order (error, pending, empty); tests; UAT 40 passed (empty panel, no error panel, no empty list) |
| 19 | SC5: error panel with Retry and offline wording; failed next page keeps cards with inline retry | VERIFIED | `error-panel.tsx`, `use-online-status.ts`, `load-more.tsx`; UAT 39 passed (first-page failure, offline or generic wording, Retry refetches page 1, filters stay usable) and 45 passed (inline retry keeps cards) |
| 20 | Typed API client: lists with filters and pages, single and multi-ID characters, episodes, locations; arrays normalised, missing IDs tolerated; 404 null; 429 HTML body is `ApiError` http | VERIFIED | `lib/api/*`, 120 passing tests, live read; params only via `URLSearchParams`; `fetch(` appears once, in `client.ts` |
| 21 | TanStack defaults and `next/image` config (PERF-01, DATA-05) | VERIFIED | `lib/query/client.ts` and `client.test.ts`; `next.config.ts` remotePatterns locked to `/api/character/avatar/**` with `search: ""`; `config.test.ts` passes; build accepts it |
| 22 | SC4/BRW-08: Load more hands focus to the first new card; button stays mounted aria-disabled "Loading more..."; end note or inline Retry takes focus when nothing was added or the step failed | PRESENT_BEHAVIOR_UNVERIFIED (deferred by user) | Implemented in `browse-view.tsx` hand-off effect (lines 124-138) and `load-more.tsx` (`aria-disabled` rather than `disabled`, `NEXT_RETRY_ID`, end note `tabIndex={-1}`). No test. UAT 44 skipped, user deferred to Phase 3. WR-03 and WR-06 are open focus-loss paths on this behaviour |
| 23 | SC5: skeletons while loading, 4/6/8/10 by breakpoint, opacity pulse, static 0.75 under reduced motion, no layout shift on swap | PRESENT_BEHAVIOR_UNVERIFIED (deferred by user) | `card-skeleton.tsx` mirrors card box; `globals.css` nth-child rules show 4 below 640 px, 6, 8, 10 at 640, 1024, 1280 px (row variant 2/3/4/5), `skeleton-pulse` is opacity only with a reduced-motion override at 0.75; prerendered `/browse` contains `skeleton-grid` (smoke). Counts verified by reading the CSS, shift and motion not observed. UAT 41 skipped, user deferred to Phase 3 |

**Score:** 20/23 truths verified (3 present and wired, behaviour-unverified, all three explicitly deferred by the user to the Phase 3 accessibility pass).

### Prohibitions (judgment tier, NON-AUTHORITATIVE verdicts)

All four are `status: resolved`, `verification: judgment` in plans 01-01 and 01-02. They are recorded as `unverified-prohibition: human review recommended`. The UAT does not explicitly cover them: its rows exercise behaviour and layout, not network egress, branding or copy. Row 10 touches reduced motion for the star-field only, and row 41 (skeletons under reduced motion) was skipped. So none of the four is signed off by a human; they stay flagged.

| Prohibition | Verifier read (non-authoritative) | Evidence re-checked today |
| ----------- | --------------------------------- | ------------------------- |
| No user data to any host other than rickandmortyapi.com | Holds | The only `fetch(` in app code is `lib/api/client.ts` against `API_BASE`; the only other `https://` literals are the footer link and `AVATAR_ORIGIN`; `scripts/smoke.ts` fetches loopback only; grep for analytics, beacon and gtag finds nothing; no `localStorage`, `sessionStorage` or cookies in Phase 1; Inter is self-hosted by `next/font`. Consistent with 01-SECURITY.md (verified, threats_open 0) |
| No show logo, artwork, quotes or catchphrases | Holds | Text wordmark only; `public/` holds only the five scaffold SVGs; grep for common show catchphrases returns nothing |
| Not presented as official; disclaimer on every route, never hidden | Holds | `Footer` is rendered once in `layout.tsx`, so every route has it; text is visible (`text-text-muted`, passes the contrast gate); smoke confirms it on `/` |
| No decorative motion under reduced motion; no flashing above 3 per second | Holds in code | `prefers-reduced-motion` overrides for star drift, skeleton pulse, press scale and menu slide (`motion-reduce` classes plus `@media` rules); nothing animates faster than the 1.6 s pulse. Browser confirmation exists only for the star-field (UAT 10) |

### Required Artifacts and Key Links

All artifacts declared in the 10 plans pass `verify.artifacts` and all key links pass `verify.key-links` (totals in the table above). Level 4 data flow: `BrowseView` to `useInfiniteQuery(browseOptions)` to `fetchBrowseStep` to `fetchCharacterPage` to `getJson` to the live API is FLOWING (confirmed by a live read today and by UAT 15). The header counter is a hardcoded "0 collected" by decision D-03 (COL-03, Phase 2) and the star slot is intentionally empty (CARD-06, Phase 2); both are documented scope boundaries, not stubs.

### Requirements Coverage

Union of PLAN frontmatter `requirements` equals the 25 phase IDs; none missing, none orphaned.

| Requirement | Status | Evidence |
| ----------- | ------ | -------- |
| FND-01 | SATISFIED | tokens in `globals.css`; contrast gate re-run OK |
| FND-02 | SATISFIED (by D-03) | sticky header, wordmark, links, "0 collected" with reserved width; UAT 19 passed; live count deferred to Phase 2 |
| FND-03 | SATISFIED | `footer.tsx`; smoke OK |
| FND-04 | SATISFIED | truth 6, UAT 21 |
| FND-05 | SATISFIED | truths 4 and 5, UAT 9 and 22 |
| FND-06 | SATISFIED | truth 7, UAT 20 |
| FND-07 | SATISFIED | truth 8, UAT 10 |
| DATA-01 | SATISFIED | truth 20 |
| DATA-02 | SATISFIED | `normalize.ts` and tests |
| DATA-03 | SATISFIED | tests plus live 404 gives `null`; UAT 40 and 45 |
| DATA-05 | SATISFIED | truths 13 and 21 |
| BRW-01 | SATISFIED | truth 2; zero results renders no list |
| BRW-02 | SATISFIED | truth 10, UAT 31 |
| BRW-03 | SATISFIED | truths 9 and 10, UAT 32 |
| BRW-04 | SATISFIED | truth 12, UAT 36 |
| BRW-05 | SATISFIED | truth 10, UAT 33 |
| BRW-06 | SATISFIED | truths 10 and 11, UAT 15 and 31 |
| BRW-07 | PARTIAL, user-deferred | strings and logic verified (truth 16 string tests); the audible behaviour is unconfirmed (UAT 37 skipped) |
| BRW-08 | PARTIAL, user-deferred | loading, de-dup, Load more verified by UAT 43; "{n} more characters loaded" announcement and focus hand-off unconfirmed (truths 16 and 22, UAT 44 skipped) |
| BRW-09 | PARTIAL, user-deferred | empty, error, offline, Retry and inline next-page retry verified (UAT 39, 40, 45); skeleton counts and no layout shift unconfirmed (truth 23, UAT 41 skipped) |
| BRW-10 | SATISFIED | truth 17, UAT 35 |
| BRW-11 | SATISFIED | truth 11, UAT 15 and 46; no code of its own by the native-ok decision; Phase 3 SC1 re-checks it through a character page |
| CARD-01 | PARTIAL BY DECISION | front verified (truth 1); the star ships with CARD-06 in Phase 2; ROADMAP SC1 and REQUIREMENTS traceability say so |
| CARD-08 | SATISFIED | `card-avatar.tsx` placeholder and fallback tile; UAT 25; the pre-hydration-failure case is IN-05 |
| PERF-01 | SATISFIED | truth 21 |

REQUIREMENTS.md shows BRW-07, BRW-08 and BRW-09 as Complete. That mark rests on executor claims plus a UAT that skipped the sub-behaviours above; this report does not change the file. Phase 3's accessibility pass is where the deferred sub-behaviours get confirmed.

### Plan backstops and unresolved rows

The plans tagged several truths `verification: backstop` (held-out, not inferable from code) and left some edges `unresolved`. I did not treat any as passed on presence. Where a UAT row covers a backstop, it is credited at the row's recorded level of detail; the UAT records one-line expectations, so a sub-claim not named in a row is noted rather than assumed.

| Backstop or unresolved edge | UAT evidence | Note |
| --------------------------- | ------------ | ---- |
| 01-04 320 px header adjacency, header DOM and Tab order, "0 collected" text | Row 19 passed (no overlap or horizontal scroll at 320 px, DOM/Tab order); row 16 automated for the text | Covered |
| 01-07 Clear all is a single history entry | Row 33 ("resets everything in one history push") | Covered |
| 01-07 "1,000 characters" does not wrap at 320 px | Not named in any row (row 33 records a fixed 44 px toolbar row) | Not individually recorded; low risk (`whitespace-nowrap` on the count, fixed-height row), no human confirmation of the four-digit case |
| 01-09 offline wording | Row 39 | Covered |
| 01-09 repeated Retry presses give one request | Row 39 names Retry refetching page 1, not repeated presses | Code guards it (`retry()` returns while `query.isFetching`, button `aria-disabled`); the repeated-press case is not individually recorded |
| 01-10 failed next step keeps cards, pauses the observer, Retry fetches the same step once | Row 45 names keep cards, role=alert Retry and paused auto-loading | Covered except "once", which is guarded in code (`retryNextPage` returns while fetching) |
| 01-10 Back to bare `/browse` restores list, pages and scroll | Row 46 names filters, pages and scroll; bare `/browse` not named | Not individually recorded; same mechanism as the filtered case |
| 01-10 Load more focus to first new card, aria-disabled "Loading more..." | Row 44 skipped | User-deferred (truth 22) |
| Unresolved: FND-05 first focusable on every route, FND-07 mid-session reduced-motion switch, BRW-06 history integration, BRW-10 trim-by-cache, BRW-08, BRW-04 Human-only overlap, CARD-08 and PERF-01 edges | Rows 9, 10, 15, 35, 36, 43, 25 cover the user-visible parts | The mid-session reduced-motion switch and the pre-hydration image case (IN-05) are not individually recorded; neither breaks a success criterion |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (all phase code and scripts) | - | `TBD`, `FIXME`, `XXX`, `TODO`, `HACK` | none found | grep over `app`, `components`, `lib`, `scripts` is clean |
| `components/layout/header.tsx` | - | hardcoded "0 collected" | Info | Intentional per D-03; replaced in Phase 2 (COL-03) |
| `components/card/character-card.tsx` | - | empty star, link and back-face slots, disabled flip button | Info | Intentional per D-01 to D-03; final markup for Phase 2 |
| `components/browse/browse-view.tsx` | 100-138 | focus hand-off keyed on a ref not tied to the filter key (WR-03, WR-06) and no hand-off after Retry success (WR-02) | Warning | Open by the user's choice; real focus-loss paths; folded into the Phase 3 accessibility pass |
| `next.config.ts` | 4 | scaffold comment | Info | IN-06 |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Unit tests | `npm test` | 120 pass, 0 fail | PASS |
| Types and lint | `npx tsc --noEmit`, `npx eslint .` | clean | PASS |
| Contrast gate | `node scripts/check-contrast.ts` | CONTRAST OK | PASS |
| Production build | `npm run build` | 4 static routes | PASS |
| Live read: page 1, 404, Human and Humanoid counts | module calls against the real API | 826 / null / 434 and 68, so 366 | PASS |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| `scripts/smoke.ts` (declared in plans 01-02 to 01-10) | `node scripts/smoke.ts route:/ ... route:/collection ... route:/browse ...` | SMOKE OK, 11 of 11 expectations | PASS |

No `scripts/*/tests/probe-*.sh` files exist and none is declared.

### Human Verification Required

See the `human_verification` frontmatter list (4 items): three are the user-deferred UAT checks, one is the prohibition sign-off.

### Gaps Summary

No gaps. Nothing in the codebase contradicts a roadmap success criterion, and the 42 UAT passes confirm in a browser what the previous report could only mark as present and wired. What remains is exactly (a) three behaviours the user chose to defer to the Phase 3 accessibility pass (screen-reader announcements, Load more focus hand-off, skeleton counts and layout shift), reported as deferred-by-user and unconfirmed, not failed, and (b) human sign-off of the four judgment-tier prohibitions, which the UAT does not explicitly cover and which I leave flagged. Per the decision tree this is `human_needed`: a flagged prohibition or a non-empty human-verification list never resolves to `passed`. If the user accepts the deferrals and signs off the prohibitions, the phase can close; WR-02, WR-03 and WR-06 should be picked up with those deferred items in Phase 3.

---

_Verified: 2026-11-12T06:30:00Z_
_Verifier: Claude (gsd-verifier)_
