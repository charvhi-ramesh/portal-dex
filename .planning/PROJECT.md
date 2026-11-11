# Portal Dex

## What This Is

Portal Dex is a responsive web app that turns every character from the public Rick and Morty API into a holographic collectible card. Fans browse, search, filter, flip and favourite cards, and pull random characters out of an animated portal. It has no backend, no authentication and no database: all data comes from the public API at runtime, and favourites live in `localStorage`. It is an unofficial fan project with original branding only.

## Core Value

Browsing and collecting characters must feel delightful: cards that tilt, flip and glow, and a portal that reveals a random character, all in a dark "cosmic" UI that stays fast and fully accessible (WCAG 2.1 AA).

## Requirements

### Validated

(None yet — ship to validate)

### Active

Detailed, testable acceptance criteria live in `docs/SPEC.md` (sections 5, 8 and 9), which is the source of truth for scope. Requirement IDs are assigned in `REQUIREMENTS.md`.

- [ ] Foundation: theme tokens (contrast-checked), global layout (sticky header, footer, skip link, accessible mobile menu), typed API client with ID validation and normalisation
- [ ] Browse: responsive card grid, debounced name search, status/gender/species filter chips (exact-match species), URL-synced state, infinite scroll with "Load more" fallback, loading/empty/error states
- [ ] Card: front/back faces, status rarity frames, 3D tilt and holographic sheen, accessible flip, favourite toggle
- [ ] Home: animated portal with random character reveal, "Spin again" and "View details"
- [ ] Character detail: hero, card → detail View Transition (fade fallback), episode strip, "Also found at" residents row, 404 for invalid IDs
- [ ] Collection: favourites in `localStorage`, header counter, collection grid with animated removal, empty state
- [ ] Accessibility pass to WCAG 2.1 AA, including reduced-motion behaviour
- [ ] Light visual polish pass, then Vercel deploy with Lighthouse 90+ (Performance and Accessibility, desktop)

### Out of Scope

- Backend, database, authentication, user accounts, server-side favourites — the app is client-only by design
- Global leaderboards — requires a backend
- Show logo, title artwork, quotes or scripts — unofficial fan project, original branding only
- Three.js/WebGL — CSS and Motion are sufficient and keep performance high
- Internationalisation and analytics — not needed for v1
- "Guess who" silhouette mini-game and side-by-side card comparison — deferred to v2

## Context

- A fresh `create-next-app` scaffold exists in this repo; build on it, do not re-scaffold. Only the default pages and config exist today.
- `AGENTS.md` warns that this Next.js version has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before using `viewTransition`, `notFound()`, route params, metadata or `next/image` `remotePatterns`.
- `docs/SPEC.md` was reviewed for UX, accessibility and API edge cases against the live API. API behaviours that shape the design:
  - `species` and `name` filters are substring matches (`species=human` also returns Humanoid); `status` and `gender` are exact.
  - A non-numeric character ID returns HTTP 500; unknown or zero IDs return 404.
  - A 404 on page > 1 means "no more pages", not an error.
  - Multi-ID requests silently drop missing IDs; a single ID returns an object, not an array.
  - About 36% of characters have an empty origin URL; 32 of 126 locations have no residents.
  - Character IDs are contiguous (1–826), so a random ID in `1..info.count` is always valid.
  - Responses are immutable and CORS-open, so the client can call the API directly.
- Stack and research are decided; research was intentionally skipped.

## Constraints

- **Tech stack**: Next.js (App Router) + TypeScript, Tailwind CSS, TanStack Query, Motion (`motion/react`), browser View Transitions, `next/image`, Inter via `next/font`, Vercel hosting — decided in the spec
- **Dependencies**: No other libraries (including test libraries) without asking the user first
- **Timeline**: 2 days across 4 GSD phases (Foundation + Browse, Card effects + Portal, Detail + Collection, Light polish)
- **Accessibility**: WCAG 2.1 AA, with `prefers-reduced-motion` honoured everywhere
- **Performance**: Only animate `transform` and `opacity`; multi-ID requests instead of N+1 fetching; Lighthouse 90+ on desktop for Performance and Accessibility
- **Data**: `staleTime` of at least 1 hour and no refetch on window focus; never hardcode API counts
- **Branding**: Original wordmark "Portal Dex" only; no show assets or quotes
- **Manual step**: The Vercel deploy needs the user's Vercel account

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Skip domain research | Stack and scope are fully specified in `docs/SPEC.md` | — Pending |
| Build on the existing `create-next-app` scaffold | Spec instructs not to re-scaffold | — Pending |
| Species chips use exact client-side matching with a derived total | API `species=` is a substring match, so "Human" would include Humanoid | — Pending |
| Species chips: Human, Alien, Humanoid, Mythological Creature, Robot, Animal | Covers about 94% of characters; rarer species reachable via search | — Pending |
| Card → detail uses browser View Transitions, not Motion `layoutId`; fade fallback after ~30 minutes | Cross-route `layoutId` is unreliable; the fallback bounds the time risk | — Pending |
| Flip control is a sibling of the star and link, not their parent | Avoids nested interactive elements (a11y violation) | — Pending |
| "Guess who" and card comparison moved to v2 | Keeps v1 inside the 2-day window | — Pending |
| Add a light polish phase (Phase 4) | User asked for it; polish tuned inside the GSD loop instead of outside it | — Pending |
| Client-side API calls, no proxy | API is CORS-open and immutably cached | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-11 after initialization*
