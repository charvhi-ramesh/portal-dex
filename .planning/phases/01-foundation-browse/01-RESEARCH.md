# Phase 1: Foundation + Browse - Research

**Researched:** 2026-11-11
**Domain:** Next.js 16.4.6 App Router (Cache Components on) + React 19.3 + Tailwind 4.3.3 + TanStack Query v5 client-side data app against the public Rick and Morty REST API
**Confidence:** HIGH on API behaviour, Next 16 constraints and test tooling (all verified this session). MEDIUM on scroll restoration and hidden-route behaviour (documented but not runtime-verified, so Wave 0 includes a spike).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Build the final card structure now: wrapper, flip button as a **sibling** (never an ancestor) of the star and link slots, a front face, and a stub back face that is `inert`. Phase 2 only adds behaviour (flip, tilt, favourites), not markup rework. — **Reversibility:** costly — the Browse grid, skeleton cards and axe checks all depend on this markup.
- **D-02:** Until Phase 2 the flip button is rendered but **disabled** (not focusable, does nothing), so there are no dead keyboard stops. Phase 2 enables it.
- **D-03:** The favourite star is **hidden** in Phase 1 (its slot is reserved in the structure, nothing rendered). The favourites store (COL-01 to COL-03) stays in Phase 2. The header still shows "N collected" per FND-02.
- **D-04:** Status frame colours are in place as **static** borders: Alive teal `#6FF2D2`, Dead grey `#8A93A6`, unknown purple `#A66BFF`. No pulse, shimmer or desaturation animation yet (Phase 2, CARD-04). Only `transform` and `opacity` may animate.
- **D-05:** Beyond the spec'd front (avatar, two-line-clamped name, status badge with text, species) the user chose **not** to pull the focus-ring-on-every-frame work or the card accessible name into Phase 1. Phases 1 and 2 must still build to the A11Y constraints in ROADMAP.md (focus rings, 44 px targets, no nested interactive elements), but the full card label and ring verification land in Phase 2 (CARD-07).
- **D-06:** Search and chips sit **static above the grid** (not sticky, not collapsible). They scroll away with the page, which fits the "scroll to top of grid on filter change" behaviour (BRW-10).
- **D-07:** Each chip group (Status, Gender, Species) is one **labelled, keyboard-reachable horizontal scroll row on mobile** that wraps on desktop (SPEC section 7, A11Y-05). One value per group, click an active chip to deselect.
- **D-08:** While the exact-Human total is being derived (second count-only request), the count line shows a **placeholder** ("Counting…" or a skeleton with reserved width), then the final number. The `aria-live` region must never announce a wrong interim value (e.g. `info.count` that includes Humanoid).

### Claude's Discretion
- Result count line and "Clear all" placement (user said "You decide"). Keep layout shift to a minimum: reserve the count line's height and avoid the "Clear all" button appearing and pushing content.
- **Browse state and scroll restore** was not selected for discussion. Claude decides how URL query, the infinite-query cache and scroll position combine for BRW-06 and BRW-11, following SPEC section 5.3 (typing uses `router.replace`, chips use `push`, cached infinite query for back navigation). Next 16 has `cacheComponents` on, so read the relevant guide in `node_modules/next/dist/docs/` first.
- Favourite star behaviour was decided (D-03), so no discretion there.

### Deferred Ideas (OUT OF SCOPE)
None. Discussion stayed within phase scope. (Flip, tilt, frame animation, favourites and the portal are Phase 2; detail page and Collection are Phase 3.)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FND-01 | Dark tokens, Inter, contrast gate | Tokens in `@theme`; contrast recomputed here (all UI-SPEC pairs pass; star-dot alpha does NOT, see Pitfall 9); `scripts/check-contrast.ts` gate; Inter variable via `next/font/google` |
| FND-02 | Sticky header, nav, "N collected" | Header pattern; placeholder `/` and `/collection` routes (Open Question 1) |
| FND-03 | Footer with API link + disclaimer | Static server component; `rel="noopener noreferrer"` |
| FND-04 | Mobile menu (Escape/outside/route change, trap, return focus) | Imperative `inert` on page wrapper + keydown trap; Activity cleanup behaviour |
| FND-05 | Skip link, no focus under sticky header | `scroll-padding-top: 80px` (Next docs cite this exact fix); skip link first in DOM |
| FND-06 | Focus to `h1` + title on client nav | `RouteFocus` keyed on `usePathname()` only; `title.template` metadata |
| FND-07 | Star-field drift / static under reduced motion | CSS-only transform keyframes; painting-order and contrast caveats |
| DATA-01 | Typed API client | `lib/api/*` design, verified response shapes |
| DATA-02 | Multi-ID normalisation, missing IDs tolerated | Verified: `[]` on all-missing, array on partial, object on single ID |
| DATA-03 | 404 page 1 = empty, 404 page >1 = end | Verified live 404 bodies; fill-loop handles both |
| DATA-05 | staleTime >= 1h, no focus refetch, AbortSignal | QueryClient defaults incl. `gcTime`, `networkMode`, `retry`; no Suspense hooks (cancellation unsupported) |
| BRW-01 | Responsive grid 2/3/4/5 | Tailwind breakpoints; UI-SPEC breakpoints |
| BRW-02 | 300 ms debounce, clear, Escape | Draft/URL sync pattern compatible with `react-hooks` lint rules |
| BRW-03 | Status/gender/species chips | Allow-list URL parsing |
| BRW-04 | Exact species + derived total | Verified: Human 434 - Humanoid 68 = 366 = exact count; fill-loop design |
| BRW-05 | Clear all | Single `pushState` that drops all params |
| BRW-06 | URL state (typing replace, chip push) | Native History API integration documented in Next 16 (Pattern 2) |
| BRW-07 | `aria-live` count | Imperative live region, settled values only |
| BRW-08 | Infinite scroll + Load more, no dupes, announcement | IO re-registration pitfall; focus rules; dedupe by id |
| BRW-09 | Skeleton / empty / error (+offline) | `networkMode: 'always'`, `isFetchNextPageError`, `useSyncExternalStore` for `navigator.onLine` |
| BRW-10 | Reset to page 1 + scroll to grid top | Query key change; conditional scroll in handler |
| BRW-11 | Back restores filters, pages, scroll | Activity route preservation + query cache with `gcTime` > staleTime + spike |
| CARD-01 | Card front (star hidden per D-03) | Final markup per UI-SPEC |
| CARD-08 | Avatar placeholder + fallback tile | `next/image` onLoad/onError, hydration-race guard |
| PERF-01 | `next/image` remotePatterns, sizes, lazy | Config values quoted from SPEC section 9; Next 16 `preload` replaces `priority` |
</phase_requirements>

## Summary

This phase is a greenfield build on a bare `create-next-app` scaffold. The stack is fixed (Next 16.4.6, React 19.3.0, Tailwind 4.3.3, TanStack Query v5, Inter via `next/font`), so the research effort went into the places where this specific combination bites: **Cache Components** (route state is preserved with React `<Activity>`, `useSearchParams` must sit inside `<Suspense>` or the build fails, which I reproduced), **eslint-config-next 16** (the new `react-hooks` v7 rules `set-state-in-effect`, `refs`, `purity` and `immutability` are all at error level), **TanStack Query defaults** that silently break requirements (default `networkMode: 'online'` pauses queries offline so the offline error state would never show; default `gcTime` of 5 minutes defeats BRW-11 and "revisiting a recent query does not refetch"; Suspense hooks do not support `AbortSignal` cancellation), and the **live API**, which I probed directly.

