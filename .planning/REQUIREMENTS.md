# Requirements: Portal Dex

**Defined:** 2026-11-11
**Core Value:** Browsing and collecting characters must feel delightful: cards that tilt, flip and glow, and a portal that reveals a random character, in a dark cosmic UI that stays fast and fully accessible (WCAG 2.1 AA).

Detailed acceptance criteria live in `docs/SPEC.md` (sections 5, 8, 9), the source of truth for scope.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation & Layout

- [x] **FND-01**: Dark cosmic theme tokens (colours, Inter font, radii, shadows) are available app-wide, and every text/background pair passes 4.5:1 contrast (UI borders and focus indicators 3:1)
- [x] **FND-02**: User sees a sticky header with the "Portal Dex" wordmark, Browse and Collection links, and a collected counter that shows "N collected" until the total is known
- [x] **FND-03**: User sees a footer with a link to the Rick and Morty API and the unofficial-fan-project disclaimer
- [x] **FND-04**: On mobile, user can open and close a hamburger menu that closes on Escape, outside tap and route change, traps focus while open and returns focus to the button
- [x] **FND-05**: Keyboard user can use a "Skip to content" link, and focused elements are never hidden behind the sticky header
- [x] **FND-06**: After client-side navigation, focus moves to the page `h1` and the document title updates
- [x] **FND-07**: Star-field background drifts slowly, and is static under reduced motion

### API & Data

- [x] **DATA-01**: Typed API client fetches character lists (with filters and pages), single characters, multi-ID characters, multi-ID episodes and locations
- [x] **DATA-02**: Multi-ID responses are always normalised to arrays and tolerate missing IDs
- [x] **DATA-03**: A 404 on page 1 of a filtered query is "no results", and a 404 on page > 1 means "no more pages"
- [ ] **DATA-04**: Route IDs are validated as positive integers before any fetch, and invalid IDs show the 404 page without calling the API
- [x] **DATA-05**: TanStack Query uses `staleTime` of at least 1 hour and no refetch on window focus, with stale requests cancelled via `AbortSignal`

### Browse

- [x] **BRW-01**: User can see characters in a responsive grid (2 columns under 640 px, 3 from 640–1024 px, 4–5 above)
- [x] **BRW-02**: User can search by name with a 300 ms debounce, and clear it with a × button or Escape
- [x] **BRW-03**: User can filter by status, gender and species chips (one value per group), and deselect an active chip by clicking it
- [x] **BRW-04**: Species chips (Human, Alien, Humanoid, Mythological Creature, Robot, Animal) match exactly, so Human excludes Humanoid, and the displayed total is derived correctly
- [x] **BRW-05**: User can reset search and filters with "Clear all"
- [x] **BRW-06**: Search and filters live in the URL query, so refresh, back and shared links preserve them (typing replaces history, chip changes push)
- [x] **BRW-07**: User sees "N characters" announced via `aria-live="polite"`
- [x] **BRW-08**: User can load more by scrolling (IntersectionObserver) or via a "Load more" button, with no duplicates, and an announcement when more are loaded
- [x] **BRW-09**: User sees skeleton cards while loading, an empty state ("No characters in this dimension" with a clear-filters button), and an error state with Retry (including offline wording)
- [x] **BRW-10**: Changing search or filters resets to page 1 and scrolls to the top of the grid
- [x] **BRW-11**: Going back from a character page restores filters, loaded pages and scroll position

### Card

