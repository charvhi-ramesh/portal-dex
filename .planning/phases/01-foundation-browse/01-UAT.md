---
status: testing
phase: 01-foundation-browse
source: 01-01-SUMMARY.md to 01-10-SUMMARY.md
started: 2026-11-12T04:31:20.801Z
updated: 2026-11-12T04:31:20.801Z
---

## Current Test

number: 9
name: 02/D4 First Tab stop is 'Skip to content' and Enter moves focus into main; footer is s
expected: |
  First Tab stop is 'Skip to content' and Enter moves focus into main; footer is stacked at 320 px and one row at 1280 px; no horizontal scroll at 320 px
awaiting: user response

## Tests

### 1. [Plan 01 D1] npm test runs the lib/api unit suites with Node's built-in runner and ...
expected: npm test runs the lib/api unit suites with Node's built-in runner and adds no dependency
result: pass
source: automated

### 2. [Plan 01 D2] Typed getJson client with network/http/parse error taxonomy, 404 to nu...
expected: Typed getJson client with network/http/parse error taxonomy, 404 to null, and abort passthrough; a live read returns the first character page
result: pass
source: automated

### 3. [Plan 01 D3] Character, episode and location single and multi-ID endpoints normalis...
expected: Character, episode and location single and multi-ID endpoints normalised to arrays, deterministic ordering, safe query encoding
result: pass
source: automated

### 4. [Plan 01 D4] Partial and empty multi-ID responses normalise to arrays (DATA-02)
expected: Partial and empty multi-ID responses normalise to arrays (DATA-02)
result: pass
source: automated

### 5. [Plan 01 D5] User approval of the @tanstack/react-query version before any plan ins...
expected: User approval of the @tanstack/react-query version before any plan installs it
result: pass
source: user-decision
note: User replied "approved 5.107.1" to the package checkpoint in this session.

### 6. [Plan 02 D1] Dark @theme tokens are gated by a contrast check covering every UI-SPE...
expected: Dark @theme tokens are gated by a contrast check covering every UI-SPEC text, border, focus and frame pair, including text, text-muted and blue over the star dot composited at the 15% cap
result: pass
source: automated

### 7. [Plan 02 D2] Production build serves the dark shell: skip link, main-content target...
expected: Production build serves the dark shell: skip link, main-content target, interim home h1, star-field markup, footer link and disclaimer with rel noopener noreferrer, and /collection with its h1 and 'Collection · Portal Dex' title
result: pass
source: automated

### 8. [Plan 02 D3] Smoke runner starts next start on 127.0.0.1, asserts served HTML per r...
expected: Smoke runner starts next start on 127.0.0.1, asserts served HTML per route, rejects bad usage with exit 2, and always stops the server
result: pass
source: automated

### 9. [Plan 02 D4] First Tab stop is 'Skip to content' and Enter moves focus into main; f...
expected: First Tab stop is 'Skip to content' and Enter moves focus into main; footer is stacked at 320 px and one row at 1280 px; no horizontal scroll at 320 px
result: [pending]

### 10. [Plan 02 D5] Star dots drift slowly by transform only behind content and are static...
expected: Star dots drift slowly by transform only behind content and are static under prefers-reduced-motion: reduce
result: [pending]

### 11. [Plan 03 D1] QueryClient defaults meet DATA-05: staleTime at least 1 h, gcTime abov...
expected: QueryClient defaults meet DATA-05: staleTime at least 1 h, gcTime above staleTime, no refetch on window focus or reconnect, networkMode always, and shouldRetry never retries 4xx or aborts
result: pass
source: automated

### 12. [Plan 03 D2] Runtime dependencies are exactly next, react, react-dom and @tanstack/...
expected: Runtime dependencies are exactly next, react, react-dom and @tanstack/react-query at an exact semver; no test or motion library in devDependencies
result: pass
source: automated

### 13. [Plan 03 D3] URL filter model: allow-list rejection of junk params, q trim and 60 c...
expected: URL filter model: allow-list rejection of junk params, q trim and 60 code point cap without splitting a surrogate pair, whitespace-only q omitted, fixed key order, one value per group toggle, round trip for awkward characters
result: pass
source: automated

