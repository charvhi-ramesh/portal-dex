# Walking Skeleton — Portal Dex

**Phase:** 1
**Generated:** 2026-11-11

## Capability Proven End-to-End

A visitor runs the production build locally (`npm run build`, then `next start`), opens `/browse` inside the dark Portal Dex shell, sees real characters fetched in the browser from the Rick and Morty API through TanStack Query and the typed client, presses the Status "Alive" chip, and sees the filter written to the URL (`/browse?status=Alive`) by a history push, the list refetched, and the filter kept after a refresh.

Proven by: plan 01-01 (typed client, live read under `npm test`), plan 01-02 (shell, contrast gate, `scripts/smoke.ts` serving the build), plan 01-03 (read path Task 1, URL-write path Task 2). The in-browser render and the Back behaviour are confirmed by the user in the plan 01-05 spike checkpoint.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16.4.6 App Router with `cacheComponents` on (already in the scaffold); pages are static server components holding the `h1` and metadata, with client islands inside `<Suspense>` | Cache Components prerenders a static shell; `useSearchParams` must sit inside Suspense or `next build` fails (reproduced in research); the `h1` stays outside Suspense so focus-on-navigation works immediately |
| Data layer | No database. Public REST API `https://rickandmortyapi.com/api` read directly from the browser (CORS `*`) through a typed fetch client in `lib/api/*`; TanStack Query v5 (exact pinned version) caches with `staleTime` 1 h, `gcTime` 2 h, `networkMode: "always"`, no focus or reconnect refetch, retry once for network and 5xx only | SPEC A10 forbids a proxy; data is effectively static; gcTime above staleTime keeps Back navigation and revisits free; "always" makes offline failures visible |
| Request policy | One infinite-query page is a "load step" that reads API pages until 20 exact-species matches, end of data, or a 4-page cap; multi-ID requests everywhere; AbortSignal on every request | Exact species is a client-side correction of the API's substring filter; the cap bounds bursts below the observed Cloudflare 429 threshold |
| URL state | URL query is the source of truth for `q`, `status`, `gender`, `species`, parsed through case-sensitive allow-lists; writes go through one seam (`useBrowseUrl`) using native `history.pushState` (chips, Clear all) and `replaceState` (typing) | Planning decision 3; Next 16 integrates the native History API with `useSearchParams`; the router fallback is a one-file change chosen by the plan 01-05 spike |
| Auth | None | Out of scope by design (no accounts, no backend) |
| Persistence | None in Phase 1. Favourites (`localStorage` key `portal-dex:favourites`) arrive in Phase 2 | D-03; header shows "0 collected" until then |
| Deployment target | Phase 1: local production run via `npm run build` + `node node_modules/next/dist/bin/next start`, exercised by `scripts/smoke.ts` (binds 127.0.0.1). Vercel deploy is a manual Phase 3 step needing the user's account | DEP-01 is Phase 3 and needs the user's Vercel account |
| Testing | `node --test` over `lib/**/*.test.ts` (Node 26 type stripping, no test library); `scripts/check-contrast.ts` gate; `tsc --noEmit`, `eslint` (jsx-a11y, react-hooks v7) and `next build` as static gates; UI behaviour verified by an end-of-phase manual checklist | Planning decision 3 and the project rule against new libraries; Playwright/axe are to be asked about at Phase 3 planning |
| Styling | Tailwind CSS 4 with dark-only `@theme` tokens in `app/globals.css` (`--color-*: initial` removes the default palette); one global teal `:focus-visible` ring; only `transform` and `opacity` animate; reduced motion honoured in CSS | FND-01, the motion contract and WCAG 2.1 AA |
| Fonts and images | Inter via `next/font/google` (self-hosted at build); `next/image` limited by `remotePatterns` to `https://rickandmortyapi.com/api/character/avatar/**` with no query | PERF-01 and no runtime third-party requests |
| Directory layout | `app/` routes (`/`, `/browse`, `/collection`, providers seam); `components/layout`, `components/browse`, `components/card`; `lib/**` pure TypeScript with relative `.ts`-suffixed imports and no React (node-testable); `scripts/` CLIs | Keeps all policy logic unit-testable without a test library; UI stays thin |

## Stack Touched in Phase 1

- [x] Project scaffold (framework, build, lint, test runner) — plans 01-01 (test script, tsconfig flags) and 01-02 (shell, smoke runner, contrast gate)
- [x] Routing — at least one real route: `/browse` (01-03), plus interim `/` and `/collection` (01-02)
- [x] Database — no database exists; the equivalent "one real read and one real write" is a live Rick and Morty API read (01-01 live read, 01-03 in-app read) and a real URL-state write with a history push (01-03 Task 2)
- [x] UI — at least one interactive element wired to the API: the Status chip writes the URL and refetches (01-03 Task 2)
- [x] Deployment — documented local full-stack run: `npm run build` then `node scripts/smoke.ts route:/browse "Browse characters"` (or `node node_modules/next/dist/bin/next start`)

## Out of Scope (Deferred to Later Slices)

- Card flip, tilt, holographic sheen, frame pulse and shimmer, favourite star and favourites store (Phase 2)
- Home portal and random reveal; Motion (`motion/react`) is not installed in Phase 1 (Phase 2)
- Character detail page, View Transitions morph, episode strip, residents row, route-ID validation in a page (DATA-04), portal-themed 404 (Phase 3)
- Collection page content (Phase 3); the Phase 1 `/collection` and `/` pages are interim pages with an h1 only
- Accessibility audit with axe and Lighthouse, Vercel deploy (Phase 3); polish (Phase 4)
- Any browser test automation (ask the user at Phase 3 planning)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its architectural decisions:

- Phase 2: cards come alive (flip, tilt, rarity frames, favourites with the live header counter) and the home portal reveals a random character
- Phase 3: character detail with the card morph, the Collection page, the 404, the accessibility pass and the Vercel deploy
- Phase 4: light polish of timing, glow, spacing and copy with no new features
