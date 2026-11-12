---
gsd_state_version: "1.0"
current_phase: 3
current_phase_name: Detail + Collection
status: executing
stopped_at: Completed 03-03-PLAN.md
last_updated: "2026-11-12T10:52:37.789Z"
last_activity: 2026-11-12
last_activity_desc: Phase 3 execution started
state_head: 9af303e7caf63f153245e7da06686e312c17686d
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 19
  completed_plans: 17
  percent: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-11-11)

**Core value:** Browsing and collecting characters must feel delightful: cards that tilt, flip and glow, and a portal that reveals a random character, in a dark cosmic UI that stays fast and fully accessible (WCAG 2.1 AA).
**Current focus:** Phase 3 — Detail + Collection

## Current Position

Phase: 3 (Detail + Collection) — EXECUTING
Plan: 4 of 5
Status: Ready to execute
Last activity: 2026-11-12 — Phase 3 execution started

Progress: [███░░░░░░░] 25%

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: - min
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 10 | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 20 min | 3 tasks | 9 files |
| Phase 01 P02 | 8 min | 2 tasks | 9 files |
| Phase 01 P03 | n/a (resumed) | 2 tasks | 11 files |
| Phase 01 P04 | 12 min | 2 tasks | 6 files |
| Phase 01 P06 | 12 min | 2 tasks | 7 files |
| Phase 01 P05 | n/a (resumed) | 3 tasks | 7 files |
| Phase 01 P07 | 7 min | 2 tasks | 5 files |
| Phase 01 P08 | 8 min | 2 tasks | 4 files |
| Phase 01 P09 | 15 min | 3 tasks | 9 files |
| Phase 01 P10 | 10 min | 3 tasks | 3 files |
| Phase 02 P02 | 20min (continuation) | 3 tasks | 8 files |
| Phase 02 P03 | 20 min | 2 tasks | 7 files |
| Phase 02 P04 | 12 min | 2 tasks | 5 files |
| Phase 03 P01 | 40 min | 3 tasks | 11 files |
| Phase 03 P02 | 15 min | 2 tasks | 7 files |
| Phase 03 P03 | 35 min | 3 tasks | 13 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Keep the 4 spec phases despite `fine` granularity; granularity only affects plans per phase
- [Roadmap]: COL-01 to COL-03 (favourites store, counter) ship in Phase 2 with the favourite star; Collection page stays in Phase 3
- [Roadmap]: DATA-04 (invalid route IDs show 404) is verified in Phase 3 when the route and 404 page exist
- [Roadmap]: All phases run in MVP mode (`**Mode:** mvp`), planned as vertical slices
- [Phase 01]: node --test only for lib unit tests; no test library added (CLAUDE.md dependency rule)
- [Phase 01]: verbatimModuleSyntax + allowImportingTsExtensions + erasableSyntaxOnly enabled so Node type stripping and tsc agree on type-only imports
- [Phase 01]: @tanstack/react-query approved by user at exactly 5.107.1; install in plan 01-03 with npm install --save-exact; no other package approved
- [Phase 01]: Skip link is a .skip-link CSS class (off-screen via translateY, none on :focus) rather than sr-only utilities
- [Phase 01]: check-contrast strips CSS comments and enforces the 0.15 star-dot cap in code
- [Phase 01]: 01-03: native History API confined to useBrowseUrl so the router fallback is a one-file change; q trimmed in parse and serialize
- [Phase 01]: 01-04: Mobile menu panel transitions opacity and translate (Tailwind 4 translate utilities set the translate property, not transform)
- [Phase 01]: 01-04: Guarded render-phase setOpenPath(null) discards a stale menu open request so narrowing the window never reopens it
- [Phase 01]: 01-06: kept RESEARCH A4 load-step design (fill to 20 exact items, 4 API page cap) confined to fetchBrowseStep; reversible
- [Phase 01]: 01-06: deriveTotal returns 0 when firstCount is 0 before the Human/humanoid branch; null only while the humanoid count is unknown
- [Phase 01]: 01-05: Back-navigation spike answered native-ok; plan 01-10 adds no history or scroll code, only re-verifies Back restore with several loaded pages
- [Phase 01]: 01-05: card markup locked in final D-01 form (static front, empty star and link slots, inert back); CARD-01 partial, star ships with CARD-06 in Phase 2
- [Phase 01]: 01-07: Clear via x/Escape uses history replace (search edit); Clear all and chips push; scroll to toolbar only when top < 64 px
- [Phase 01]: 01-08: a failed Humanoid count request leaves the Human total null (Counting... shown, nothing announced) rather than showing a Humanoid-inflated number
- [Phase 01]: 01-08: the humanoid count query is enabled only for the Human chip with firstCount > 0; live-region announce() is a stable callback written through a ref after a 500 ms settle
- [Phase 01]: 01-09: Retry keeps the error panel mounted via a retryKey because a data-less TanStack query resets to pending on refetch
- [Phase 01]: 01-09: Skeleton badge and species bars use the real card's CSS heights (24.8 px, 20 px), not the plan's 29 px and 21 px
- [Phase 01]: 01-10: native-ok spike option applied; Back restore relies on Activity retention and the query cache, no scroll-memory or router code
- [Phase 01]: 01-10: onLoadMore carries a trigger (button or scroll); only button presses and inline Retry move focus after a next-step load
- [Phase 02]: 02-02: motion approved by the user at exactly 14.12.0 and installed with --save-exact; no other package added
- [Phase 02]: 02-02: PortalDisc rotates a motion.span (not div) because it sits inside the portal button; reduced motion is the server snapshot so first paint is static
- [Phase 02]: 02-03: favourite star name is constant ('Add {name} to collection') with aria-pressed carrying state — A swapped label plus pressed state is announced as a contradiction by screen readers
- [Phase 02]: 02-03: header counter is 'N collected' below 640 px and 'N / {total} collected' from 640 px once total loaded (user accepted) — Fits the 320 px header budget; never shows N / 0
- [Phase 02]: 02-04: tilt pointer handlers and rect measurement sit on the untransformed outer div, not the rotating motion.div — A rotated element's hit area changes with its own rotation, causing enter/leave flicker at tilted edges
- [Phase 02]: 02-04: sheen position follows the pointer directly; only sheen opacity and rotation are springs (stiffness 300, damping 30) — Spot tracks the cursor without lag; Phase 4 may tune spring values
- [Phase 03]: 03-01: generateStaticParams returns one sample so params is read at top level; build accepted it, no Suspense fallback
- [Phase 03]: 03-01: invalid IDs return HTTP 200 on first request (PPR shell) and 404 on repeat; plan's documented 200+noindex fallback accepted, first-hit 404 left as an open user decision
- [Phase 03]: 03-02: Collection removal side effects run in AnimatePresence onExitComplete; focus and scroll move only when the removed card held focus (hadFocus recorded in a capture-phase click before the card turns inert)
- [Phase 03]: 03-02: Collection query key is the sorted ID list with keepPreviousData; placeholder data holding no current favourite counts as loading, not empty
- [Phase 03]: 03-03: whole card morphs into the hero avatar box (user decision 2026-11-12); browser-generated group width/height interpolation accepted as an exception
- [Phase 03]: 03-03: seedCharacter writes the detail key only when absent, so View details renders the hero in the navigation commit

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 1]: AGENTS.md warns this Next.js version has breaking changes. Read `node_modules/next/dist/docs/` before using `viewTransition`, `notFound()`, route params, metadata or `next/image` `remotePatterns`.
- [Phase 1]: Theme tokens must pass the contrast check (4.5:1 text, 3:1 UI) before they are locked.
- [Phase 1]: No test library is added without the user's approval (open question P2 in SPEC.md).
- [Phase 3]: The Vercel deploy is a manual step that needs the user's Vercel account.

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| v2 | "Guess who" silhouette mini-game (GAME-01) | Deferred | 2026-11-11 | v1 |
| v2 | Side-by-side card comparison (CMP-01) | Deferred | 2026-11-11 | v1 |

## Session Continuity

Last session: 2026-11-12T10:52:36.033Z
Stopped at: Completed 03-03-PLAN.md
Resume file: None