- [x] **CARD-01**: User sees a card front with avatar, name (two-line clamp), status badge with text, species and favourite star
- [x] **CARD-02**: User can flip a card by click, tap, Enter or Space to see species, type (if any), gender, origin, last location, episode count and a "View details →" link
- [x] **CARD-03**: Flip control is a sibling of the star and link (no nested interactive elements), the hidden face is `inert`, and flip state is exposed with `aria-pressed`
- [x] **CARD-04**: Card frame reflects status: Alive teal glow with pulse, Dead grey with 60% desaturated avatar, unknown purple→pink shimmer
- [ ] **CARD-05**: On desktop pointer, card tilts up to ±12° toward the cursor with a holographic sheen and resets smoothly, disabled on touch and under reduced motion
- [x] **CARD-06**: User can toggle a favourite with the star without flipping the card, via `aria-pressed` and labels like "Add Rick Sanchez to collection"
- [x] **CARD-07**: Every card is focusable with a visible focus ring that stays visible on every frame colour, and exposes a label like "Rick Sanchez, Alive, Human card, press to flip"
- [x] **CARD-08**: Avatars show a placeholder while loading and a fallback tile if the image fails

### Home & Portal

- [x] **HOME-01**: User sees a centred conic-gradient portal with glow, idle rotation (~8 s per turn), headline, explanation and a "Start browsing" button
- [x] **HOME-02**: User can open the portal (click or "Open portal" button) to spin it up for ~1.2 s and see a random character's card scale out face up
- [x] **HOME-03**: User can "Spin again" (no overlapping spins, never the same character twice in a row) or "View details" below the revealed card
- [x] **HOME-04**: Portal is keyboard-operable and announces the revealed name via an `aria-live` region
- [x] **HOME-05**: Under reduced motion the portal does not spin and the card fades in
- [x] **HOME-06**: If the random fetch fails, user sees an inline error with Retry

### Character Detail

- [ ] **DET-01**: User can see a hero with large avatar, name, status, species, type, gender, origin, last location and a favourite button, with unknown origin/location as plain text
- [ ] **DET-02**: Avatar morphs from the card into the hero via View Transitions, with a fade fallback if it is not clean within ~30 minutes and under reduced motion
- [ ] **DET-03**: User sees a horizontally scrollable episode strip ("S01E01 · Pilot"), sorted by ID, with a chip count equal to `character.episode.length`
- [ ] **DET-04**: User sees an "Also found at {location}" row of up to 12 other residents (deterministic, via one multi-ID request) linking to their pages, hidden if the location is unknown or there are no other residents
- [ ] **DET-05**: Page title is "{name} · Portal Dex"
- [ ] **DET-06**: User sees the custom portal-themed 404 for invalid or non-existent character IDs and unknown routes

### Collection

- [x] **COL-01**: Favourites persist in `localStorage` (`portal-dex:favourites`), read only after mount
- [x] **COL-02**: Favourites storage tolerates unavailable storage, corrupt JSON and non-integer entries, and syncs across tabs
- [x] **COL-03**: Header counter updates immediately when a favourite is toggled anywhere
- [ ] **COL-04**: User can see all favourites in the card grid via one multi-ID request
- [ ] **COL-05**: User can remove a favourite from the collection with an exit animation, focus moves sensibly and the removal is announced
- [ ] **COL-06**: User sees an empty collection state with links to Browse and the portal

### Accessibility

- [ ] **A11Y-01**: All interactive elements are keyboard-operable with a visible 2 px teal focus ring
- [ ] **A11Y-02**: `prefers-reduced-motion` disables tilt, portal spin, star-field drift, pulse/shimmer and the morph, and turns the flip into a crossfade
- [ ] **A11Y-03**: Status is never conveyed by colour alone, avatar `alt` is the character name, and each page has landmarks and exactly one `h1`
- [ ] **A11Y-04**: Touch targets are at least 44 × 44 px, and the app reflows at 320 px and 200% zoom
- [ ] **A11Y-05**: Scrolling regions (chips, episode strip) are keyboard-reachable and labelled
- [ ] **A11Y-06**: An automated axe check plus a manual keyboard and screen-reader pass report no WCAG 2.1 AA violations

### Performance & Delivery