### 14. [Plan 03 D4] Production build prerenders /browse with the h1 'Browse characters', t...
expected: Production build prerenders /browse with the h1 'Browse characters', the title 'Browse · Portal Dex' and the reserved aria-busy Suspense region (Cache Components accepts the useSearchParams boundary)
result: pass
source: automated

### 15. [Plan 03 D5] In a real browser: real characters load, Alive writes /browse?status=A...
expected: In a real browser: real characters load, Alive writes /browse?status=Alive as a history push, refresh keeps aria-pressed true, pressing Alive again returns to /browse, and Back after Alive then Dead shows ?status=Alive from cache with no network request
result: [pending]

### 16. [Plan 04 D1] Sticky header with wordmark, Browse/Collection nav (aria-current on th...
expected: Sticky header with wordmark, Browse/Collection nav (aria-current on the current link) and '0 collected' counter in the served HTML
result: pass
source: automated

### 17. [Plan 04 D3] Per-page document title via root template (Collection · Portal Dex) in...
expected: Per-page document title via root template (Collection · Portal Dex) in the served HTML
result: pass
source: automated

### 18. [Plan 04 D5] Mobile menu markup (hamburger with aria-controls and Open menu label, ...
expected: Mobile menu markup (hamburger with aria-controls and Open menu label, Main menu dialog) in the served HTML
result: pass
source: automated

### 19. [Plan 04 D2] Header visual layout: 64 px sticky bar, current-link underline, counte...
expected: Header visual layout: 64 px sticky bar, current-link underline, counter pill, no overlap or horizontal scroll at 320 px, DOM/Tab order
result: [pending]

### 20. [Plan 04 D4] Focus moves to the new page h1 after a client-side header link click, ...
expected: Focus moves to the new page h1 after a client-side header link click, and never on typing or chip changes
result: [pending]

### 21. [Plan 04 D6] Mobile menu behaviour: focus moves to first link, Tab/Shift+Tab trap, ...
expected: Mobile menu behaviour: focus moves to first link, Tab/Shift+Tab trap, page behind inert, Escape and outside tap close with focus on hamburger, link follow closes and focuses h1, widening closes, animation
result: [pending]

### 22. [Plan 04 D7] No focused element hidden under the sticky header (scroll-padding-top ...
expected: No focused element hidden under the sticky header (scroll-padding-top 80 px with header in place)
result: [pending]

