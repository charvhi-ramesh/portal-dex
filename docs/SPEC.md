# Portal Dex — Project Specification

> Revision note: updated after a gap review (UX, accessibility, API edge cases verified against the live API). Items added by the review are marked with their finding ID in brackets, e.g. [A3]. See "Revision log" at the end.

## 1. Overview

Portal Dex is a responsive web app that turns every character from the public Rick and Morty API into a holographic collectible card. Users browse, search, filter, flip and collect cards, and pull random characters out of an animated portal.

There is no backend, no authentication and no database. All data comes from the public API at runtime.

**Goals**

- A visually striking, dark "cosmic" UI with satisfying micro-interactions
- Fully responsive across mobile, tablet and desktop
- Accessible to WCAG 2.1 AA
- Deliverable in 2 days across 4 GSD phases (3 build phases plus 1 light polish phase)

## 2. Tech stack (decided — skip research)

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript. A fresh `create-next-app` scaffold already exists in this repo — build on it, do not re-scaffold. |
| Styling | Tailwind CSS |
| Data fetching | TanStack Query (including `useInfiniteQuery`) |
| Animation | Motion (`motion/react`) for in-page animation; browser View Transitions for the card → detail transition (see 5.4) |
| Images | `next/image` |
| Font | Inter via `next/font` |
| Hosting | Vercel |

Do not add other libraries without asking first (this includes test libraries).

**Next.js caveat [P1]:** `AGENTS.md` states this Next.js version has breaking changes. Before using `viewTransition`, `notFound()`, `next/image` `remotePatterns`, route params or metadata APIs, read the relevant guide in `node_modules/next/dist/docs/`.

## 3. Data source

**Base URL:** `https://rickandmortyapi.com/api` — all requests are `GET`, all responses are JSON. The API allows any origin (CORS `*`) and serves immutable, long-cached responses, so fetch directly from the client with no proxy [A10].

| Purpose | Request |
|---|---|
| Character list (20 per page) | `GET /character?page=N` |
| Filtered list | `GET /character?name=&status=&species=&gender=&page=N` |
| Single character | `GET /character/{id}` |
| Multiple characters | `GET /character/{id1},{id2},...` |
| Multiple episodes | `GET /episode/{id1},{id2},...` |
| Single location | `GET /location/{id}` |

**Pagination:** list responses include `info { count, pages, next, prev }`. Use `info.next` for infinite scroll and `info.count` for totals. Never hardcode counts.

**Character fields used:** `id`, `name`, `status` (`Alive` | `Dead` | `unknown`), `species`, `type`, `gender` (`Female` | `Male` | `Genderless` | `unknown`), `origin { name, url }`, `location { name, url }`, `image` (300×300 avatar), `episode` (array of URLs).

**Data rules**

- Extract IDs from resource URLs (last path segment).
- Always normalise multi-ID responses to an array (a single ID can return an object).
- A multi-ID request silently omits IDs that do not exist, so callers must tolerate receiving fewer items than requested [A5].
- Treat a `404` on a filtered query as "no results" (empty state), not an error — **but only for page 1**. A `404` on page > 1 means "no more pages": stop loading and keep the existing results [A4].
- **Validate the route ID before fetching** [A3]: `/character/abc` returns HTTP 500 and `/character/0` or `/character/99999` return 404. A non-integer or non-positive `[id]` must call `notFound()` without hitting the API; a 404 from the API also maps to `notFound()`.
- `origin`/`location` may be `unknown` with an empty `url` (about 36% of characters have an empty origin URL). Render the name as plain text, hide links and dependent UI in that case [A6].
- Character IDs are contiguous (1 to `info.count`), so a random ID between 1 and `info.count` is always valid. Cache the count after the first list request; the portal must not block on a count request that is slow or failed (fall back to a cached or last-known count) [A8].
- Use a single multi-ID request instead of one request per item (no N+1 fetching).
- Data is effectively static: TanStack Query `staleTime` of at least 1 hour, no refetch on window focus.
- **Filter semantics** [A1, A9]: `name` and `species` are substring matches (`species=human` also returns Humanoid); `status` and `gender` are exact. See 5.3 for how Species chips compensate.
- Species values observed in the API: Human, Alien, Humanoid, Mythological Creature, Animal, Robot, Poopybutthole, Cronenberg, Disease, unknown.