- [x] **PERF-01**: `next/image` is configured with the `rickandmortyapi.com` avatar `remotePatterns`, correct `sizes`, and lazy loading below the fold
- [ ] **PERF-02**: Desktop Lighthouse scores 90+ for Performance and Accessibility
- [ ] **DEP-01**: App is deployed on Vercel (manual step needing the user's Vercel account)

### Polish

- [ ] **POL-01**: Timing, glow intensity, spacing and empty/error copy are tuned with no feature changes and no regressions in earlier criteria

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Games & Comparison

- **GAME-01**: "Guess who" silhouette mini-game
- **CMP-01**: Side-by-side card comparison

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Backend, database, authentication, user accounts, server-side favourites | Client-only by design |
| Global leaderboards | Requires a backend |
| Show logo, artwork, quotes or scripts | Unofficial fan project; original branding only |
| Three.js / WebGL | CSS and Motion are sufficient |
| Internationalisation, analytics | Not needed for v1 |
| Test libraries (e.g. Vitest) | Not added without the user's approval |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Complete |
| FND-02 | Phase 1 | Complete |
| FND-03 | Phase 1 | Complete |
| FND-04 | Phase 1 | Complete |
| FND-05 | Phase 1 | Complete |
| FND-06 | Phase 1 | Complete |
| FND-07 | Phase 1 | Complete |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| DATA-04 | Phase 3 | Pending |
| DATA-05 | Phase 1 | Complete |
| BRW-01 | Phase 1 | Complete |
| BRW-02 | Phase 1 | Complete |
| BRW-03 | Phase 1 | Complete |
| BRW-04 | Phase 1 | Complete |
| BRW-05 | Phase 1 | Complete |
| BRW-06 | Phase 1 | Complete |
| BRW-07 | Phase 1 | Complete |
| BRW-08 | Phase 1 | Complete |
| BRW-09 | Phase 1 | Complete |
| BRW-10 | Phase 1 | Complete |
| BRW-11 | Phase 1 | Complete |
| CARD-01 | Phase 1 (partial: card front without the favourite star per D-03; the star moved to CARD-06, Phase 2) | Complete |
| CARD-02 | Phase 2 | Complete |
| CARD-03 | Phase 2 | Complete |
| CARD-04 | Phase 2 | Complete |
| CARD-05 | Phase 2 | Pending |
| CARD-06 | Phase 2 | Complete |
| CARD-07 | Phase 2 | Complete |
| CARD-08 | Phase 1 | Complete |
| HOME-01 | Phase 2 | Complete |
| HOME-02 | Phase 2 | Complete |
| HOME-03 | Phase 2 | Complete |
| HOME-04 | Phase 2 | Complete |
| HOME-05 | Phase 2 | Complete |
| HOME-06 | Phase 2 | Complete |
| DET-01 | Phase 3 | Pending |
| DET-02 | Phase 3 | Pending |
| DET-03 | Phase 3 | Pending |
| DET-04 | Phase 3 | Pending |
| DET-05 | Phase 3 | Pending |
| DET-06 | Phase 3 | Pending |
| COL-01 | Phase 2 | Complete |
| COL-02 | Phase 2 | Complete |
| COL-03 | Phase 2 | Complete |
| COL-04 | Phase 3 | Pending |
| COL-05 | Phase 3 | Pending |
| COL-06 | Phase 3 | Pending |
| A11Y-01 | Phase 3 | Pending |
| A11Y-02 | Phase 3 | Pending |
| A11Y-03 | Phase 3 | Pending |
| A11Y-04 | Phase 3 | Pending |
| A11Y-05 | Phase 3 | Pending |
| A11Y-06 | Phase 3 | Pending |
| PERF-01 | Phase 1 | Complete |
| PERF-02 | Phase 3 | Pending |
| DEP-01 | Phase 3 | Pending |
| POL-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 59 total
- Mapped to phases: 59 ✓ (Phase 1: 25, Phase 2: 15, Phase 3: 18, Phase 4: 1)
- Unmapped: 0

---
*Requirements defined: 2026-11-11*
*Last updated: 2026-11-11 after roadmap creation*
