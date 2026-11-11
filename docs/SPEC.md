# Portal Dex — Project Specification

## 1. Overview

Portal Dex is a responsive web app that turns every character from the public Rick and Morty API into a holographic collectible card. Users browse, search, filter, flip and collect cards, and pull random characters out of an animated portal.

There is no backend, no authentication and no database. All data comes from the public API at runtime.

**Goals**

- A visually striking, dark "cosmic" UI with satisfying micro-interactions
- Fully responsive across mobile, tablet and desktop
- Accessible to WCAG 2.1 AA
- Deliverable in 2 days across 3 GSD phases

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

Do not add other libraries without asking first.

## 3. Data source

**Base URL:** `https://rickandmortyapi.com/api` — all requests are `GET`, all responses are JSON.

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
- Treat a `404` on a filtered query as "no results" (empty state), not an error.
- `origin`/`location` may be `unknown` with an empty `url` — hide links and dependent UI in that case.
- Use a single multi-ID request instead of one request per item (no N+1 fetching).
- Data is effectively static: TanStack Query `staleTime` of at least 1 hour, no refetch on window focus.

## 4. Pages and routes

| Route | Page |
|---|---|
| `/` | Home — portal hero and random card reveal |
| `/browse` | Browse — searchable, filterable card grid |
| `/character/[id]` | Character detail |
| `/collection` | Collection — favourited cards |
| Not found | Custom 404 with the portal motif |

**Global layout**

- Sticky header: text wordmark "Portal Dex", nav links (Browse, Collection), collected counter ("N / {info.count} collected"), hamburger menu on mobile.
- Footer: "Data from The Rick and Morty API" (linked) and "Unofficial fan project; not affiliated with the show or its owners."

## 5. Features and acceptance criteria

### 5.1 Home and portal

- Centred portal: CSS `conic-gradient` swirl (teal → blue → purple) with a soft blur glow, idle rotation of about 8 s per turn.
- Headline, one-line explanation, and a "Start browsing" button linking to `/browse`.
- Clicking the portal (or the "Open portal" button) spins it up over ~1.2 s, then a random character's card scales out from the centre, face up. Random ID is between 1 and `info.count`.
- The revealed card behaves like any card (tilt, flip, favourite). Below it: "Spin again" and "View details".

Acceptance criteria:

- [ ] Opening the portal reveals a valid random character.
- [ ] The portal control is keyboard-operable, and the revealed character's name is announced via an `aria-live` region.
- [ ] With `prefers-reduced-motion`, the portal does not spin and the card simply fades in.

### 5.2 Card component

**Front:** avatar, name, status badge (text label, not colour alone), species, favourite star (top-right).

**Back:** species, type (hidden if empty), gender, origin, last location, episode count, "View details →" link.

**Interactions**

- Desktop pointer: 3D tilt toward the cursor (max ±12°, perspective ~800 px) with a holographic sheen (radial gradient following the pointer). Resets smoothly on pointer leave.
- Click/tap the card, or press Enter/Space when focused, to flip it (`rotateY(180deg)`, ~500 ms, backface hidden).
- "View details" on the back navigates to `/character/[id]`.
- The star toggles the favourite without flipping the card.

**Rarity frames (by status)**

| Status | Frame |
|---|---|
| Alive | Teal `#6FF2D2` glowing border with a subtle pulse |
| Dead | Grey `#8A93A6` border, avatar desaturated (~60% grayscale) |
| unknown | Animated purple `#A66BFF` → pink `#FF7AC8` shimmer border |

Acceptance criteria:

- [ ] Flip works with mouse, touch and keyboard.
- [ ] Tilt is disabled on touch devices (`pointer: coarse`) and with `prefers-reduced-motion`.
- [ ] Toggling the favourite never flips the card.
- [ ] Every card is focusable with a visible focus ring.

### 5.3 Browse

- Responsive card grid (see section 7).
- Name search, debounced 300 ms.
- Filter chips, one value per group (the API accepts one value per parameter):
  - Status: Alive, Dead, unknown
  - Gender: Female, Male, Genderless, unknown
  - Species: Human, Alien, Humanoid, Robot, Animal (verify these values against real API responses)
- "Clear all" resets search and filters.
- Search and filter state is stored in the URL query string so refresh, back button and sharing all work.
- Results count ("N characters" from `info.count`), announced via `aria-live="polite"`.
- Infinite scroll with an `IntersectionObserver` sentinel loading `info.next`, plus a visible "Load more" button as a keyboard-accessible fallback.
- States: skeleton cards while loading; empty state ("No characters in this dimension" plus a clear-filters button); error state with a Retry button.