## 4. Pages and routes

| Route | Page |
|---|---|
| `/` | Home — portal hero and random card reveal |
| `/browse` | Browse — searchable, filterable card grid |
| `/character/[id]` | Character detail |
| `/collection` | Collection — favourited cards |
| Not found | Custom 404 with the portal motif |

**Global layout**

- Sticky header: text wordmark "Portal Dex", nav links (Browse, Collection), collected counter ("N / {info.count} collected"), hamburger menu on mobile. Until `info.count` is known the counter shows "N collected" (never "N / 0") and reserves its width so the layout does not jump [U8].
- "Skip to content" link as the first focusable element [X7]. Sticky-header height must not obscure focused elements (use `scroll-padding-top`).
- Mobile menu: opens as a labelled disclosure/dialog, closes on Escape, on outside tap and on route change, returns focus to the hamburger button, and traps focus while open [U7].
- Footer: "Data from The Rick and Morty API" (linked) and "Unofficial fan project; not affiliated with the show or its owners."
- After client-side navigation, focus moves to the page `h1` and `document.title` updates [X8].

## 5. Features and acceptance criteria

### 5.1 Home and portal

- Centred portal: CSS `conic-gradient` swirl (teal → blue → purple) with a soft blur glow, idle rotation of about 8 s per turn.
- Headline, one-line explanation, and a "Start browsing" button linking to `/browse`.
- Clicking the portal (or the "Open portal" button) spins it up over ~1.2 s, then a random character's card scales out from the centre, face up. Random ID is between 1 and `info.count`.
- The revealed card behaves like any card (tilt, flip, favourite). Below it: "Spin again" and "View details".
- "Spin again" and the portal control are disabled while a spin or fetch is in progress, and a re-spin never returns the same character twice in a row [U9].
- If the random fetch fails, show an inline error with Retry; the portal returns to idle.

Acceptance criteria:

- [ ] Opening the portal reveals a valid random character.
- [ ] The portal control is keyboard-operable, and the revealed character's name is announced via an `aria-live` region.
- [ ] With `prefers-reduced-motion`, the portal does not spin and the card simply fades in.
- [ ] Activating the portal repeatedly does not trigger overlapping spins or requests.

### 5.2 Card component

**Front:** avatar, name, status badge (text label, not colour alone), species, favourite star (top-right).

**Back:** species, type (hidden if empty), gender, origin, last location, episode count, "View details →" link.

**Structure [X1, X2, X3]**

- The flip control is a toggle button (`aria-pressed` reflects the flipped state) that is a **sibling** of the favourite star and the "View details" link, never their ancestor (no nested interactive elements).
- The currently hidden face is `inert` (not focusable, not announced); only the visible face's controls are in the tab order.
- The card's accessible name includes status and species, e.g. "Rick Sanchez, Alive, Human — card, press to flip" [X12].
- Names are line-clamped to two lines with the full name available via `title`/accessible name [U10].
- Avatar uses a blur/skeleton placeholder and a fallback tile if the image fails to load [U5].

**Interactions**

- Desktop pointer: 3D tilt toward the cursor (max ±12°, perspective ~800 px) with a holographic sheen (radial gradient following the pointer). Resets smoothly on pointer leave.
- Click/tap the card, or press Enter/Space when focused, to flip it (`rotateY(180deg)`, ~500 ms, backface hidden).
- "View details" on the back navigates to `/character/[id]`.
- The star toggles the favourite without flipping the card.
- Tilt and sheen are pointer-only; keyboard users get the flip and a visible focus state, which is an accepted difference [X10].

**Rarity frames (by status)**

| Status | Frame |
|---|---|
| Alive | Teal `#6FF2D2` glowing border with a subtle pulse |
| Dead | Grey `#8A93A6` border, avatar desaturated (~60% grayscale) |
| unknown | Animated purple `#A66BFF` → pink `#FF7AC8` shimmer border |

