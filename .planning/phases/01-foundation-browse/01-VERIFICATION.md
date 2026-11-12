---
phase: 01-foundation-browse
verified: 2026-11-12T12:00:00Z
status: human_needed
score: 10/21 must-haves verified
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
covered_digest: "v4:sha256:0376f5bb6710c4956f51faa83fa0eaba29cef3221075728c33dc4ac81c51f18d"
behavior_unverified: 11
overrides_applied: 0
behavior_unverified_items:
  - truth: "SC1: responsive grid shows 2 / 3 / 4 / 5 columns at <640 / 640-1024 / 1024-1280 / >=1280 px"
    test: "Open /browse at 320, 639, 640, 1023, 1024, 1279, 1280 px"
    expected: "2, 2, 3, 3, 4, 4, 5 columns; equal-height cards; no horizontal page scroll at 320 px"
    why_human: "Classes grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 are present, but layout only resolves in a browser"
  - truth: "SC2: focused elements are never hidden behind the sticky header"
    test: "Tab through /browse from the filter bar down into the grid, and activate the skip link"
    expected: "Every focused element and #main-content lands below the 64 px header"
    why_human: "html { scroll-padding-top: 80px } is present; actual scroll-into-view behaviour needs a browser"
  - truth: "SC2: hamburger menu closes on Escape, outside tap and route change, traps focus, returns focus to the button"
    test: "At <640 px open the menu, Tab/Shift+Tab around, press Escape; reopen and tap outside; reopen and follow a link"
    expected: "Focus cycles only through hamburger + links; page behind is inert; Escape and outside tap return focus to the hamburger; link closes menu and focus lands on the new h1"
    why_human: "Effect cleanup, inert toggling and focus order are state/ordering invariants with no test (see WR-05 for the same-route link case)"
  - truth: "SC2: after client-side navigation focus lands on the page h1 and the title updates"
    test: "Click Browse, Collection and the wordmark in turn; type and toggle chips on /browse"
    expected: "Focus moves to the new h1 each navigation; typing or chip changes never move focus to the h1"
    why_human: "RouteFocus is keyed on pathname with retry-on-hidden-h1 logic; needs a real Activity-retained navigation. Titles are verified in the prerendered HTML"
  - truth: "SC2: star-field drifts slowly and is static under prefers-reduced-motion"
    test: "Watch the background; enable reduce motion in the OS and reload"
    expected: "Slow transform-only drift; completely static under reduced motion"
    why_human: "Keyframes and the reduced-motion override exist in app/globals.css; motion is only observable in a browser"
  - truth: "SC3: 300 ms debounced search, x / Escape clear, Clear all, history push vs replace"
    test: "Type 'rick' quickly, wait; press Escape; use the x button; toggle chips; press Clear all; press Back once after each"
    expected: "One request 300 ms after the last key; typing replaces history, chips and Clear all push exactly one entry; Escape keeps focus in the input, x returns focus to it"
    why_human: "Timer and history interplay in SearchField / useBrowseUrl has no unit test (backstop: Clear all is a single history entry)"
  - truth: "SC3: refresh and shared links keep search and filters; Back keeps loaded pages and scroll (BRW-11)"
    test: "On /browse press Alive, load 3+ steps, click Collection, press Back; repeat on bare /browse; repeat after /, /collection, / then Back three times; refresh a filtered URL"
    expected: "Filters, all loaded steps and scroll offset restored with no new network request; refresh keeps filters"
    why_human: "Rests on the user's native-ok spike answer (Activity route retention up to 3 routes + 2 h cache), no code of its own; the longer chain is explicitly re-checked in Phase 3"
  - truth: "SC4: scrolling or Load more loads the next step, focus hand-off, end note, no error or empty state at the last page"
    test: "Scroll to the bottom on tall and short screens; Tab to Load more and press Enter; page to the end"
    expected: "No duplicates, 'Loading more...' with focus kept, focus on first new card, end note 'You've reached the end of the dimension.', no error panel"
    why_human: "IntersectionObserver re-creation and focus hand-off effect are behavioural; see WR-02 and WR-03 for known focus-loss paths"
  - truth: "SC4: 'N characters' and '20 more characters loaded' announced politely, once per settled change"
    test: "With a screen reader, change filters rapidly, then load more"
    expected: "A single settled count announcement per final filter state; '{n} more characters loaded' with n = cards really added; never an interim Human count"
    why_human: "Imperative live region with 500 ms settle and 100 ms rewrite; announcement behaviour is only audible in assistive tech"
  - truth: "SC4: changing search or filters returns to page 1 at the top of the grid"
    test: "Scroll down 3 steps, scroll the toolbar above the header, toggle a chip; then type while near the top"
    expected: "Grid restarts at page 1 with the toolbar at the top; typing near the top never scrolls the input away"
    why_human: "applyFilters trims cached pages and scrollIntoView only when toolbar is above the header; scroll behaviour needs a browser"
  - truth: "SC5: skeletons while loading, error panel with Retry and offline wording, inline next-page retry keeps existing cards"
    test: "Throttle then disable the network in DevTools on first load and on Load more; press Retry repeatedly while in flight"
    expected: "Skeletons match card height; 'You appear to be offline' when offline else generic wording; Retry makes a single request; failed next page keeps cards and shows 'Couldn't load more characters.' with Retry"
    why_human: "navigator.onLine can lag real connectivity (plan backstop); Retry idempotency and focus after retry (WR-02) are runtime behaviour"