Acceptance criteria:

- [ ] Typing "rick" shows only matching characters after the debounce.
- [ ] Combined filters work (e.g. name "rick" + status Alive).
- [ ] Scrolling to the bottom loads the next page with no duplicate cards.
- [ ] Refreshing the page keeps the active search and filters.
- [ ] A filter with no matches shows the empty state, not the error state.

### 5.4 Character detail

- Hero: large avatar, name, status, species, type, gender, origin, last location, favourite button.
- **Card → detail transition:** the avatar morphs from the card into the hero using the browser View Transitions API (Next.js's experimental `viewTransition` support, or `document.startViewTransition` with a shared `view-transition-name`). Do **not** use Motion `layoutId` across routes. If this isn't working cleanly within ~30 minutes, fall back to a fade-in on the detail page.
- Episode strip: horizontally scrollable chips ("S01E01 · Pilot"), loaded with one multi-ID episode request, sorted by episode ID.
- "Also found at {location}" row: fetch the character's last location, take up to 12 other residents (excluding the current character), load them with one multi-ID request and show them as mini cards linking to their pages. Hide the row if the location is unknown.
- Page title: "{name} · Portal Dex".

Acceptance criteria:

- [ ] The number of episode chips equals `character.episode.length`.
- [ ] The residents row excludes the current character and shows at most 12.
- [ ] An invalid or non-existent ID shows the 404 page.
- [ ] Browser back returns to Browse with filters intact.

### 5.5 Collection

- Favourites are stored in `localStorage` under the key `portal-dex:favourites` (array of IDs). Read only after mount to avoid hydration mismatches.
- `/collection` loads all favourites with one multi-ID request and shows them in the same card grid.
- Empty state links to Browse and to the portal.
- The header counter updates immediately when a favourite is toggled anywhere.

Acceptance criteria:

- [ ] Favourites persist across page reloads.
- [ ] Removing a favourite on the Collection page animates the card out.

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
- Filter chips in horizontally scrollable rows; full-width search.
- Hamburger navigation.
- Portal scaled to ~70% of viewport width.
- Touch targets at least 44 × 44 px.

## 8. Accessibility (WCAG 2.1 AA)

- All interactive elements are keyboard-operable, with a visible focus ring (2 px teal outline with offset).
- Cards expose a clear label, e.g. "Rick Sanchez card, press to flip".
- Favourite buttons use `aria-pressed` and labels like "Add Rick Sanchez to collection".
- Avatar `alt` text is the character's name.
- `aria-live="polite"` announces results counts and portal reveals.
- `prefers-reduced-motion` disables tilt, portal spin, star-field drift and the shared-element morph (use fades instead).
- Text contrast of at least 4.5:1.
- Status is never conveyed by colour alone (badges always include a text label).
- Semantic landmarks (`header`, `nav`, `main`, `footer`) and one `h1` per page.

## 9. Performance

- `next/image` with `remotePatterns`: protocol `https`, hostname `rickandmortyapi.com`, pathname `/api/character/avatar/**`. Set `sizes` correctly; lazy-load below the fold.
- Multi-ID requests everywhere instead of per-item requests.
- Debounced search; cancel stale requests using the query's `AbortSignal`.
- Target Lighthouse scores of 90+ for Performance and Accessibility on desktop.

## 10. Out of scope

Backend, database, authentication, user accounts, global leaderboards, server-side favourites, show logo or artwork, quotes or scripts, Three.js/WebGL, internationalisation, analytics.

## 11. Delivery plan (GSD phases)

| Phase | Scope | Done when |
|---|---|---|
| 1. Foundation + Browse | Theme tokens, layout (header/footer), API client and types, card front (static), browse grid, search, filters, infinite scroll, loading/empty/error states | All 5.3 criteria pass |
| 2. Card effects + Portal | Tilt, sheen, flip, rarity frames, favourite toggle and counter, home portal with random reveal | All 5.1 and 5.2 criteria pass |
| 3. Detail + Collection | Detail page, card → detail transition, episode strip, residents row, collection page, 404 page, accessibility pass, Vercel deploy | All 5.4, 5.5 and section 8 criteria pass |
| Stretch | "Guess who" silhouette mini-game; side-by-side card comparison | — |

Visual polish (timing, glow intensity, spacing) is tuned after Phase 3, outside the GSD loop.