The focus ring must stay distinguishable on every frame colour (for example a navy inner ring plus teal outer ring with offset), not just on neutral surfaces [X5].

Acceptance criteria:

- [ ] Flip works with mouse, touch and keyboard.
- [ ] Tilt is disabled on touch devices (`pointer: coarse`) and with `prefers-reduced-motion`.
- [ ] Toggling the favourite never flips the card.
- [ ] Every card is focusable with a visible focus ring, including on the Alive teal frame.
- [ ] The hidden face's links and buttons are not reachable by keyboard or screen reader.
- [ ] No card markup contains a nested interactive element (verified by axe).

### 5.3 Browse

- Responsive card grid (see section 7).
- Name search, debounced 300 ms, with a clear (×) button and Escape-to-clear [U3].
- Filter chips are a toggle group, one value per group (the API accepts one value per parameter). Clicking the active chip deselects it [U4]:
  - Status: Alive, Dead, unknown
  - Gender: Female, Male, Genderless, unknown
  - Species: Human, Alien, Humanoid, Mythological Creature, Robot, Animal (the remaining rare species — Poopybutthole, Cronenberg, Disease, unknown — are reachable through search only) [A2]
- **Species exact-match [A1]:** because `species=` is a substring match, results for a species chip are filtered client-side to the exact species (so "Human" excludes "Humanoid"). Because filtering after pagination leaves short pages, the list auto-requests the next page when a page yields fewer than 20 exact matches and more pages exist. The displayed total is derived, not `info.count`: for Human, total = `count(species=human)` − `count(species=humanoid)` with the same other filters (the second request is count-only, page 1). Other species chips have no overlapping species and use `info.count` directly.
- "Clear all" resets search and filters.
- Search and filter state is stored in the URL query string so refresh, back button and sharing all work. Typing uses `router.replace` (no history spam); chip changes use `push` [U3].
- Changing any search/filter resets the list to page 1 and scrolls to the top of the grid [U1].
- Results count ("N characters" from `info.count`, or the derived total for Human), announced via `aria-live="polite"`.
- Infinite scroll with an `IntersectionObserver` sentinel loading `info.next`, plus a visible "Load more" button as a keyboard-accessible fallback. After more cards load, announce "20 more characters loaded" via the live region and keep focus where it was (on "Load more" focus moves to the first newly loaded card) [X4].
- States: skeleton cards while loading; empty state ("No characters in this dimension" plus a clear-filters button); error state with a Retry button that also covers the offline case ("You appear to be offline") [U6]. A failed next-page load keeps existing cards and shows an inline retry.
- Back navigation restores the previously loaded pages and scroll position by keeping the infinite query cached [U2].

Acceptance criteria:

- [ ] Typing "rick" shows only characters whose name contains "rick" after the debounce.
- [ ] Combined filters work (e.g. name "rick" + status Alive).
- [ ] Scrolling to the bottom loads the next page with no duplicate cards.
- [ ] Refreshing the page keeps the active search and filters.
- [ ] A filter with no matches shows the empty state, not the error state.
- [ ] Reaching the last page (a `404` on page > 1) ends loading without showing an error or the empty state.
- [ ] The Human chip never shows a Humanoid, and its displayed total equals the number of exact-Human results.
- [ ] Clicking an active chip deselects it; Escape or × clears the search.
- [ ] Going back from a character page restores filters, loaded pages and scroll position.

### 5.4 Character detail

