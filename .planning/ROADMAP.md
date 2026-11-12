# Roadmap: Portal Dex

## Overview

Portal Dex turns every Rick and Morty API character into a holographic collectible card. The build moves in four vertical slices. Phase 1 lays the dark cosmic foundation (theme, layout, typed API client) and delivers a fully working Browse experience. Phase 2 makes the cards feel alive (flip, tilt, rarity frames, favourites) and adds the home portal with its random reveal. Phase 3 adds the character detail page, the Collection, the portal-themed 404, the accessibility pass and the Vercel deploy. Phase 4 is a light polish pass with no new features. Every phase ends in something a user can open and use.

## Scope Notes

- **Four phases, fine granularity.** The four-phase structure from `docs/SPEC.md` section 11 is kept on purpose (user decision). The `fine` granularity setting therefore applies to how many plans each phase is split into, not to the phase count. Phase 4 owns a single requirement (POL-01) by design.
- **COL-01 to COL-03 sit in Phase 2.** The favourite star (CARD-06) and the live header counter need the `localStorage` favourites store, and the spec lists "favourite toggle and counter" under Phase 2. The Collection page itself (COL-04 to COL-06) stays in Phase 3.
- **DATA-04 sits in Phase 3.** Invalid route IDs only become observable once `/character/[id]` and the 404 page exist. The ID-parsing helper is still written alongside the Phase 1 API client.
- **BRW-11 is built in Phase 1** (infinite query cache plus scroll restore). The full card, detail, back round trip can only be confirmed in Phase 3, so Phase 3 re-checks it as a regression.
- **A11Y-01 to A11Y-06 are owned by Phase 3** as the audit and sign-off. Phases 1 and 2 must build to those constraints from the start (focus rings, reduced motion, 44 px targets, 320 px reflow, no nested interactive elements).
- **The "View details" link** on the card back (Phase 2) points at a route that ships in Phase 3.
- **PERF-02** is measured on the deployed site in Phase 3 and re-run in Phase 4.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation + Browse** - Theme, layout and typed API client, plus a searchable, filterable, infinitely scrolling card grid
- [ ] **Phase 2: Card effects + Portal** - Flip, tilt, sheen, rarity frames, favourites with live counter, and the home portal with random reveal
- [ ] **Phase 3: Detail + Collection** - Character detail with card morph, episodes and residents, Collection page, 404, accessibility pass and Vercel deploy
- [ ] **Phase 4: Light polish** - Tune timing, glow, spacing and copy with no new features and no regressions

## Phase Details

### Phase 1: Foundation + Browse
**Goal:** Users can browse, search and filter every character as cards in an accessible dark cosmic layout, with state that survives refresh and back navigation.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, DATA-01, DATA-02, DATA-03, DATA-05, BRW-01, BRW-02, BRW-03, BRW-04, BRW-05, BRW-06, BRW-07, BRW-08, BRW-09, BRW-10, BRW-11, CARD-01, CARD-08, PERF-01
**Success Criteria** (what must be TRUE):
  1. User opens `/browse` and sees a responsive grid of character card fronts (2 columns under 640 px, 3 from 640 to 1024 px, 4 to 5 above). Each card shows an avatar (placeholder while loading, fallback tile if the image fails), a two-line-clamped name, a status badge with text and the species, with an empty slot reserved for the favourite star (CARD-01 is partial in Phase 1 per decision D-03; the star itself ships with CARD-06 in Phase 2). The page sits in the dark cosmic theme with a sticky header (wordmark, Browse and Collection links, "N collected" counter) and a footer with the API link and fan-project disclaimer.
  2. Keyboard and mobile users can move around: "Skip to content" is the first focusable element, focused elements are never hidden behind the sticky header, the hamburger menu closes on Escape, outside tap and route change while trapping focus and returning it to the button, and after client-side navigation focus lands on the page `h1` and the document title updates. The star-field drifts slowly and is static under reduced motion.
  3. User can type "rick" and see only matching names after a 300 ms debounce, combine it with status, gender and species chips (one value per group, click an active chip to deselect), clear the search with the × button or Escape, and reset everything with "Clear all". Refresh and shared links keep the search and filters; browser Back keeps the loaded pages and scroll position. The Human chip never shows a Humanoid and its total equals the number of exact-Human results. A superseded search never overwrites newer results, and revisiting a recent query does not refetch.
  4. User can scroll to the bottom, or press "Load more", to load the next page with no duplicate cards. "N characters" and "20 more characters loaded" are announced politely, changing search or filters returns to page 1 at the top of the grid, and reaching the last page (a 404 on page > 1) ends loading with no error and no empty state.
  5. User sees skeleton cards while loading, the "No characters in this dimension" empty state with a clear-filters button when nothing matches (never the error state), and an error state with Retry, including "You appear to be offline" wording. A failed next-page load keeps the existing cards and shows an inline retry.
**Plans:** 10/10 plans executed (7 waves)