The API probe produced facts the plan can rely on: Human 434 minus Humanoid 68 gives 366, which equals the exact-Human count across all 826 characters; exact-Human yields per `species=human` page range 10 to 20 (so the spec's "auto-request next page when a page yields fewer than 20" would chain through all 22 pages if implemented naively, see Pattern 3); a 404 body is `{"error":"There is nothing here"}`; multi-ID returns arrays, `[]` when all IDs are missing, and a single object for one ID; and Cloudflare returned **HTTP 429 with an HTML body** after roughly 30 rapid requests, so the client must check `res.ok` before `res.json()`.

No test library is allowed. Node 26.13 runs `.ts` test files natively with `node --test` (type stripping, verified), so all pure logic (API client, URL-state parsing, species/total derivation, announcement text, contrast gate, query defaults, `next.config.ts` values) can be unit-tested with zero new dependencies if it lives in `lib/**` with relative `.ts`-suffixed imports. UI behaviour (focus, menu trap, scroll restore, offline) has no zero-dependency automation and goes to a manual checklist at the end-of-phase human-verify checkpoint, as `config.json` (`human_verify_mode: "end-of-phase"`) already expects.

**Primary recommendation:** Install only `@tanstack/react-query` (Motion is Phase 2), keep all logic in `lib/**` as pure `.ts` modules with relative `.ts` imports so `node --test` covers it, drive Browse from URL → typed `Filters` → one `useInfiniteQuery` whose `queryFn` is a "load step" that fetches API pages until it has 20 exact-species items, update the URL with native `history.pushState/replaceState`, and run a short Wave 0 spike to confirm Back restores scroll under Activity before building the fallback.

## Project Constraints (from CLAUDE.md)

- Stack is fixed: Next.js App Router + TypeScript, Tailwind CSS, TanStack Query, Motion (`motion/react`), browser View Transitions, `next/image`, Inter via `next/font`, Vercel. **No other libraries, including test libraries, without asking the user first.**
- Only animate `transform` and `opacity`; multi-ID requests instead of N+1; Lighthouse 90+ desktop for Performance and Accessibility; WCAG 2.1 AA with `prefers-reduced-motion` honoured everywhere.
- Data: `staleTime` of at least 1 hour, no refetch on window focus, never hardcode API counts.
- Branding: original wordmark "Portal Dex" only; no show assets or quotes.
- GSD workflow enforcement: file edits go through a GSD command (planning/execution); do not edit outside a workflow.
- `AGENTS.md` (verified present): "This version has breaking changes … Read the relevant guide in `node_modules/next/dist/docs/` … before writing any code." This research read the guides listed under Sources.
- Orchestrator instruction for this run: do not commit; include a Validation Architecture section; respect the no-new-libraries rule for test tooling.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Static shell (header, footer, skip link, `h1`, metadata, Suspense fallbacks) | Frontend Server (prerendered static shell) | CDN / Static | Cache Components prerenders the shell; nothing here reads request data |
| Character list, search, filters, pagination | Browser / Client | External API (CORS `*`) | Spec: fetch directly from client, no proxy (A10); TanStack Query owns the cache |
| URL ↔ filter state | Browser / Client | — | `useSearchParams` + native History API; no server involvement |
| Exact-species filtering and derived total | Browser / Client | — | API only does substring matching, so correction must happen client-side |
| Avatar delivery | CDN / Static (`next/image` optimizer) | Browser | `remotePatterns` allow-list restricts what the optimizer will fetch |
| Focus management, mobile menu, live region | Browser / Client | — | Pure DOM/ARIA behaviour |
| Scroll restoration | Browser / Client | Frontend Server (Activity route retention) | Next retains up to 3 hidden routes; query cache is the fallback |
| Favourites counter | Browser / Client | — | Phase 1 renders static "0 collected"; store arrives in Phase 2 |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.4.6 (installed) | App Router, `next/image`, `next/font`, metadata | Locked by scaffold `[VERIFIED: package.json]` |
| react / react-dom | 19.3.0 (installed) | UI; `inert` attribute typed in `@types/react` 19.3.0 | Locked by scaffold `[VERIFIED: package.json]` |
| tailwindcss + @tailwindcss/turbopack | 4.3.3 (installed) | CSS-first tokens via `@theme`, `motion-reduce:` variants, `line-clamp-*` | Locked; loader rule already in `next.config.ts` |
| @tanstack/react-query | 5.107.1 (latest, published 2026-11-06) | `useInfiniteQuery`, `useQuery`, cache with `staleTime`/`gcTime` | In approved stack; Next 16 docs ship an official TanStack Query guide `[VERIFIED: npm view]` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `node:test` + `node:assert` (built in) | Node 26.13.0 | Unit tests for pure `lib/**` logic | All automated tests this phase; no install `[VERIFIED: ran a .ts test this session]` |
| eslint + eslint-config-next | 9.x / 16.4.6 (installed) | Lint incl. `jsx-a11y` and `react-hooks` v7 | `npm run lint` per wave `[VERIFIED: eslint --print-config]` |
| typescript | 5.9.3 (installed) | `tsc --noEmit`; supports `allowImportingTsExtensions` | Typecheck gate `[VERIFIED: node_modules/typescript/package.json]` |

Motion (`motion/react`) is in the approved stack but **not needed in Phase 1**: UI-SPEC specifies CSS-only motion (menu transition, skeleton opacity, star drift, press scale). Do not install it until Phase 2.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `node --test` | Vitest / Jest / Playwright | Better component and E2E tests, but each is a new library: **requires asking the user** (Open Question 3) |
| `router.push/replace` | native `history.pushState/replaceState` | Spec text says router; Next 16 documents the native API as integrated with `useSearchParams`, with no RSC round trip. Recommended (Claude's discretion area) |
| transitive `axe-core` 4.14.0 (installed via eslint-plugin-jsx-a11y) | declare `@axe-core/*` / `axe-core` as devDependency | Declaring it is a new dependency → ask the user; relying on the transitive copy is fragile |

**Installation:**
```bash
npm install --save-exact @tanstack/react-query@5.107.1
```
**Version verification:** `npm view @tanstack/react-query version` returned `5.107.1`; `time` shows publish `2026-11-06T23:04:47.891Z`; `dependencies` is only `@tanstack/query-core 5.107.1`; `peerDependencies` are `react ^18 || ^19`; no `postinstall` script `[VERIFIED: npm registry]`.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----|-------------|---------|-------------|
| @tanstack/react-query | npm | package is years old; **latest version published 5 days ago** | ~84.0M/wk | github.com/TanStack/query | SUS (sole reason: `too-new`, the latest release is under the seam's minimum age) | Flagged: planner must add a `checkpoint:human-verify` before install |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** `@tanstack/react-query` [WARNING: flagged as suspicious — verify before using.] The flag comes from release freshness, not from the name: the package has 84M weekly downloads, a TanStack GitHub source repo, no `postinstall`, is named in CLAUDE.md and SPEC section 2 as the decided stack, and is documented in `node_modules/next/dist/docs/01-app/02-guides/client-side-data-fetching/tanstack-query.md`. The checkpoint should confirm the user accepts installing it and choose between exact `5.107.1` and an older patch (the seam cannot score version-qualified names: `@tanstack/react-query@5.105.3` came back `SLOP` purely from a parsing artefact, ignore that). Use `--save-exact` so the lockfile and `package.json` agree.

`motion` is not installed this phase, so it is not audited here. Also no `postinstall` script exists on the one package (`scripts.postinstall` is null in the seam signals).

## Architecture Patterns

### System Architecture Diagram

```
 Browser URL  /browse?q=rick&status=Alive&species=Human
      |
      v
 useSearchParams()  --(allow-list parse)-->  Filters {q,status,gender,species}
      |                                            |
      |  user input (typing / chip / Clear all)    |  filtersKey(filters)
      v                                            v
 SearchField (draft state, 300 ms debounce)   useInfiniteQuery(['characters','browse',key])
 FilterGroups (aria-pressed buttons)               |  queryFn = fetchBrowseStep(filters, startPage, signal)
      |                                            |      loop: GET /character?name&status&gender&species&page=N
      |  history.replaceState (typing)             |        404 & N=1  -> empty (count 0)
      |  history.pushState    (chips, Clear all)   |        404 & N>1  -> end of list
      +--> URL changes --> useSearchParams ------->|        keep exact-species items, stop at >=20 items
                                                   |        or no next page or step cap
   Species == Human?  useQuery(['count', humanoid  |
      same other filters]) -> info.count / 404=0   v
                                                pages[] of BrowseStep {items,count,nextPage}
      |                                            |
      v                                            v
 total = (Human ? humanCount - humanoidCount : count)   flatten + dedupe by id
      |                                            |
      v                                            v
 Count line ("Counting..." until final)        CharacterGrid <ul> of CharacterCard (next/image avatars)
 Live region (settled text only)               + skeleton rows / empty panel / error panel / Load more
                                               + IntersectionObserver sentinel (re-registered per page)
 Back/forward --> popstate --> useSearchParams --> same cache hit (staleTime 1h, gcTime > staleTime)
 Navigate away --> Next hides /browse in <Activity> (up to 3 routes) --> DOM + scroll preserved
```

### Recommended Project Structure
```
app/
├── layout.tsx              # Inter, Providers, StarField, SkipLink, Header, RouteFocus, <main id="main-content" tabIndex={-1}>, Footer
├── globals.css             # @theme tokens, focus ring, keyframes (star drift, skeleton), color-scheme: dark
├── providers.tsx           # 'use client' QueryClientProvider (Next docs pattern)
├── page.tsx                # PLACEHOLDER home (Phase 2 replaces)
├── collection/page.tsx     # PLACEHOLDER (Phase 3 replaces)
└── browse/
    ├── page.tsx            # static: metadata + <h1 tabIndex={-1}> + <Suspense fallback={<BrowseFallback/>}><BrowseView/></Suspense>
    └── (client components live in components/browse)
components/
├── layout/   header.tsx, mobile-menu.tsx, footer.tsx, skip-link.tsx, star-field.tsx, route-focus.tsx
├── browse/   browse-view.tsx, search-field.tsx, filter-group.tsx, results-toolbar.tsx, character-grid.tsx,
│             load-more.tsx, empty-panel.tsx, error-panel.tsx, live-region.tsx
└── card/     character-card.tsx, card-avatar.tsx, card-skeleton.tsx
lib/                        # PURE modules: relative imports WITH .ts suffix, no '@/' alias, no React, so node --test can run them
├── api/      types.ts, client.ts, ids.ts, normalize.ts, characters.ts, episodes.ts, locations.ts (+ *.test.ts)
├── browse/   filters.ts, species.ts, steps.ts, announce.ts (+ *.test.ts)
└── query/    client.ts (makeQueryClient + defaults), options.ts (queryOptions factories) (+ *.test.ts)
scripts/
└── check-contrast.ts       # FND-01 / X6 gate, run with `node scripts/check-contrast.ts`
```

### Pattern 1: Cache Components + `useSearchParams`
**What:** The page file is a static server component holding the `h1` and metadata; the client `BrowseView` that calls `useSearchParams()` is wrapped in `<Suspense>` with a skeleton fallback.
**Why:** Without the Suspense wrapper `next build` fails. Reproduced this session in a throwaway copy:
```
Error: Route "/browse": Next.js encountered URL data `useSearchParams()` in a Client Component outside of `<Suspense>`.
This blocks prerendering because the value is only available at runtime.
```
`next dev` hides this (docs: "In development, routes are rendered on-demand, so `useSearchParams` doesn't suspend") so **`npm run build` is the real check**. Keep the `h1` outside the Suspense boundary so FND-06 can focus it immediately.
```tsx
// Source: verified by building a spike with this shape on Next 16.4.6; docs 01-app/03-api-reference/04-functions/use-search-params.md
import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowseView } from "@/components/browse/browse-view";
import { BrowseFallback } from "@/components/browse/browse-fallback";

export const metadata: Metadata = { title: "Browse" }; // root layout title.template renders "Browse · Portal Dex"

export default function BrowsePage() {
  return (
    <>
      <h1 tabIndex={-1} className="outline-none ...">Browse characters</h1>
      <Suspense fallback={<BrowseFallback />}>
        <BrowseView />
      </Suspense>
    </>
  );
}
```
Root layout: `title: { default: "Portal Dex", template: "%s · Portal Dex" }` (a `default` is required when a template is set, and the template applies to child segments only `[CITED: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md lines 241-285]`).

### Pattern 2: URL state with the native History API (Claude's discretion, recommended)
Next 16 documents that `window.history.pushState/replaceState` calls are integrated into the router so `useSearchParams` re-renders `[CITED: node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md "Native History API"]`. This gives the spec's semantics (typing replaces, chips push) with no RSC request per keystroke and no scroll side effects (so no `{ scroll: false }` needed). Keep `router.push/replace` only if the Wave 0 spike shows popstate/Back misbehaves.
```ts
// lib/browse/filters.ts (pure, testable)
export const STATUSES = ["Alive", "Dead", "unknown"] as const;
export const GENDERS = ["Female", "Male", "Genderless", "unknown"] as const;
export const SPECIES = ["Human", "Alien", "Humanoid", "Mythological Creature", "Robot", "Animal"] as const;
export type Filters = { q: string; status: Status | null; gender: Gender | null; species: Species | null };
// parse: take first value, trim, q.slice(0, 60); accept status/gender/species ONLY if in the allow-list (case-sensitive match
// against the canonical API value), otherwise treat as null. Never forward raw URL text to the API except q (URLSearchParams-encoded).
// serialize: omit nulls/empty q; stable key order q,status,gender,species.
```
```tsx
// in handlers (not effects): chip click and Clear all
window.history.pushState(null, "", url);      // adds history entry
// debounced typing commit
window.history.replaceState(null, "", url);   // no history spam
```
Build the URL from `window.location.pathname` + serialized filters; for "no filters" use the bare `/browse` path (no trailing `?`).

### Pattern 3: One infinite-query page = one "load step" (resolves the spec's short-page rule)
**Problem:** SPEC 5.3 says to auto-request the next page when a page yields fewer than 20 exact matches. Live data shows exact-Human yields per API page of `18,18,17,19,19,16,16,17,20,18,13,12,18,20,18,18,20,13,10,17,16,13` (22 pages), so almost every page is "short" and a naive trigger fetches all 22 pages back-to-back (and risks the 429 below).
**Recommendation `[ASSUMED]` (interpretation of the spec, confirm with user if desired):** make each TanStack "page" a *load step* whose `queryFn` fetches API pages sequentially until it has accumulated at least 20 exact items, the API has no next page, or a step cap (4 API pages) is hit. `pageParam` is the next API page number. This keeps `fetchNextPage`, "Load more", the IntersectionObserver and "n more characters loaded" all one-step-at-a-time, passes the same `AbortSignal` to every sub-request, and bounds request bursts.
```ts
// lib/browse/steps.ts (pure; fetchPage injected so node --test can stub it)
export const STEP_TARGET = 20;
export const STEP_MAX_API_PAGES = 4;
export type BrowseStep = { items: Character[]; count: number; nextPage: number | undefined };
export async function fetchBrowseStep(
  filters: Filters,
  startPage: number,
  fetchPage: (f: Filters, page: number, signal: AbortSignal) => Promise<CharacterPage | null>, // null = HTTP 404
  signal: AbortSignal,
): Promise<BrowseStep> {
  const items: Character[] = [];
  let page = startPage, count = 0, calls = 0;
  for (;;) {
    const res = await fetchPage(filters, page, signal);
    if (res === null) {                                   // DATA-03
      if (page === 1) return { items: [], count: 0, nextPage: undefined }; // empty state
      return { items, count, nextPage: undefined };       // end of list
    }
    count = res.info.count;
    items.push(...exactSpecies(res.results, filters.species));
    calls += 1;
    const next = res.info.next ? page + 1 : undefined;
    if (next === undefined || items.length >= STEP_TARGET || calls >= STEP_MAX_API_PAGES) {
      return { items, count, nextPage: next };
    }
    page = next;
  }
}
```
`exactSpecies(results, species)` returns `results` unchanged when `species` is null, otherwise `results.filter(c => c.species === species)` (case-sensitive; API values are canonical). Applying it to every chip (not only Human) is harmless: verified that Alien, Humanoid, Mythological Creature, Robot and Animal each substring-match only themselves in the full dataset.
```ts
// lib/query/options.ts
import { infiniteQueryOptions } from "@tanstack/react-query"; // [CITED: tanstack.com/query/latest/docs/framework/react/reference/infiniteQueryOptions]
export const browseOptions = (filters: Filters) =>
  infiniteQueryOptions({
    queryKey: ["characters", "browse", filtersKey(filters)] as const,
    queryFn: ({ pageParam, signal }) => fetchBrowseStep(filters, pageParam, fetchCharacterPage, signal),
    initialPageParam: 1,
    getNextPageParam: (last) => last.nextPage,   // undefined => hasNextPage false (documented)
  });
```
Use `useInfiniteQuery` (not `useSuspenseInfiniteQuery`): the Suspense variants do **not** support cancellation `[CITED: tanstack.com query-cancellation "Cancellation does not work with the Suspense hooks"]`, which DATA-05 requires, and inline skeleton/empty/error states plus never-remounted chips (UI-SPEC) are easier with the non-Suspense hook.

### Pattern 4: Derived total and the count line
- Non-Human (or no species): `total = pages[0].count` (`info.count` from page 1; identical on every page).
- Human: `total = pages[0].count − humanoidCount`, where `humanoidCount` comes from `useQuery({ queryKey: ["characters","count",{...filters, species:"Humanoid"}], enabled: filters.species === "Human" && pages[0] settled, queryFn: page-1 fetch → info.count, 404 → 0 })`. The first-page `info.count` already is `count(species=human)` so only **one** extra request is needed. Verified identities against the live API: unfiltered 434 − 68 = 366 = exact Human; Human+Female 80 − 7 = 73 = exact (computed from all 826 records).
- If page 1 is a 404 the result is the empty state and no count request is made. If the humanoid count 404s it is 0.
- Display: show "Counting…" in the reserved-width slot while page 1 or (Human) the humanoid count is pending; the live region is written only once `total` is final (D-08). Use `Intl.NumberFormat("en")` (verified requirement in UI-SPEC).

### Pattern 5: QueryClient defaults (DATA-05)
```ts
// lib/query/client.ts (no 'use client', no React; node-testable)
import { QueryClient } from "@tanstack/react-query";
export const ONE_HOUR = 60 * 60 * 1000;
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ONE_HOUR,               // >= 1 h (DATA-05)
        gcTime: 2 * ONE_HOUR,              // default is 5 min [CITED: important-defaults]; must outlive staleTime or BRW-11 cache dies
        refetchOnWindowFocus: false,       // DATA-05
        refetchOnReconnect: false,
        networkMode: "always",             // default "online" PAUSES offline queries instead of erroring [CITED: network-mode]
        retry: (failureCount, error) => failureCount < 1 && isRetryable(error), // default is 3 with backoff => ~7 s before an error shows
      },
    },
  });
}
```
Browser singleton per the Next docs pattern (`typeof window === "undefined" ? new QueryClient() : (browserQueryClient ??= new QueryClient())`) `[CITED: node_modules/next/dist/docs/01-app/02-guides/client-side-data-fetching/tanstack-query.md]`. `isRetryable`: retry network errors and 5xx once, never 4xx (including 429).

### Pattern 6: Scroll restoration (BRW-11) with Activity
With `cacheComponents` Next keeps up to 3 previously visited routes mounted but hidden (`display: none`) via `<Activity>`, preserving React state, DOM state and, per the docs, scroll position `[CITED: node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md and migrating-to-cache-components.md "scroll position … no longer reset"]`. Effects clean up when hidden and re-run when shown. Layered strategy:
1. **Primary (zero code):** Activity retention. `/browse` keeps its `useInfiniteQuery` state, pages and DOM when the user visits `/collection` or `/` and returns.
2. **Fallback for eviction (>3 routes):** the query cache (`gcTime` 2 h) returns every loaded page synchronously on remount, so pages and filters survive; scroll offset does not. Add a tiny `useScrollMemory(key)` hook only if the Wave 0 spike shows Back does not restore scroll: record `window.scrollY` per `location.pathname + location.search` in a module-level `Map` from a passive rAF-throttled scroll listener (listener is torn down while hidden), and restore it in `useLayoutEffect` when the grid has rendered cached rows. Do **not** rely on a `useLayoutEffect` cleanup to read `scrollY`, because Next may already have scrolled the new route to top.
3. UI-SPEC already makes skeleton and card heights identical, which is what makes restore-by-offset safe.
Because Browse must be re-checkable in Phase 1 (the detail route is Phase 3), the planner needs the placeholder routes from Open Question 1 so the Browse → other route → Back round trip is testable now.

### Pattern 7: Imperative live region
One always-mounted visually hidden `<div aria-live="polite" aria-atomic="true">` per UI-SPEC. Write it through a ref (`el.textContent = ""`, then set the text after ~100 ms) from a timer started after the data settles. Reasons: identical consecutive strings ("20 more characters loaded" twice) do not re-announce unless the node's text actually changes, and writing through a ref avoids `react-hooks/set-state-in-effect` and extra renders. Compose strings in pure `lib/browse/announce.ts` (`"{N} characters"`, `"1 character"`, `"{n} more characters loaded"` with n = items actually added, `"No characters in this dimension"`) so they are unit-testable.

### Anti-Patterns to Avoid
- **`useSuspenseQuery` / `useSuspenseInfiniteQuery` for Browse:** no cancellation, and Suspense re-fallbacks would remount chips.
- **`router.push/replace` per keystroke-commit:** triggers router work for a purely client-side filter change (use native History API).
- **Writing the URL on every keystroke:** only the debounced commit writes it.
- **Keying `RouteFocus` on `useSearchParams`:** typing and chips would steal focus to the `h1`. Key on `usePathname()` only, skip the first run, use `focus({ preventScroll: true })` so Back does not fight scroll restoration.
- **Reading/writing `ref.current` during render or `setState` synchronously in effects:** lint errors in this repo (Pitfall 1).
- **`position: sticky` filter bar:** D-06 forbids it.
- **Animating anything except `transform`/`opacity`** (including `box-shadow` and colour): UI-SPEC motion contract.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Request cancellation / dedupe / stale supersession | Manual `AbortController` map and request tracking | TanStack Query `signal` passed to `fetch`, one query key per filter set | A cancelled query reverts to its previous state; keys guarantee a superseded search never overwrites newer results `[CITED: query-cancellation]` |
| Cache lifetime, revisit-without-refetch | A custom page cache | `staleTime` + `gcTime` defaults | BRW-11 and "revisiting a recent query does not refetch" |
| Contrast computation | Eyeballed hex pairs | `scripts/check-contrast.ts` using the WCAG luminance formula (about 15 lines, ran it this session) | FND-01 / X6 requires a verified gate; reproducible in CI |
| Pure-logic test runner | A custom harness | `node --test` | Built in, runs `.ts` directly |
| Focus ring, tokens | Per-component outlines | One global `:focus-visible` rule in `globals.css` (UI-SPEC) | Consistency; A11Y-01 |
| Skeleton shimmer | JS-driven animation | CSS `opacity` keyframe (UI-SPEC) | Only `transform`/`opacity` may animate |
| Image optimisation | Own resizing | `next/image` with `remotePatterns` and `sizes` | PERF-01 |
| Debounce | A library | `setTimeout` in the event handler held in a ref | One use site; a ref written in a handler is allowed by the lint rule |

**Key insight:** every hard part of this phase is a *policy* problem (when to fetch, what to cache, what to announce), not a code-volume problem. Encode the policy once in pure functions and query defaults, then test those with `node --test`.

## Common Pitfalls

### Pitfall 1: `eslint-config-next` 16 turns React-compiler-style rules into errors
**What goes wrong:** `npm run lint` fails on patterns that used to be fine.
**Why:** `react-hooks` plugin 7.1.1 is active and `react-hooks/refs`, `react-hooks/set-state-in-effect`, `react-hooks/purity`, `react-hooks/immutability` and `react-hooks/set-state-in-render` are all severity 2 `[VERIFIED: npx eslint --print-config app/page.tsx]`.
**How to avoid:** derive state during render with the guarded "previous value in state" pattern (e.g. adopting an external `q` change into the search draft); use `useSyncExternalStore` for `matchMedia`, `navigator.onLine`, and reduced motion; write refs only in handlers/effects; do DOM work (live region, `inert`, scrolling) imperatively in handlers or effects without calling `setState` synchronously.
**Warning signs:** lint errors mentioning "Calling setState synchronously within an effect" or "Cannot access refs during render".

### Pitfall 2: Offline never shows an error (BRW-09)
**What goes wrong:** With the default `networkMode: "online"` an offline query does not error; it sits at `pending` with `fetchStatus: "paused"` `[CITED: network-mode]`, so the "You appear to be offline" panel never renders.
**How to avoid:** set `networkMode: "always"` so the fetch really attempts and rejects; choose offline wording from `navigator.onLine === false` read through `useSyncExternalStore` (`online`/`offline` events). The flag can lag real connectivity (UI-SPEC backstop).

### Pitfall 3: `gcTime` default (5 min) breaks BRW-11 and "no refetch on revisit"
**How to avoid:** `gcTime` greater than `staleTime` (Pattern 5). Test: Browse, visit another route for over 5 minutes, return, confirm no network requests.

### Pitfall 4: Cloudflare 429 returns HTML, not JSON
**What goes wrong:** `res.json()` throws `SyntaxError: Unexpected token '<'` and surfaces as a confusing error. Observed this session: a tight loop of about 30 requests received `HTTP 429` with a `<!doctype html>` body `[VERIFIED: live probe 2026-11-11]`.
**How to avoid:** check `res.ok` before parsing; map non-OK (other than the 404 rules) to `ApiError("http", status)`; never retry 4xx; the step cap in Pattern 3 and the debounce keep real usage far below the limit. Do not write test scripts that hammer the API (throttle at least 400 ms between calls).

### Pitfall 5: IntersectionObserver stalls on tall viewports
**What goes wrong:** the observer fires only when intersection *changes*. If the sentinel is still inside the 400 px `rootMargin` after a page loads, no new callback fires and loading stops (common on large monitors and with Human's short steps).
**How to avoid:** re-create the observer in an effect whose deps include `data.pages.length` and `isFetchingNextPage` (a fresh observer reports its initial state immediately); guard with `hasNextPage && !isFetchingNextPage && !isFetchNextPageError`; suspend auto-load while a next-page error shows (UI-SPEC). The "Load more" button remains the keyboard fallback.

### Pitfall 6: Next-page failure vs first-page failure
`isError` does not distinguish them. Use `isFetchNextPageError` ("Will be `true` if the query failed while fetching the next page" `[CITED: tanstack.com useInfiniteQuery reference]`) for the inline retry, and render the full error panel only when there is no data (`data === undefined`). Retry for page 1 is `refetch()`; for next page is `fetchNextPage()`.

### Pitfall 7: Avatar `onLoad` never fires if the image finished before hydration
Browse is client-rendered after data arrives so most images attach handlers in time, but Activity re-show and cache hits can complete instantly. Keep the `surface-raised` placeholder as the container background, hold the image at opacity 0 until `onLoad`, and also check `img.complete && img.naturalWidth > 0` in a ref callback so a finished image is never stuck at opacity 0. Handle `onError` by swapping to the fallback tile (also used for an empty `image` URL). Never add `loading="lazy"` to above-the-fold images; use eager for the first row and lazy for the rest; Next 16 uses `preload` instead of the deprecated `priority` `[CITED: image.md v16.0.0 row]`, but prefer `loading="eager"`/`fetchPriority="high"` for the first row per the docs' own advice.

### Pitfall 8: Typing in search scrolls the input out of view
Unconditionally scrolling the results toolbar into view after every debounced commit pushes the search field off-screen while the user is typing on mobile. **How to avoid (BRW-10):** in the commit handler, scroll only when the toolbar's top is above the sticky header (`getBoundingClientRect().top < 64`), with `scroll-margin-top: 80px` and `behavior: "auto"`. Do not scroll on popstate (Back/Forward) so it does not fight restoration.

### Pitfall 9: UI-SPEC star-dot opacity fails the contrast gate
UI-SPEC says dots at up to 35% opacity keep text "well above 4.5:1 (worst case about 9:1)". Recomputed this session: a `#C9D4FF` dot at 35% over `bg` composites to `#4d546d`, giving `text-muted` **3.57:1** and `blue` link text **2.85:1** (fails 4.5). `text` on the dot is 6.87. Muted/blue text sits directly on `bg` in the count line, group labels, "Counting…", end-of-list note, footer, and "Clear all". At 20% the values are 5.69 (muted) and 4.55 (blue); at 15% they are 6.51 and 5.20. **Recommendation:** cap dot opacity at 15% (20% maximum) in `globals.css` and make `check-contrast.ts` cover the composited dot colour. Note axe cannot evaluate text over gradient backgrounds and reports it as "needs review", so the script is the real gate. This is a deliberate deviation from the approved UI-SPEC value; surface it to the user in the plan.

### Pitfall 10: Star-field layer hidden behind the body background
A `position: fixed; z-index: -1` layer paints above the root (canvas) background but **below** non-positioned in-flow content backgrounds, including `body`'s own background if it does not propagate to the canvas. Put the page background on `html` (or `body` with nothing on `html` so it propagates), keep `body` transparent, and verify visually. `[ASSUMED: CSS painting order]` (standard behaviour, check in the browser).

### Pitfall 11: Node type stripping limits for tested modules
`node --test` strips types only; it cannot run enums, namespaces or **constructor parameter properties**. Write `class ApiError extends Error { kind: ...; status: ...; constructor(kind, status, msg) { super(msg); this.kind = kind; this.status = status; } }` rather than `constructor(public status: number)`. Consider `"erasableSyntaxOnly": true` in `tsconfig.json` so `tsc` enforces this (TypeScript 5.9.3 supports it `[VERIFIED: installed version]`). Testable modules must import each other with relative paths and the `.ts` suffix; `tsconfig` needs `"allowImportingTsExtensions": true`. Verified in a throwaway project: `next build` (Turbopack, TypeScript step) succeeds with `.ts`-suffixed relative imports and with an `@/lib/x.ts` alias import from a component.

### Pitfall 12: Hidden (Activity) routes keep DOM and IDs
Hidden routes stay in the document with `display: none`, so global `id`s and `document.querySelector` calls can match hidden elements. Scope the `h1`/`#main-content` lookups to the visible route (`main h1` is still ambiguous if two routes are kept; use the focus target from the layout's current `<main>` via the page's own ref or check `offsetParent !== null`) and use visibility-aware selectors in manual/E2E checks `[CITED: preserving-ui-state.md "Testing"]`.

### Pitfall 13: Mobile menu state under Activity
Open/closed state is preserved when the route is hidden. The menu lives in the root layout (always mounted), so it is not hidden, but it must still close on route change via a `usePathname()` effect (UI-SPEC) and when the viewport reaches 640 px (matchMedia subscribed with `useSyncExternalStore`). Toggle `inert` on the page content wrapper (`main` and `footer`, not the header) imperatively in the open/close effect with cleanup, rather than prop-drilling from the server layout.

## Code Examples

### API client core (error taxonomy, `res.ok` before `res.json()`)
```ts
// lib/api/client.ts
// Source: verified live behaviour (404 body {"error":"There is nothing here"}; 429 HTML body) + MDN fetch
export const API_BASE = "https://rickandmortyapi.com/api";
export type ApiErrorKind = "network" | "http" | "parse";
export class ApiError extends Error {
  kind: ApiErrorKind;
  status: number | null;
  constructor(kind: ApiErrorKind, status: number | null, message: string) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

/** Returns parsed JSON, or `null` for HTTP 404. Throws ApiError for everything else. Re-throws aborts untouched. */
export async function getJson<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { signal });
  } catch (e) {
    if (signal?.aborted) throw e;                    // let TanStack treat it as a cancel
    throw new ApiError("network", null, "Network request failed");
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError("http", res.status, `HTTP ${res.status}`); // includes 429 HTML bodies
  try { return (await res.json()) as T; }
  catch { throw new ApiError("parse", res.status, "Invalid JSON"); }
}
```

### IDs and normalisation (DATA-02; the ID helper is also needed by DATA-04 in Phase 3)
```ts
// lib/api/ids.ts
export function parseId(raw: string): number | null {          // positive integer only, no "0", "-1", "1.5", "abc", "007"
  return /^[1-9]\d*$/.test(raw) && Number.isSafeInteger(Number(raw)) ? Number(raw) : null;
}
export function extractId(url: string): number | null {        // last path segment of a resource URL; "" (empty origin URL) -> null
  return parseId(url.split("/").filter(Boolean).pop() ?? "");
}
// lib/api/normalize.ts
export const toArray = <T,>(x: T | T[] | null | undefined): T[] => (x == null ? [] : Array.isArray(x) ? x : [x]);
// multi-ID fetch: dedupe + validate ids, return [] without a request for an empty list; path = `/character/${ids.join(",")}`
```
A single ID (`/character/5`) returns an object, `/character/1,9999` returns an array with only id 1, and `/character/9999,9998` returns `[]` with HTTP 200 `[VERIFIED: live probe]`.

### Character list request
```ts
// lib/api/characters.ts
export async function fetchCharacterPage(f: Filters, page: number, signal?: AbortSignal): Promise<CharacterPage | null> {
  const p = new URLSearchParams();
  if (f.q) p.set("name", f.q);
  if (f.status) p.set("status", f.status);
  if (f.gender) p.set("gender", f.gender);
  if (f.species) p.set("species", f.species);   // "Mythological Creature" is encoded by URLSearchParams ("+")
  p.set("page", String(page));
  return getJson<CharacterPage>(`/character?${p}`, signal);
}
```
Verified: `species=Mythological%20Creature` returns count 46 (equal to the exact count). `page=0` and `page=abc` silently return page 1, so never send them. A 404 filtered result is `{"error":"There is nothing here"}`.

### Skeleton count by breakpoint (UI-SPEC: render 10, hide extras)
Render 10 `<li>` skeletons and hide `nth-child(n+5)` below 640 px, `n+7` from 640 to 1023, `n+9` from 1024 to 1279 (4 / 6 / 8 / 10 columns-times-two); one-row variant uses the 2/3/4/5 column counts. Do it with plain CSS media queries in `globals.css` so the static Suspense fallback and the client skeleton share one rule.

### Focus-to-h1 on client navigation (FND-06)
```tsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
export function RouteFocus() {
  const pathname = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }       // never steal focus on initial load
    const h1 = document.querySelector<HTMLElement>("main h1");  // see Pitfall 12 for the Activity caveat
    h1?.focus({ preventScroll: true });
  }, [pathname]);                                                // NOT searchParams
  return null;
}
```
Caveat: `first.current` written inside an effect is allowed by `react-hooks/refs`; reading it during render is not. Wrap in `<Suspense fallback={null}>` only if it ever calls `useSearchParams` (it should not).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Route unmounts on navigation | `<Activity>` hides up to 3 routes, preserving state/DOM/scroll | Next 16 with `cacheComponents` | BRW-11 mostly free, but Effects clean up and re-run; ids may duplicate in hidden DOM |
| `next/image` `priority` | `preload` (and `loading="eager"` / `fetchPriority`) | v16.0.0 | Do not use `priority` |
| Page-level `useSearchParams` anywhere | Must be inside `<Suspense>` or build fails | Cache Components | Verified build error reproduced |
| `useCache`/`dynamicIO` flags | single `cacheComponents` flag (already set) | v16.0.0 | Nothing to change |
| Default `qualities` list | `qualities` default `[75]` | v16.0.0 | Avatars use quality 75 unless configured |
| Geist fonts (scaffold) | Inter via `next/font/google` (variable, no `weight` array) | this phase | Replace font in `layout.tsx` and `--font-sans` mapping |

**Deprecated/outdated:** `onLoadingComplete` on `next/image` (use `onLoad`); `priority` (use `preload`); router-event listeners (use `usePathname`/`useSearchParams` effects).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Browser Back restores `window.scrollY` for a hidden-then-shown `/browse` under Activity (docs say scroll position is no longer reset, not runtime-verified here) | Pattern 6 | BRW-11 fails until the `useScrollMemory` fallback is built; Wave 0 spike decides |
| A2 | A hidden (Activity) `/browse` does not refetch or reset filters when `useSearchParams` reflects another route's empty query | Pattern 6 | Filters could reset on return; mitigated because the URL is restored on Back and the query cache keeps pages |
| A3 | Native `history.pushState/replaceState` entries behave correctly with Next's popstate handling (Back/Forward) | Pattern 2 | Fall back to `router.push/replace(..., { scroll: false })`, which is the spec's literal wording |
| A4 | The "fill to 20 exact items per load step, cap 4 API pages" design satisfies the spec's auto-request rule | Pattern 3 | Behaviour difference is visible only for Human; user may prefer strict per-page loading |
| A5 | Vercel Hobby image-optimisation quotas may not cover 826 distinct avatars; `next/image` may need `unoptimized` or a quota check at deploy | Pitfall 7 / PERF-01 | Phase 3 deploy surprise; PERF-01 only requires config, `sizes` and lazy loading |
| A6 | CSS painting order puts a `z-index:-1` fixed layer above the canvas but below `body`'s non-propagated background | Pitfall 10 | Star-field invisible; trivial CSS fix |
| A7 | The Cloudflare 429 threshold is roughly 30 requests in a few seconds from one IP (observed once, not characterised) | Pitfall 4 | Rate limits may be lower for shared IPs; step cap and debounce mitigate |
| A8 | After a "Load more" that leaves no next page, focus should still go to the first new card, not the end-of-list note (UI-SPEC contradicts itself; end note gets focus only when zero cards were added) | Open Question 2 | Focus ends on a different element than the UI-SPEC sentence implies |
| A9 | Installing `@tanstack/react-query` at the newest version is acceptable despite the `too-new` SUS flag | Package Audit | User may prefer an older pinned patch |
| A10 | Exact-match client filtering is only needed for Human, but is applied to every species chip harmlessly | Pattern 3 | None found; verified no other chip substring-matches another species in the 826-record dataset |

## Open Questions (RESOLVED)

All five were resolved during Phase 1 planning (2026-11-11) by user decisions recorded in the plans as "planning decisions 1 to 5".

1. **What do the header links `/` and `/collection` point to in Phase 1?** (UI-SPEC "unresolved") — RESOLVED: minimal interim pages, each with an `h1`, clearly replaceable (Home in Phase 2, Collection in Phase 3); plan 01-02.
   - Known: Home ships in Phase 2, Collection in Phase 3; the scaffold `app/page.tsx` is still the create-next-app page.
   - Recommendation: ship two minimal placeholder pages (a real `h1`, one line of copy, a link to `/browse`) rather than redirects. They are needed anyway to test FND-06 (focus after client navigation) and the BRW-11 Browse → elsewhere → Back round trip. Mark them clearly as replaced in Phases 2 and 3.
2. **Focus after "Load more" when no next page remains** (UI-SPEC "unresolved"; its text both focuses the first new card and says the end-of-list note gets focus). — RESOLVED: Load more always moves focus to the first new card; the end note gets focus only when the press added zero cards and the button unmounted; plan 01-10.
   - Recommendation: always focus the first newly added card (programmatic `tabindex="-1"` focus, only when the load was triggered by the button, never by the IntersectionObserver); focus the end-of-list note only if the click added zero cards and the button unmounted.
3. **May the user approve any test tooling?** — RESOLVED: `node --test` only in Phase 1 (no Playwright or axe); ask again at Phase 3 planning. Native History API for URL state, with the router fallback only if the Back spike (plan 01-05) shows misbehaviour. No library is installed. Without Playwright/axe there is no automated check for focus, menu trap, scroll restore or axe violations.
   - Recommendation: stay on `node --test` + manual checklist for Phase 1; ask once (at Phase 3 planning, where A11Y-06 lands) whether `@playwright/test` and `@axe-core/playwright` may be added.
4. **Star-dot opacity** deviation from the approved UI-SPEC (Pitfall 9). — RESOLVED: capped at 15% (UI-SPEC amended); `scripts/check-contrast.ts` verifies the composited worst case; plan 01-02. Needs the planner to either lower the opacity (recommended 15%) or keep text containers on an opaque background.
5. **Vercel Hobby image-optimisation limits** (A5): defer to Phase 3 deploy; Phase 1 only configures `remotePatterns`. — RESOLVED: deferred to the Phase 3 deploy (out of Phase 1 scope); plan 01-05 records it as a flagged assumption.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build, tests (`node --test` on `.ts`) | yes | v26.13.0 (`process.features.typescript` = `"strip"`) | — |
| npm | install | yes | 11.20.0 | — |
| Rick and Morty API | all data | yes (CORS `*`, `Cache-Control: public, max-age=7776000, immutable`) | live, 826 characters, 42 pages | — |
| Google Fonts at build (Inter) | `next/font/google` | yes (Geist downloaded fine in a spike `next build`) | — | `next/font/local` with a vendored file |
| Chrome / Edge | manual keyboard, Lighthouse, DevTools axe | yes (`chrome.exe`, `msedge.exe` installed) | — | — |
| Playwright / Puppeteer | automated UI tests | no | — | manual checklist (Open Question 3) |
| Lighthouse CLI | PERF-02 | no (DevTools Lighthouse available in Chrome) | — | DevTools Lighthouse; PERF-02 is Phase 3 |
| `axe-core` | A11Y-06 | present only as a transitive dependency of `eslint-plugin-jsx-a11y` (4.14.0) | 4.14.0 | browser extension / DevTools Lighthouse accessibility (the spec allows both) |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** Playwright, Lighthouse CLI, declared axe (use manual DevTools passes; ask before adding libraries).

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json`, so this section is included.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` + `node:assert/strict` (built in, Node 26.13.0, runs `.ts` via type stripping; **no new dependency**) |
| Config file | none. Wave 0: add `"test": "node --test \"lib/**/*.test.ts\" \"scripts/**/*.test.ts\""` to `package.json`, `"allowImportingTsExtensions": true` (and optionally `"erasableSyntaxOnly": true`) to `tsconfig.json` |
| Quick run command | `node --test lib/browse/species.test.ts` (single file) |
| Full suite command | `npm test && npx tsc --noEmit && npm run lint && npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FND-01 | Every text/background pair >= 4.5:1, UI borders/focus >= 3:1 (including composited star dot) | unit (script) | `node scripts/check-contrast.ts` | ❌ Wave 0 |
| DATA-01 | list/single/multi/episodes/locations build the right URLs and parse typed results | unit (stubbed `fetch`) | `node --test lib/api/characters.test.ts` | ❌ Wave 0 |
| DATA-02 | object → array, `[]` stays `[]`, missing IDs tolerated, empty ID list makes no request | unit | `node --test lib/api/normalize.test.ts` | ❌ Wave 0 |
| DATA-03 | 404 page 1 → empty; 404 page > 1 → end; 429/HTML → `ApiError` (not parse crash) | unit | `node --test lib/api/client.test.ts lib/browse/steps.test.ts` | ❌ Wave 0 |
| DATA-05 | `staleTime >= 3_600_000`, `refetchOnWindowFocus === false`, `gcTime > staleTime`, `networkMode === "always"`; queryFn forwards `signal` | unit | `node --test lib/query/client.test.ts` | ❌ Wave 0 |
| BRW-03 / BRW-05 / BRW-06 | URL ↔ Filters round-trip, allow-list rejects junk, Clear all drops all params, `q` capped at 60 | unit | `node --test lib/browse/filters.test.ts` | ❌ Wave 0 |
| BRW-04 | exact species filter excludes Humanoid; derived total = humanCount − humanoidCount (use recorded fixtures: 434, 68, 366; 80, 7, 73); fill loop stops at 20 items, at end, and at the step cap | unit | `node --test lib/browse/species.test.ts lib/browse/steps.test.ts` | ❌ Wave 0 |
| BRW-07 / BRW-08 | announcement strings ("1 character", "N more characters loaded" with actual n, never an interim count) | unit | `node --test lib/browse/announce.test.ts` | ❌ Wave 0 |
| PERF-01 | `next.config.ts` has `images.remotePatterns` with protocol `https`, hostname `rickandmortyapi.com`, pathname `/api/character/avatar/**` | unit (imports the config) | `node --test lib/config.test.ts` | ❌ Wave 0 |
| FND-02..07, BRW-01/02/09/10/11, CARD-01/08 | Layout, header/footer, skip link, focus offset, menu trap, star-field, grid columns, debounce, empty/error/offline, scroll-to-top, scroll restore, avatar placeholder/fallback | manual (no zero-dependency browser automation; justification: no Playwright/axe allowed) | Manual checklist below at the end-of-phase human-verify checkpoint | n/a |
| All | typecheck, lint (jsx-a11y, react-hooks v7), prerender (Suspense around `useSearchParams`) | static | `npx tsc --noEmit && npm run lint && npm run build` | ✅ scripts exist |

**Manual checklist (visible-element selectors only, because hidden Activity routes stay in the DOM):** (1) Tab from a fresh load: first stop is "Skip to content", Enter lands focus in `main`. (2) Tab through the page at 1280 and 320 px; no focused element hidden under the sticky header; no horizontal page scroll at 320 px or 200% zoom. (3) Mobile menu: open, Tab/Shift+Tab stays in menu + button, Escape/outside tap/nav closes and focus returns to the button. (4) Header link to `/collection` then Back: focus moved to `h1` after the link navigation, title updated, Browse filters/pages/scroll restored. (5) Type "rick": one request after 300 ms, URL updated with replace (Back does not step through letters); chip changes push; Escape and × clear. (6) Human chip: no Humanoid card, count line shows "Counting…" then 366 (unfiltered), live region never announces 434. (7) Scroll to bottom auto-loads; Load more moves focus to the first new card; last page shows the end note, no error. (8) DevTools offline: first page shows "You appear to be offline" with Retry; next-page failure keeps cards with inline Retry. (9) `prefers-reduced-motion`: star-field and skeleton static. (10) DevTools Lighthouse accessibility run and one axe pass on `/browse` (no gradient-text "needs review" items left unexplained).

### Sampling Rate
- **Per task commit:** `node --test <changed file>` plus `npx tsc --noEmit`
- **Per wave merge:** `npm test && npx tsc --noEmit && npm run lint && npm run build`
- **Phase gate:** full suite green and manual checklist signed off before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `package.json` `"test"` script, `tsconfig.json` `allowImportingTsExtensions` (and `erasableSyntaxOnly`)
- [ ] `lib/api/*.test.ts`, `lib/browse/*.test.ts`, `lib/query/client.test.ts`, `lib/config.test.ts`
- [ ] `scripts/check-contrast.ts` (+ token source it parses from `app/globals.css`)
- [ ] Install `@tanstack/react-query` (after `checkpoint:human-verify`, see Package Audit)
- [ ] Runtime spike: Browse → scroll → placeholder `/collection` → Back; record whether `scrollY` and filters survive, and whether native `pushState` Back behaves (A1, A2, A3)

## Security Domain

> `security_enforcement` is enabled in `.planning/config.json` (`security_asvs_level: 1`, `security_block_on: "high"`).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No accounts (out of scope in REQUIREMENTS.md) |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No protected resources |
| V5 Input Validation | yes | Allow-list parsing of URL filter params; `q` trimmed and capped at 60; all API query strings built with `URLSearchParams`; numeric IDs via `parseId` |
| V6 Cryptography | no | None used |
| V10/V12 Output & Resources | yes | React escapes rendered API text; `next/image` `remotePatterns` restricts the optimizer to `https://rickandmortyapi.com/api/character/avatar/**`; external link uses `rel="noopener noreferrer"` |
| V13 API / Web Service | yes | Fixed base URL constant; no user-controlled host or path segments |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Query-string injection into API URL via `?species=...&name=...` | Tampering | Allow-list for status/gender/species; `URLSearchParams` encoding for `q`; no raw concatenation |
| `javascript:` or untrusted URL passed to `router.push/replace` (Next docs warn about XSS) | Tampering / XSS | Only push URLs built from `window.location.pathname` plus serialized allow-listed filters |
| Open image proxy abuse through `next/image` | Info disclosure / DoS | Narrow `remotePatterns` (protocol, hostname, pathname) as quoted in SPEC section 9 |
| Tabnabbing on the external footer link | Spoofing | `target="_blank"` with `rel="noopener noreferrer"` |
| Rate-limit lockout from burst fetching | DoS (self-inflicted) | 300 ms debounce, step cap (Pattern 3), no 4xx retries, `AbortSignal` on superseded requests |

## Sources

### Primary (HIGH confidence)
- Local Next.js 16.4.6 docs (authoritative for this version): `01-app/02-guides/preserving-ui-state.md`, `01-app/02-guides/client-side-data-fetching/tanstack-query.md`, `01-app/03-api-reference/04-functions/use-search-params.md`, `.../use-router.md`, `.../generate-metadata.md` (title template), `01-app/01-getting-started/04-linking-and-navigating.md` (Native History API, sticky-header scroll offset), `01-app/03-api-reference/02-components/link.md` (`scroll`, `scroll-padding-top`), `.../image.md` (`remotePatterns`, `preload`, v16 changes), `.../font.md`, `01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md` (Activity navigation), `01-app/02-guides/migrating-to-cache-components.md` (UI state preservation)
- Live Rick and Morty API probes on 2026-11-11 (counts, species, 404 bodies, multi-ID shapes, 429 HTML, cache headers)
- Spike builds of `next build` on Next 16.4.6 (Suspense requirement reproduced; `.ts`-suffixed imports compile)
- `npx eslint --print-config` (react-hooks severities), `node --test` on `.ts` (type stripping)
- `npm view @tanstack/react-query` and `gsd-tools query package-legitimacy check`
- Repo files read this session: `docs/SPEC.md`, `.planning/REQUIREMENTS.md`, `01-CONTEXT.md`, `01-UI-SPEC.md`, `STATE.md`, `package.json`, `next.config.ts`, `app/layout.tsx`, `app/globals.css`, `tsconfig.json`, `eslint.config.mjs`, `.planning/config.json`

### Secondary (MEDIUM confidence)
- tanstack.com guides fetched via WebFetch: infinite-queries, network-mode, query-cancellation, important-defaults, reference/useInfiniteQuery, reference/infiniteQueryOptions (page text summarised by a fetch model; the pages did not label the version, but the API matches v5)

### Tertiary (LOW confidence)
- CSS painting-order claim for the star-field layer (Pitfall 10) and Vercel image quotas (A5): training knowledge, flagged `[ASSUMED]`

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH. Versions read from `package.json` and the registry; one package flagged SUS for freshness only.
- Architecture: MEDIUM-HIGH. Next 16 and TanStack behaviours are documented and partly reproduced; Activity scroll restoration and native-history Back are documented but need the Wave 0 spike.
- Pitfalls: HIGH. Most were reproduced or measured (build error, lint severities, contrast numbers, 429, species yields).

**Research date:** 2026-11-11
**Valid until:** 2026-11-18 for TanStack Query version details (releases are frequent); 30 days for the Next 16 and API findings.