coincidental_reliance_items: []
human_verification:
  - test: "Responsive grid at 320, 640, 1024, 1280 px (see behavior_unverified_items 1)"
    expected: "2/3/4/5 columns, equal-height cards, no horizontal scroll at 320 px; header wordmark, '0 collected' counter and hamburger on one row at 320 px"
    why_human: "Layout is only resolved in a browser (also plan 01-04 backstop: 320 px header adjacency; plan 01-07 backstop: '1,000 characters' does not wrap at 320 px)"
  - test: "Keyboard and focus pass: Tab order, skip link, focus not under sticky header, header Tab order (wordmark, Browse, Collection, counter on desktop; wordmark, counter, hamburger on mobile)"
    expected: "Skip to content is the first Tab stop and moves focus to main; DOM order as stated (plan 01-04 ordering backstop); 2 px teal ring visible"
    why_human: "Focus order and scroll-padding are browser behaviours"
  - test: "Mobile menu and route focus (see items 3 and 4), including a link that targets the current route (WR-05)"
    expected: "Menu behaviours as listed; known defect: tapping the link for the current route leaves the menu open and the page inert"
    why_human: "Interaction and focus invariants"
  - test: "Reduced motion: star-field static, skeleton static at 0.75 opacity, press scale off, menu slide off"
    expected: "No decorative motion under prefers-reduced-motion: reduce; nothing flashes more than 3 times per second"
    why_human: "Visual and OS-setting dependent"
  - test: "Search, chips, Clear all and history behaviour (see item 6)"
    expected: "As listed; Clear all is a single history entry (plan 01-07 backstop)"
    why_human: "Timers and history"
  - test: "Back restore with several loaded pages (see item 7), including bare /browse"
    expected: "Filters, loaded pages and scroll restored, no refetch"
    why_human: "BRW-11 and plan 01-10 backstops (scroll restoration, bare /browse restore); depends on the native-ok decision"
  - test: "Infinite scroll, Load more, end note and next-page failure (items 8 and 10)"
    expected: "No duplicates; failed next step keeps cards, pauses observer, Retry fetches the same step once (plan 01-10 concurrency backstop)"
    why_human: "Observer and focus behaviour; WR-03 known focus-loss paths"
  - test: "Screen-reader pass for count and more-loaded announcements (item 9)"
    expected: "One polite announcement per settled state; zero results announces 'No characters in this dimension'"
    why_human: "Audible only"
  - test: "Offline and Retry (item 11)"
    expected: "'You appear to be offline' with network disabled (plan 01-09 backstop); repeated Retry presses give one request (plan 01-09 idempotency backstop); empty state never shows the error panel"
    why_human: "navigator.onLine hint and in-flight press handling"
  - test: "Judgment-tier prohibitions (flagged: unverified-prohibition, human review recommended)"
    expected: "No data sent to any host but rickandmortyapi.com; no show logo, art or quotes; disclaimer rendered on every route; no decorative motion under reduced motion. Verifier's NON-AUTHORITATIVE read: all four hold in code (see Prohibitions below)"
    why_human: "Judgment-tier items are never a silent pass"