### 23. [Plan 05 D1] images.remotePatterns holds a single https rickandmortyapi.com /api/ch...
expected: images.remotePatterns holds a single https rickandmortyapi.com /api/character/avatar/** entry with search empty, and the production build accepts it
result: pass
source: automated

### 24. [Plan 05 D2] isAvatarUrl accepts only https API avatar URLs with no port, query or ...
expected: isAvatarUrl accepts only https API avatar URLs with no port, query or hash; everything else renders the fallback tile
result: pass
source: automated

### 25. [Plan 05 D3] Cards render as static final-markup fronts in a 2/3/4/5 column grid wi...
expected: Cards render as static final-markup fronts in a 2/3/4/5 column grid with status frames, badges, two-line name clamp and one-line species
result: [pending]

### 26. [Plan 05 D4] Back-navigation spike recorded for plan 01-10
expected: Back-navigation spike recorded for plan 01-10
result: pass
source: user-decision
note: User chose option native-ok for the Back-navigation spike in this session; no written observations were supplied.

### 27. [Plan 06 D1] Exact-species filtering and derived Human total (366 = 434 - 68, 73 = ...
expected: Exact-species filtering and derived Human total (366 = 434 - 68, 73 = 80 - 7), null until the humanoid count is known, never negative
result: pass
source: automated

### 28. [Plan 06 D2] Load-step fill loop: 20-item target, 4 API page cap, page-1 and later-...
expected: Load-step fill loop: 20-item target, 4 API page cap, page-1 and later-page 404 rules, abort between sub-requests, RangeError on a bad startPage, id de-duplication
result: pass
source: automated

### 29. [Plan 06 D3] Count line and live-region strings: zero/one/many, empty-state announc...
expected: Count line and live-region strings: zero/one/many, empty-state announcement instead of '0 characters', en thousands separators, real added count
result: pass
source: automated

### 30. [Plan 06 D4] QueryClient defaults (staleTime >= 1 h, gcTime > staleTime, no focus/r...
expected: QueryClient defaults (staleTime >= 1 h, gcTime > staleTime, no focus/reconnect refetch, networkMode always) and retry policy
result: pass
source: automated

### 31. [Plan 07 D1] Typing filters the grid 300 ms after the last keystroke; URL q follows...
expected: Typing filters the grid 300 ms after the last keystroke; URL q follows by history replace; x and Escape clear immediately with the right focus
result: [pending]

### 32. [Plan 07 D2] Status, Gender and Species aria-pressed chip groups combine with searc...
expected: Status, Gender and Species aria-pressed chip groups combine with search, one value per group, chips push history
result: [pending]

### 33. [Plan 07 D3] Clear all appears only while a search or chip is active and resets eve...
expected: Clear all appears only while a search or chip is active and resets everything in one history push, in a fixed 44 px toolbar row
result: [pending]

### 34. [Plan 07 D4] Search and chips are static above the grid; chip rows scroll with a fa...
expected: Search and chips are static above the grid; chip rows scroll with a fade under 640 px and wrap from 640 px
result: [pending]

### 35. [Plan 07 D5] User-initiated changes restart at page 1 (cached pages trimmed) and sc...
expected: User-initiated changes restart at page 1 (cached pages trimmed) and scroll the toolbar below the header only when it is above it
result: [pending]

### 36. [Plan 08 D1] Human chip lists only exact Humans; short API pages are filled by load...
expected: Human chip lists only exact Humans; short API pages are filled by load steps; count shows Counting... until the derived total is final
result: [pending]

### 37. [Plan 08 D2] Settled result count announced once per search or filter change from o...
expected: Settled result count announced once per search or filter change from one polite atomic region; never interim, never Humanoid-inflated
result: [pending]

### 38. [Plan 08 D3] Each filter set has its own query key and every API sub-request of a l...
expected: Each filter set has its own query key and every API sub-request of a load step receives the query AbortSignal
result: [pending]

### 39. [Plan 09 D1] First-page failure shows the error panel (offline or generic wording) ...
expected: First-page failure shows the error panel (offline or generic wording) with a Retry that refetches page 1; filters stay usable
result: [pending]

### 40. [Plan 09 D2] No matches shows the empty panel with Clear filters, never the error p...
expected: No matches shows the empty panel with Clear filters, never the error panel, and renders no empty list
result: [pending]

### 41. [Plan 09 D3] Loading shows card-sized skeletons (4/6/8/10 by breakpoint, opacity pu...
expected: Loading shows card-sized skeletons (4/6/8/10 by breakpoint, opacity pulse, static 0.75 under reduced motion); the prerendered /browse shell contains the skeleton grid, the Counting... slot and an aria-busy region
result: [pending]

### 42. [Plan 10 D5] Production build and combined Phase 1 smoke check still serve /, /brow...
expected: Production build and combined Phase 1 smoke check still serve /, /browse and /collection
result: pass
source: automated

### 43. [Plan 10 D1] Infinite scroll via a 400 px sentinel observer plus a keyboard Load mo...
expected: Infinite scroll via a 400 px sentinel observer plus a keyboard Load more button, no duplicate cards (flattenSteps), loading continues on tall screens
result: [pending]

### 44. [Plan 10 D2] Focus hand-off to the first new card, aria-disabled Loading more... bu...
expected: Focus hand-off to the first new card, aria-disabled Loading more... button, n more characters loaded announcements
result: [pending]

### 45. [Plan 10 D3] End-of-list note replaces the button with no error or empty state; fai...
expected: End-of-list note replaces the button with no error or empty state; failed next-page load keeps cards, shows role=alert Retry row and pauses auto-loading
result: [pending]

### 46. [Plan 10 D4] Back from another route restores filters, loaded pages and scroll via ...
expected: Back from another route restores filters, loaded pages and scroll via the native-ok decision (no code)
result: [pending]

## Summary

total: 46
passed: 23
issues: 0
pending: 23
skipped: 0
blocked: 0

## Gaps

[none yet]