- Hero: large avatar, name, status, species, type, gender, origin, last location, favourite button.
- **Card → detail transition:** the avatar morphs from the card into the hero using the browser View Transitions API (Next.js's experimental `viewTransition` support, or `document.startViewTransition` with a shared `view-transition-name`). Do **not** use Motion `layoutId` across routes. If this isn't working cleanly within ~30 minutes, fall back to a fade-in on the detail page. Under `prefers-reduced-motion` use the fade.
- Episode strip: horizontally scrollable chips ("S01E01 · Pilot"), loaded with one multi-ID episode request (normalise a single-object response), sorted by episode ID. The strip is keyboard-reachable (focusable scroll region with a label) [X11].
- "Also found at {location}" row: fetch the character's last location, take the first 12 residents after excluding the current character (deterministic), load them with one multi-ID request and show them as mini cards linking to their pages. Hide the row if the location is unknown **or if no other residents remain** [A7].
- Page title: "{name} · Portal Dex".
- An invalid route ID (non-integer, zero, negative) or an unknown ID renders the custom 404 [A3].

Acceptance criteria:

- [ ] The number of episode chips equals `character.episode.length`.
- [ ] The residents row excludes the current character and shows at most 12; it is hidden when there are none.
- [ ] `/character/abc`, `/character/0` and `/character/99999` all show the 404 page, and `abc`/`0` make no API request.
- [ ] Browser back returns to Browse with filters intact.

### 5.5 Collection

- Favourites are stored in `localStorage` under the key `portal-dex:favourites` (array of IDs). Read only after mount to avoid hydration mismatches.
- Storage is defensive: if `localStorage` is unavailable (private mode, quota) the app keeps favourites in memory for the session; corrupt or non-array JSON is discarded; non-integer entries are filtered out; changes sync across tabs via the `storage` event [U12].
- `/collection` loads all favourites with one multi-ID request (tolerating missing IDs) and shows them in the same card grid.
- Empty state links to Browse and to the portal.
- The header counter updates immediately when a favourite is toggled anywhere.
- Removing a card from the Collection animates it out, then moves focus to the next card (or the heading if none remain) and announces "{name} removed from collection" via the live region [U11].

Acceptance criteria:

- [ ] Favourites persist across page reloads.
- [ ] Removing a favourite on the Collection page animates the card out and keeps focus in a sensible place.
- [ ] A corrupt `portal-dex:favourites` value does not crash the app.

## 6. Visual design

**Direction:** dark cosmic background, neon glow accents, soft rounded "clay" surfaces.

**Colour tokens**

| Token | Value | Use |
|---|---|---|
| `bg` | `#0A0F1F` | Page background |
| `surface` | `#131B33` | Cards, panels |
| `surface-raised` | `#1B2545` | Hover/raised surfaces |
| `text` | `#F2F5FF` | Primary text |
| `text-muted` | `#A9B3CC` | Secondary text |
| `blue` | `#4DA3FF` | Primary actions, links |
| `purple` | `#A66BFF` | Accents, unknown status |
| `teal` | `#6FF2D2` | Alive status, focus rings |
| `pink` | `#FF7AC8` | Favourites |
| `grey` | `#8A93A6` | Dead status |

**Rule:** text on accent-coloured fills must be navy `#0A0F1F`. White fails contrast on blue and purple.

**Contrast check [X6]:** before Phase 1 locks the tokens, verify every text/background pair reaches 4.5:1 (including `text-muted` on `surface` and `surface-raised`, and grey text on `surface`) and every UI border/icon/focus indicator reaches 3:1.

**Typography:** Inter — 700 for headings, 400 for body, 16 px base.

**Shape and depth:** 16–24 px radius on cards and panels, pill-shaped chips, soft layered "clay" shadows, coloured outer glow on hover and focus.

**Background:** CSS star field (layered `radial-gradient` dots) with a very slow drift; static under reduced motion.

**Motion timing**

| Interaction | Duration |
|---|---|
| Hover / tilt response | 150–200 ms |
| Card flip | ~500 ms |
| Page transitions | 300–400 ms |
| Portal spin-up | ~1.2 s |

Only animate `transform` and `opacity`.

**Branding:** original only — text wordmark "Portal Dex". No show logo, title artwork or quotes.

## 7. Responsive behaviour

| Breakpoint | Width | Grid columns |
|---|---|---|
| Mobile | < 640 px | 2 |
| Tablet | 640–1024 px | 3 |
| Desktop | > 1024 px | 4–5 |

**Mobile adjustments**

- No tilt; tap to flip.
- Filter chips in horizontally scrollable rows (keyboard-reachable); full-width search.
- Hamburger navigation.
- Portal scaled to ~70% of viewport width.
- Touch targets at least 44 × 44 px.
- Content reflows without horizontal scrolling at 320 px width and remains usable at 200% zoom [X11].

## 8. Accessibility (WCAG 2.1 AA)

- All interactive elements are keyboard-operable, with a visible focus ring (2 px teal outline with offset) that remains visible on every card frame colour [X5].
- Cards expose a clear label, e.g. "Rick Sanchez, Alive, Human card, press to flip", and are built without nested interactive elements [X1, X12].
- Favourite buttons use `aria-pressed` and labels like "Add Rick Sanchez to collection".
- Avatar `alt` text is the character's name.
- `aria-live="polite"` announces results counts, "more loaded" updates, portal reveals and collection removals.
- `prefers-reduced-motion` disables tilt, portal spin, star-field drift, pulse/shimmer frame animation and the shared-element morph, and turns the card flip into a short crossfade (use fades instead) [X9].
- Text contrast of at least 4.5:1; UI components and focus indicators at least 3:1 [X6].
- Status is never conveyed by colour alone (badges always include a text label).
- Semantic landmarks (`header`, `nav`, `main`, `footer`) and one `h1` per page.
- Skip-to-content link, focus moved to the `h1` after route changes, and focused elements never hidden behind the sticky header [X7, X8].
- The currently hidden card face is `inert`; flip state is exposed with `aria-pressed` [X2, X3].
- Horizontally scrolling regions (chips, episode strip) are keyboard-reachable and labelled [X11].
- Reflow at 320 px and 200% zoom without loss of content or function [X11].
- Verified with an automated axe check (browser extension or Lighthouse) plus a manual keyboard and screen-reader pass.

## 9. Performance

- `next/image` with `remotePatterns`: protocol `https`, hostname `rickandmortyapi.com`, pathname `/api/character/avatar/**`. Set `sizes` correctly; lazy-load below the fold.
- Multi-ID requests everywhere instead of per-item requests.
- Debounced search; cancel stale requests using the query's `AbortSignal`.
- Target Lighthouse scores of 90+ for Performance and Accessibility on desktop.

## 10. Out of scope

Backend, database, authentication, user accounts, global leaderboards, server-side favourites, show logo or artwork, quotes or scripts, Three.js/WebGL, internationalisation, analytics.

Deferred to v2 (tracked, not in the current roadmap): "Guess who" silhouette mini-game; side-by-side card comparison.

## 11. Delivery plan (GSD phases)

| Phase | Scope | Done when |
|---|---|---|
| 1. Foundation + Browse | Theme tokens (with contrast check), layout (header/footer, skip link, mobile menu), API client and types (ID validation, normalisation, 404 rules), card front (static), browse grid, search, filters (including exact-match species), infinite scroll, loading/empty/error states | All 5.3 criteria pass |
| 2. Card effects + Portal | Tilt, sheen, flip (accessible structure), rarity frames, favourite toggle and counter, home portal with random reveal | All 5.1 and 5.2 criteria pass |
| 3. Detail + Collection | Detail page, card → detail transition, episode strip, residents row, collection page, 404 page, accessibility pass, Vercel deploy | All 5.4, 5.5 and section 8 criteria pass |
| 4. Light polish | Tune timing, glow intensity, spacing, empty/error copy and responsive details; re-run Lighthouse and axe; no new features | No regressions in earlier criteria; Lighthouse Performance and Accessibility 90+ on desktop |

v2 backlog (not in this roadmap): "Guess who" silhouette mini-game; side-by-side card comparison.

## Revision log

- Gap review: added data rules A1, A3–A8 (verified against the live API: substring species filter, HTTP 500 on non-numeric IDs, 404 on out-of-range pages, silently dropped missing IDs, empty origin URLs, zero-resident locations), UX items U1–U12, accessibility items X1–X12, process note P1.
- Decisions: species chips use client-side exact matching with a derived total; stretch features moved to v2; a light polish phase (Phase 4) added to the roadmap; the card → detail View Transition keeps the 30-minute fallback to a fade.
- Open: whether to add a test library (e.g. Vitest) for the API client and ID helpers — not added without approval [P2]. The Vercel deploy needs the user's Vercel account and is a manual step [P3].