---

# Phase 1: Foundation + Browse Verification Report

**Phase Goal:** Users can browse, search and filter every character as cards in an accessible dark cosmic layout, with state that survives refresh and back navigation.
**Verified:** 2026-11-12T12:00:00Z
**Status:** human_needed
**Re-verification:** No, initial verification

## Summary

The code, data layer, pure policies and build all check out. Nothing in the codebase contradicts a roadmap success criterion, so there are no gaps. What cannot be confirmed here is runtime browser behaviour (focus, live regions, scroll restore, offline, reduced motion, layout at breakpoints, history). No browser automation is allowed in Phase 1, so those truths are reported as present and wired but behaviour-unverified and routed to human verification. They are not failures and not passes.

Automated evidence gathered by this verifier (not taken from SUMMARY files):

- `npm test`: 120 of 120 pass (node:test). `npx tsc --noEmit` and `npx eslint .` exit clean.
- `node scripts/check-contrast.ts`: CONTRAST OK (every text pair at least 4.5:1, every border and focus pair at least 3:1, including star-dot composites).
- `npm run build`: succeeds, `/`, `/browse`, `/collection`, `/_not-found` prerendered static.
- `node scripts/smoke.ts` over the production build: SMOKE OK for `/` ("Welcome to Portal Dex", "Skip to content", disclaimer, API link), `/collection` and `/browse` ("Browse characters", "Counting...", `skeleton-grid`, "Portal Dex").
- Prerendered HTML titles: `Browse · Portal Dex`, `Collection · Portal Dex`, `Portal Dex`; each page has exactly one `h1`; the skip link is the first element in `body`.
- Live API read through the real modules: page 1 returns 826 characters (20 results); a filtered 404 resolves to `null`; a Human load step returned 36 items, all exactly `Human`, `nextPage` 3; derived Human total 434 - 68 = 366 (matches the recorded fixture).
- `verify.artifacts` passes for every plan (all artifacts present, substantive); `verify.key-links` passes for every plan (all links wired).

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
| -- | ----- | ------ | -------- |
| 1  | SC1: card front shows avatar (placeholder, fallback tile), two-line-clamped name, status badge with text, species, reserved empty star slot | VERIFIED | `character-card.tsx` (h2 `line-clamp-2`, badge text via `labelFor`, species truncated, `data-slot="star"` empty), `card-avatar.tsx` (surface-raised placeholder, fade-in, labelled initial tile on error or non-avatar URL). CARD-01 is partial by decision D-03 |
| 2  | SC1: responsive grid 2 / 3 / 4 / 5 columns | PRESENT_BEHAVIOR_UNVERIFIED | `character-grid.tsx` classes `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`; layout needs a browser |
| 3  | SC1: dark cosmic theme, sticky header (wordmark, Browse and Collection, "N collected"), footer with API link and disclaimer | VERIFIED | `globals.css` tokens, contrast gate passes, `header.tsx` sticky h-16 with nav and "0 collected" pill (live count is Phase 2 by D-03), `footer.tsx` link with `noopener noreferrer` and disclaimer; served in smoke HTML |
| 4  | SC2: "Skip to content" is the first focusable element and targets focusable `main#main-content` | VERIFIED | `layout.tsx` skip link first in `body`; prerendered HTML confirms; `main tabIndex={-1}` |
| 5  | SC2: focused elements never hidden behind sticky header | PRESENT_BEHAVIOR_UNVERIFIED | `scroll-padding-top: 80px` on `html`; browser-only |
| 6  | SC2: hamburger closes on Escape, outside tap, route change; traps focus; returns focus | PRESENT_BEHAVIOR_UNVERIFIED | `mobile-menu.tsx` implements all four plus inert page; no test; WR-05 documents the same-route link case |
| 7  | SC2: focus lands on h1 after client-side navigation, title updates | PRESENT_BEHAVIOR_UNVERIFIED | `route-focus.tsx` keyed on pathname with hidden-h1 handling; titles verified in prerendered HTML, focus is not |
| 8  | SC2: star-field drifts slowly, static under reduced motion | PRESENT_BEHAVIOR_UNVERIFIED | `star-drift` keyframes (transform only, 90 / 150 / 240 s) and `@media (prefers-reduced-motion: reduce) { animation: none }` in `globals.css` |
| 9  | SC3: URL to filters model: allow-listed chips, one value per group, active chip deselects, deterministic key order, junk params ignored, q trimmed and capped | VERIFIED | `filters.ts` plus `filters.test.ts` pass (round trip, ordering, junk values) |
| 10 | SC3: 300 ms debounce, x and Escape clear, Clear all, typing replaces history while chips push | PRESENT_BEHAVIOR_UNVERIFIED | `search-field.tsx`, `filter-bar.tsx`, `use-browse-url.ts` implement it; no test of timer or history interplay |
| 11 | SC3: refresh and shared links keep search and filters; Back keeps loaded pages and scroll (BRW-11) | PRESENT_BEHAVIOR_UNVERIFIED | Filters are read from the URL via `useSearchParams` and parsed by tested `parseFilters`; Back relies on Activity retention plus 2 h cache per the native-ok spike (no code); needs browser |
| 12 | SC3: Human chip never shows Humanoid; Human total equals exact-Human results | VERIFIED | `species.ts` `exactSpecies`/`deriveTotal` plus tests; live check: step all `Human`, 434 - 68 = 366; `browse-view.tsx` keeps total null ("Counting...") until the Humanoid count arrives |
| 13 | SC3: a superseded search never overwrites newer results; revisiting a recent query does not refetch | VERIFIED | Query key per `filtersKey`; `options.test.ts` proves the signal reaches every sub-request and aborts stop the step; `client.test.ts` pins staleTime 1 h, gcTime 2 h, no focus or reconnect refetch, `networkMode: "always"`. See WR-01 (over-fresh, not under-fresh) |
| 14 | SC4: next step adds no duplicate cards; a 404 on page > 1 ends the list without error or empty state | VERIFIED | `steps.ts` `flattenSteps` de-dups, page-1 404 gives empty step, later 404 ends list; `steps.test.ts` passes; live 404 gives `null` |
| 15 | SC4: scroll or Load more loads next step, focus hand-off, end note | PRESENT_BEHAVIOR_UNVERIFIED | `load-more.tsx` sentinel (400 px margin, recreated per page, paused on error), button, end note; `browse-view.tsx` hand-off effect; no test; WR-02 and WR-03 known focus-loss paths |
| 16 | SC4: "N characters" and "N more characters loaded" announced politely, once, never interim | PRESENT_BEHAVIOR_UNVERIFIED | Strings verified by `announce.test.ts`; `live-region.tsx` polite atomic region with settle timer and `browse-view.tsx` once-per-key guard; audible behaviour needs AT. WR-04 leaves the Human count unannounced if the count request fails |
| 17 | SC4: changing search or filters returns to page 1 at the top of the grid | PRESENT_BEHAVIOR_UNVERIFIED | `applyFilters` trims cached pages and `scrollIntoView` when the toolbar is above the header; scroll needs a browser |
| 18 | SC5: a page-1 404 shows the empty state ("No characters in this dimension" plus Clear filters), never the error state | VERIFIED | `steps.ts` page-1 404 returns `{items: [], count: 0}`; `browse-view.tsx` branch order (error, pending, empty); `empty-panel.tsx` copy; `steps.test.ts` and `options.test.ts` |
| 19 | SC5: skeletons, error panel with Retry and offline wording, inline next-page retry keeping cards | PRESENT_BEHAVIOR_UNVERIFIED | `error-panel.tsx`, `use-online-status.ts`, `card-skeleton.tsx`, `browse-fallback.tsx` (skeleton grid present in prerendered `/browse`), `load-more.tsx`; offline wording is a plan backstop (navigator.onLine can lag) |
| 20 | Typed API client: character lists with filters and pages, single, multi-ID characters, episodes, locations; arrays normalised, missing IDs tolerated; 404 null; 429 with HTML body is `ApiError` http | VERIFIED | `lib/api/*` plus 120 passing tests plus live read; params only via `URLSearchParams`; sorted deduped ID paths |
| 21 | TanStack defaults and next/image config (PERF-01, DATA-05) | VERIFIED | `lib/query/client.ts`; `next.config.ts` remotePatterns locked to `/api/character/avatar/**` with `search: ""`; `lib/config.test.ts` passes; `CardAvatar` eager for the first 5, lazy afterwards, `sizes` string set |

