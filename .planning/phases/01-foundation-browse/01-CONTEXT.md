# Phase 1: Foundation + Browse - Context

**Gathered:** 2026-11-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse, search and filter every character as cards in an accessible dark cosmic layout, with state that survives refresh and back navigation. Phase 1 delivers: theme tokens, layout (header, footer, skip link, mobile menu), typed API client, static card front, Browse grid with search, filters (exact-match species), infinite scroll, and loading/empty/error states. Flip, tilt, frame animation, favourites and the portal are Phase 2. The detail page and Collection are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Card component structure
- **D-01:** Build the final card structure now: wrapper, flip button as a **sibling** (never an ancestor) of the star and link slots, a front face, and a stub back face that is `inert`. Phase 2 only adds behaviour (flip, tilt, favourites), not markup rework. — **Reversibility:** costly — the Browse grid, skeleton cards and axe checks all depend on this markup.
- **D-02:** Until Phase 2 the flip button is rendered but **disabled** (not focusable, does nothing), so there are no dead keyboard stops. Phase 2 enables it.
- **D-03:** The favourite star is **hidden** in Phase 1 (its slot is reserved in the structure, nothing rendered). The favourites store (COL-01 to COL-03) stays in Phase 2. The header still shows "N collected" per FND-02.
- **D-04:** Status frame colours are in place as **static** borders: Alive teal `#6FF2D2`, Dead grey `#8A93A6`, unknown purple `#A66BFF`. No pulse, shimmer or desaturation animation yet (Phase 2, CARD-04). Only `transform` and `opacity` may animate.
- **D-05:** Beyond the spec'd front (avatar, two-line-clamped name, status badge with text, species) the user chose **not** to pull the focus-ring-on-every-frame work or the card accessible name into Phase 1. Phases 1 and 2 must still build to the A11Y constraints in ROADMAP.md (focus rings, 44 px targets, no nested interactive elements), but the full card label and ring verification land in Phase 2 (CARD-07).

### Filter bar layout
- **D-06:** Search and chips sit **static above the grid** (not sticky, not collapsible). They scroll away with the page, which fits the "scroll to top of grid on filter change" behaviour (BRW-10).
- **D-07:** Each chip group (Status, Gender, Species) is one **labelled, keyboard-reachable horizontal scroll row on mobile** that wraps on desktop (SPEC section 7, A11Y-05). One value per group, click an active chip to deselect.
- **D-08:** While the exact-Human total is being derived (second count-only request), the count line shows a **placeholder** ("Counting…" or a skeleton with reserved width), then the final number. The `aria-live` region must never announce a wrong interim value (e.g. `info.count` that includes Humanoid).

### Claude's Discretion
- Result count line and "Clear all" placement (user said "You decide"). Keep layout shift to a minimum: reserve the count line's height and avoid the "Clear all" button appearing and pushing content.
- **Browse state and scroll restore** was not selected for discussion. Claude decides how URL query, the infinite-query cache and scroll position combine for BRW-06 and BRW-11, following SPEC section 5.3 (typing uses `router.replace`, chips use `push`, cached infinite query for back navigation). Next 16 has `cacheComponents` on, so read the relevant guide in `node_modules/next/dist/docs/` first.
- Favourite star behaviour was decided (D-03), so no discretion there.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Scope and requirements
- `docs/SPEC.md` — Source of truth for scope. Sections 3 (data rules A1 to A8), 4 (layout), 5.2 (card), 5.3 (browse, species exact-match), 6 (tokens, contrast check X6), 7 (responsive), 8 (accessibility), 9 (performance).
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: FND-01 to FND-07, DATA-01 to DATA-03, DATA-05, BRW-01 to BRW-11, CARD-01, CARD-08, PERF-01.
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria and Scope Notes (DATA-04 and BRW-11 re-check land in Phase 3).
- `.planning/PROJECT.md` — Constraints (no extra libraries, only animate `transform`/`opacity`, `staleTime` of 1 hour or more, no hardcoded counts).

### Framework
- `AGENTS.md` — This Next.js (16.4.6) has breaking changes. Read the relevant guide in `node_modules/next/dist/docs/` before using route params, `notFound()`, metadata, `next/image` `remotePatterns` or `viewTransition`.
- `node_modules/next/dist/docs/` — Authoritative Next.js docs for this version (`01-app`, `03-architecture`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None. The repo is a bare `create-next-app` scaffold: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.

### Established Patterns
- `app/layout.tsx` uses Geist and Geist Mono via `next/font/google`. The spec requires **Inter** via `next/font`, so this is replaced.
- `app/globals.css` uses Tailwind 4 (`@import "tailwindcss"`, `@theme inline`) with a light/dark `prefers-color-scheme` palette. It is replaced by the spec's dark-only token set.
- `next.config.ts` already enables `cacheComponents`, `partialPrefetching`, `experimental.agentFeedback` and a Turbopack Tailwind loader rule. `images.remotePatterns` is not yet configured (PERF-01).
- Dependencies are only `next`, `react`, `react-dom` and Tailwind. TanStack Query and Motion are **not installed yet** and are in the approved stack. No test library without asking the user.

### Integration Points
- A TanStack Query provider must wrap the app in `app/layout.tsx`.
- `/browse` is a new route. Header, footer, skip link and mobile menu live in the root layout.
- Focus-to-`h1` on client navigation (FND-06) needs a layout-level hook or component.

</code_context>

<specifics>
## Specific Ideas

No specific requirements beyond `docs/SPEC.md`. The user wants the card markup to be final from Phase 1 so Phase 2 does not restructure it.

</specifics>

<deferred>
## Deferred Ideas

None. Discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Foundation + Browse*
*Context gathered: 2026-11-11*