Plans:
- [x] 01-01-PLAN.md — Test harness and typed API client (live read), ends with the TanStack Query legitimacy checkpoint (wave 1)
- [x] 01-02-PLAN.md — Dark cosmic shell: tokens and contrast gate, Inter, skip link, footer, star field, interim / and /collection, smoke runner (wave 1)
- [x] 01-03-PLAN.md — Walking skeleton: /browse reads real characters via TanStack Query; Status chip writes the URL (wave 2)
- [x] 01-04-PLAN.md — Sticky header, nav and counter, focus-to-h1 on navigation, accessible mobile menu (wave 2)
- [x] 01-05-PLAN.md — Final card front, avatars with fallback, next/image config, grid; Back-navigation spike decision (wave 3)
- [x] 01-06-PLAN.md — Browse policies as tested pure functions: exact-species load steps, derived total, announcement strings, query defaults tests (wave 3)
- [x] 01-07-PLAN.md — Debounced search, all chip groups, Clear all toolbar, reset to page 1 and scroll to grid top (wave 4)
- [x] 01-08-PLAN.md — Exact-species steps and derived Human total wired in, settled live-region announcements (wave 5)
- [x] 01-09-PLAN.md — Loading skeletons, empty state, error and offline states (wave 6)
- [x] 01-10-PLAN.md — Infinite scroll and Load more, end of list, next-page error, Back restore per spike (wave 7)
**UI hint**: yes

### Phase 2: Card effects + Portal
**Goal:** Cards feel alive (flip, tilt, rarity frames, favourites) and the home portal reveals a random character.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: CARD-02, CARD-03, CARD-04, CARD-05, CARD-06, CARD-07, HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, COL-01, COL-02, COL-03
**Success Criteria** (what must be TRUE):
  1. User can flip any card by click, tap, Enter or Space and see species, type (if any), gender, origin, last location, episode count and a "View details →" link. The flip control is a sibling of the star and the link (no nested interactive elements, confirmed by axe), the hidden face is `inert` so its controls are unreachable by keyboard and screen reader, flip state is exposed with `aria-pressed`, and each card is announced like "Rick Sanchez, Alive, Human card, press to flip".
  2. Card frames reflect status: Alive has a teal glow with a subtle pulse, Dead is grey with a 60% desaturated avatar, unknown has a purple to pink shimmer. On a desktop pointer the card tilts up to ±12° toward the cursor with a holographic sheen and resets smoothly, with no tilt on touch or under reduced motion. Every card has a visible focus ring on every frame colour, including Alive teal.
  3. User can toggle a favourite with the star without flipping the card (`aria-pressed`, label "Add Rick Sanchez to collection"). The header counter updates immediately wherever the toggle happens, favourites persist across reloads and sync across tabs, and corrupt or unavailable `localStorage` never crashes the app.
  4. User opens Home and sees a centred conic-gradient portal with glow and idle rotation (about 8 s per turn), a headline, an explanation and a "Start browsing" button. Clicking the portal or the "Open portal" button spins it up for about 1.2 s, then a valid random character's card scales out face up, and the character's name is announced via an `aria-live` region. The portal is fully keyboard-operable.
  5. User can "Spin again" (disabled during a spin or fetch, no overlapping spins or requests, never the same character twice in a row) or open "View details". Under reduced motion the portal does not spin and the card fades in. If the random fetch fails, user sees an inline error with Retry and the portal returns to idle.
**Plans**: TBD
**UI hint**: yes

### Phase 3: Detail + Collection
**Goal:** Users can open any character's full page, collect favourites into a Collection, and use an accessible, deployed app.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: DET-01, DET-02, DET-03, DET-04, DET-05, DET-06, DATA-04, COL-04, COL-05, COL-06, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, PERF-02, DEP-01
**Success Criteria** (what must be TRUE):
  1. User opens a character page from a card and sees a hero with a large avatar, name, status, species, type, gender, origin, last location (unknown origin or location as plain text, never a link) and a favourite button, under the title "{name} · Portal Dex". The avatar morphs from the card into the hero via View Transitions, with a fade fallback when the morph is not clean and under reduced motion. Browser back returns to Browse with filters, loaded pages and scroll position intact.
  2. User sees a horizontally scrollable, labelled, keyboard-reachable episode strip ("S01E01 · Pilot", sorted by ID) with exactly `character.episode.length` chips, and an "Also found at {location}" row of up to 12 other residents (excluding the current character, linking to their pages) that is hidden when the location is unknown or no other residents remain.
  3. `/character/abc`, `/character/0`, `/character/99999` and any unknown route show the portal-themed 404, and `abc` and `0` make no API request.
  4. User can see all favourites in the card grid on `/collection` (one multi-ID request, missing IDs tolerated). Removing one animates the card out, moves focus to the next card (or the heading if none remain) and announces "{name} removed from collection". An empty collection shows links to Browse and the portal.
  5. The app is live on Vercel, and an axe check plus a manual keyboard and screen-reader pass report no WCAG 2.1 AA violations on any page. Every interactive element has a visible 2 px teal focus ring, reduced motion disables tilt, spin, drift, pulse and morph (flip becomes a crossfade), status is never conveyed by colour alone, touch targets are at least 44 × 44 px, the layout reflows at 320 px and 200% zoom, and desktop Lighthouse scores 90+ for Performance and Accessibility on the deployed URL.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Light polish
**Goal:** The app's timing, glow, spacing and copy are tuned, with no feature changes and no regressions.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: POL-01
**Success Criteria** (what must be TRUE):
  1. Animation timing (hover and tilt 150 to 200 ms, flip about 500 ms, page transitions 300 to 400 ms, portal about 1.2 s), glow intensity, spacing and empty/error copy feel consistent across Home, Browse, Detail, Collection and the 404 at mobile, tablet and desktop widths.
  2. Every acceptance criterion from Phases 1 to 3 still passes after the polish, and no new features were added.
  3. Re-running axe and Lighthouse on the deployed site still shows no WCAG 2.1 AA violations and desktop Performance and Accessibility of 90+.
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + Browse | 10/10 | In Progress | - |
| 2. Card effects + Portal | 0/TBD | Not started | - |
| 3. Detail + Collection | 0/TBD | Not started | - |
| 4. Light polish | 0/TBD | Not started | - |