**Score:** 10/21 truths verified (11 present, behavior-unverified; routed to human verification)

### Prohibitions (judgment tier, NON-AUTHORITATIVE verdicts)

All four are `status: resolved`, `verification: judgment` in plans 01-01 and 01-02. They are recorded as `unverified-prohibition: human review recommended`; none is silently passed.

| Prohibition | Verifier read | Evidence |
| ----------- | ------------- | -------- |
| No user data to any host other than rickandmortyapi.com | Holds | Only `fetch(` in the app is `lib/api/client.ts` against `API_BASE`; no other `https://` literal outside the footer link and the avatar guard; Inter is self-hosted by `next/font` |
| No show logo, artwork, quotes or catchphrases | Holds | Text wordmark only; grep for common show catchphrases returns nothing; `public/` holds only scaffold SVGs |
| Not presented as official; disclaimer on every route, never hidden | Holds | `Footer` rendered in `layout.tsx` for all routes, text visible (`text-text-muted`, passes contrast) |
| No decorative motion under reduced motion; no flashing above 3 per second | Holds in code | star drift, skeleton pulse, press scale and menu slide all have reduced-motion overrides; browser confirmation requested above |

### Required Artifacts and Key Links

All artifacts declared in the 10 plans pass `verify.artifacts` (totals per plan: 9/9, 9/9, 9/9, 5/5, 6/6, 7/7, 4/4, 4/4, 6/6, 3/3). All key links pass `verify.key-links` (3/3, 4/4, 5/5, 4/4, 3/3, 3/3, 3/3, 3/3, 3/3, 3/3). Level 4 data flow: `BrowseView` to `useInfiniteQuery(browseOptions)` to `fetchBrowseStep` to `fetchCharacterPage` to `getJson` to the live API is FLOWING (confirmed with a live read). The header counter is a hardcoded "0 collected" by decision D-03 (store and live count are COL-01 to COL-03, Phase 2), and the star slot is intentionally empty (CARD-06, Phase 2); both are explicit, documented scope boundaries, not stubs.

### Requirements Coverage

Union of PLAN frontmatter `requirements` equals the 25 phase IDs; none missing, none orphaned.

| Requirement | Source Plan(s) | Status | Evidence |
| ----------- | -------------- | ------ | -------- |
| FND-01 | 01-02 | SATISFIED | tokens in `globals.css`, `check-contrast.ts` passes |
| FND-02 | 01-04 | SATISFIED (by D-03) | sticky header, wordmark, links, "0 collected" min-width 12ch; live count deferred to Phase 2 |
| FND-03 | 01-02 | SATISFIED | `footer.tsx` link plus disclaimer, in prerendered HTML |
| FND-04 | 01-04 | NEEDS HUMAN | `mobile-menu.tsx`; truth 6 |
| FND-05 | 01-02, 01-04 | PARTIAL, NEEDS HUMAN | skip link verified (truth 4); header clearance is truth 5 |
| FND-06 | 01-04 | NEEDS HUMAN | title verified in HTML; focus is truth 7 |
| FND-07 | 01-02 | NEEDS HUMAN | truth 8 |
| DATA-01 | 01-01 | SATISFIED | truth 20 |
| DATA-02 | 01-01 | SATISFIED | `normalize.ts` `toArray`, `toIdList`; tests |
| DATA-03 | 01-01, 01-06, 01-10 | SATISFIED | `getJson` null on 404, `fetchBrowseStep` page-1 versus later 404; tests plus live |
| DATA-05 | 01-03, 01-06, 01-08 | SATISFIED | truths 13 and 21 |
| BRW-01 | 01-05, 01-09 | NEEDS HUMAN | truth 2 (zero-results renders no list: verified in `browse-view.tsx`) |
| BRW-02 | 01-07 | NEEDS HUMAN | truth 10 |
| BRW-03 | 01-03, 01-07 | SATISFIED (model), UI NEEDS HUMAN | truth 9; chips are `aria-pressed` buttons in labelled groups |
| BRW-04 | 01-06, 01-08 | SATISFIED | truth 12 |
| BRW-05 | 01-07 | NEEDS HUMAN | truth 10 |
| BRW-06 | 01-03, 01-07 | NEEDS HUMAN | truths 10 and 11 |
| BRW-07 | 01-06, 01-08 | NEEDS HUMAN | strings verified; announcement behaviour truth 16 |
| BRW-08 | 01-10 | NEEDS HUMAN | truth 15 (de-dup verified, truth 14) |
| BRW-09 | 01-09, 01-10 | PARTIAL, NEEDS HUMAN | empty-not-error verified (truth 18); UI states truth 19 |
| BRW-10 | 01-07 | NEEDS HUMAN | truth 17 |
| BRW-11 | 01-05, 01-10 | NEEDS HUMAN | truth 11; no code of its own by native-ok decision |
| CARD-01 | 01-05 | PARTIAL BY DECISION | front verified (truth 1); star ships with CARD-06 in Phase 2; ROADMAP SC1 and REQUIREMENTS traceability say so |
| CARD-08 | 01-05 | SATISFIED | `card-avatar.tsx` placeholder and fallback tile; the pre-hydration-failure case is IN-05 |
| PERF-01 | 01-05 | SATISFIED | truth 21 |

REQUIREMENTS.md still shows the Phase 1 rows as Complete and CARD-01 as Pending (partial); this report does not change that. The "Complete" marks on rows marked NEEDS HUMAN above rest on executor claims and are not yet browser-confirmed.

### Code Review Findings (01-REVIEW.md, 01-REVIEW-DISPOSITION.md)

6 warnings, 0 critical, all still `open` in the disposition file (advisory). Each was checked against the source; all six are real. None breaks a roadmap success criterion, so none is a gap. They stay as WARNINGs feeding the human checklist.

| ID | Real? | Breaks a success criterion? | Judgement |
| -- | ----- | --------------------------- | --------- |
| WR-01 `setQueryData` returns `data` unchanged, restarting the 1 h freshness clock | Yes (`browse-view.tsx:173-182`) | No. Config still has staleTime 1 h (DATA-05); effect is that a cache older than 1 h can be shown as fresh after a filter toggle, i.e. fewer refetches, which SC3 ("revisiting does not refetch") does not forbid | Fix before ship: return `undefined` when nothing is trimmed |
| WR-02 focus falls to `body` after a successful first-page Retry | Yes | No (SC5 requires Retry and the states, not post-retry focus). Keyboard and screen-reader users lose place | Fix, owned by A11Y (Phase 3) at the latest |
| WR-03 focus lost when a scroll-started load ends the list or fails, or Retry adds no card | Yes | No. Note the sentinel sits within 400 px of the visible Load more button, so a scroll-started load almost always precedes a button press; the documented "focus to first new card" hand-off is reachable mainly after a failure | Fix; confirm in the human keyboard pass |
| WR-04 failed Humanoid count leaves "Counting..." forever, no total announced | Yes | No. SC3 only requires the total be exact when shown; it is never wrong, only absent. Already flagged in the 01-07 and 01-08 summaries | Fix before ship |
| WR-05 menu stays open and page inert when a link targets the current route | Yes | No by the letter of FND-04 (route change, Escape, outside tap all close), but a keyboard and touch trap with silent filter reset | Fix before ship |
| WR-06 `pendingFocusIndex` not tied to the filter key | Yes | No. Narrow race (Load more then a filter change onto a cached key) | Fix with WR-02 and WR-03 |

Info items IN-01 to IN-06 are accepted as advisory. IN-03 (a step with zero exact matches and a next page renders an empty list plus Load more) is a theoretical edge for the Human-species path; the sentinel recovers it.

Deferral note (not used to hide gaps): the Back round trip through a character page is re-checked as a regression in Phase 3 SC1, and the keyboard-pass items fold into A11Y-01 to A11Y-06.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (all phase code and scripts) | - | `TBD`, `FIXME`, `XXX`, `TODO`, `HACK` | none found | grep over `app`, `components`, `lib`, `scripts` is clean (only a binary `favicon.ico` matches) |
| `components/layout/header.tsx` | 25 | hardcoded "0 collected" | Info | Intentional per D-03; replaced in Phase 2 (COL-03); commented in source |
| `components/card/character-card.tsx` | 40-53 | empty star, link and back-face slots, disabled flip button | Info | Intentional per D-01 to D-03; final markup for Phase 2 |
| `next.config.ts` | 4 | scaffold comment | Info | IN-06 |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| Unit tests | `npm test` | 120 pass, 0 fail | PASS |
| Types and lint | `npx tsc --noEmit`, `npx eslint .` | clean | PASS |
| Contrast gate | `node scripts/check-contrast.ts` | CONTRAST OK | PASS |
| Production build | `npm run build` | 4 static routes | PASS |
| Live read, exact Human step, 404, derived total | module calls against the real API | 826 / null / 36 all Human / 366 | PASS |

### Probe Execution

| Probe | Command | Result | Status |
| ----- | ------- | ------ | ------ |
| `scripts/smoke.ts` (declared in plans 01-02 to 01-10) | `node scripts/smoke.ts route:/ ... route:/collection ... route:/browse ...` | SMOKE OK, 9 of 9 expectations | PASS |

No `scripts/*/tests/probe-*.sh` files exist and none is declared.

### Human Verification Required

See the `human_verification` frontmatter list (10 items). In short, a single browser session should cover: layout at 320 / 640 / 1024 / 1280 px, a full keyboard and focus pass, the mobile menu, reduced motion, search, chips and history, Back restore with several pages, infinite scroll and Load more, a screen-reader pass for the two announcements, offline and Retry, and sign-off of the four judgment-tier prohibitions. The plans' `<verify><human-check>` blocks (plans 01-02 to 01-10) are the same checks, and the 01-10 summary lists them as the end-of-phase UAT.

### Gaps Summary

No gaps. No truth is FAILED, no artifact is missing or a stub, no key link is unwired, and there are no debt markers. The phase is `human_needed` because 11 of 21 truths are runtime browser behaviours that this environment cannot exercise, plus 4 judgment-tier prohibitions that need human sign-off. Recommended before closing the phase: confirm the human checklist, and fix WR-01, WR-04 and WR-05 (small, local) while deciding whether WR-02, WR-03 and WR-06 are fixed now or folded into the Phase 3 accessibility pass.

---

_Verified: 2026-11-12T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
