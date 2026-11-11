---
phase: "01"
slug: "foundation-browse"
status: draft
nyquist_compliant: true
wave_0_complete: false
created: "2026-11-11"
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Derived from `01-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` + `node:assert/strict` (built in, Node 26.13, runs `.ts` via type stripping; no new dependency) |
| **Config file** | none. Wave 0 adds a `test` script to `package.json` and `allowImportingTsExtensions` to `tsconfig.json` |
| **Quick run command** | `npm test && npx tsc --noEmit && npm run lint` (per-task fast loop); single file: `node --test lib/browse/species.test.ts` |
| **Slow gate command** | `npm run build && node scripts/smoke.ts route:/... "expected" ...` (per plan; exact commands in the `{plan}-GATE` rows below and in each plan's `<verification>` block) |
| **Full suite command** | `npm test && node scripts/check-contrast.ts && npx tsc --noEmit && npm run lint && npm run build && node scripts/smoke.ts <cumulative expectations>` (phase gate `01-ALL-01`; full command in 01-10 `<verification>`) |
| **Estimated runtime** | Fast loop about 10 to 25 s; slow gate about 30 to 90 s (Next production build plus `next start`); full suite about 60 to 120 s. Estimates; measured at execution |

---

## Sampling Rate

- **After every task commit (fast loop, target under 30 s):** `npm test && npx tsc --noEmit && npm run lint` plus the task's own `node --test <file>` or script check (contrast gate, live-read or live-step one-liner, `DEFAULTS OK` / `DEPS OK` one-liners). Plan 01-02 leaves out `npm test` because the `test` script comes from plan 01-01 in the same wave. No task runs `npm run build` or `scripts/smoke.ts`.
- **After every plan (known slow gate, once per plan):** the plan's `npm run build && node scripts/smoke.ts ...` from its `<verification>` block, run by the executor once after the plan's last task. These are the `{plan}-GATE` rows. They carry every served-HTML must_have that tasks used to check with per-task smoke runs. Plan 01-01 (harness and API client) and plan 01-06 (pure `lib/` policies) add no route, component or config, so they have no slow gate.
- **After every plan wave (known slow, once per wave):** the slow gates of that wave's plans (parallel plans run them at the same time in their own worktrees, each smoke on a free OS-assigned port), then the orchestrator's post-merge gate re-runs `npm run build` and `npm test` once on the merged tree. See "Wave Gates" below.
- **Before `/gsd-verify-work` (phase gate, known slow):** `01-ALL-01`, the full suite plus the cumulative smoke (union of every plan gate's expectations), run once after 01-10's slow gate; then the manual checklist is signed off.
- **Max feedback latency:** 30 seconds per task (fast loop). The slow gates are exempt by design: they are known slow and run once per plan or wave and at the phase gate, never per task.

### Wave Gates

| Wave | Plans | Plan-end slow gates (run once each) | Merged-tree check (orchestrator post-merge gate) |
|------|-------|-------------------------------------|--------------------------------------------------|
| 1 | 01-01, 01-02 | 01-02-GATE | `npm run build`, `npm test` |
| 2 | 01-03, 01-04 | 01-03-GATE, 01-04-GATE | `npm run build`, `npm test` |
| 3 | 01-05, 01-06 | 01-05-GATE (01-06 has none) | `npm run build`, `npm test` |
| 4 | 01-07 | 01-07-GATE | `npm run build`, `npm test` |
| 5 | 01-08 | 01-08-GATE | `npm run build`, `npm test` |
| 6 | 01-09 | 01-09-GATE | `npm run build`, `npm test` |
| 7 | 01-10 | 01-10-GATE, then the phase gate 01-ALL-01 | `npm run build`, `npm test` |

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01-01 | 1 | DATA-01, DATA-03 | T-01-02, T-01-04 | 429/HTML body raises `ApiError` http, not a parse crash; fixed error messages | unit (stubbed fetch) + one live read | `npm test && npx tsc --noEmit` plus the live `getJson('/character?page=1')` one-liner (`node --test lib/api/client.test.ts` for the file alone) | ❌ created by the task | ⬜ pending |
| 01-01-T2 | 01-01 | 1 | DATA-01, DATA-02, DATA-03 | T-01-01, T-01-03 | Params only via `URLSearchParams`; multi-ID paths contain integers only | unit (stubbed fetch) | `node --test lib/api/endpoints.test.ts && npm test && npx tsc --noEmit && npm run lint` | ❌ created by the task | ⬜ pending |
| 01-01-T3 | 01-01 | 1 | (supply chain for DATA-05) | T-01-SC | User approves the exact `@tanstack/react-query` version before install | checkpoint:human-verify (blocking-human) | n/a (executor pastes `npm view @tanstack/react-query@5.107.1 ... --json`) | n/a | ⬜ pending |
| 01-02-T1 | 01-02 | 1 | FND-01, FND-05 | T-01-06 | Smoke server bound to 127.0.0.1 (exercised by 01-02-GATE) | script + static (fast loop) | `node scripts/check-contrast.ts && npx tsc --noEmit && npm run lint` (no `npm test`: the script comes from 01-01 in the same wave) | ❌ created by the task | ⬜ pending |
| 01-02-T2 | 01-02 | 1 | FND-03, FND-07 | T-01-05, T-01-07 | `rel="noopener noreferrer"` in source; fonts self-hosted | script + static (fast loop) (+ human-check) | `node scripts/check-contrast.ts && npx tsc --noEmit && npm run lint` | ❌ created by the task | ⬜ pending |
| 01-02-GATE | 01-02 | 1 | FND-01, FND-03, FND-05, FND-07 | T-01-05, T-01-06 | `rel="noopener noreferrer"` served; smoke server on 127.0.0.1 and always stopped | build + smoke (slow gate, plan end) | `npm run build && node scripts/smoke.ts route:/ "Skip to content" "main-content" "Welcome to Portal Dex" "star-field" "Data from The Rick and Morty API" "site-footer" route:/collection "Your collection" "Collection · Portal Dex" ... "noopener noreferrer" "opens in new tab"` (full command in 01-02 `<verification>`) | ✅ smoke from 01-02-T1 | ⬜ pending |
| 01-03-T1 | 01-03 | 2 | DATA-05 | T-01-09, T-01-SC | Exact pinned dependency; 4xx never retried; signal forwarded | unit suite + defaults and dependency checks (fast loop) | `npm test && npx tsc --noEmit && npm run lint` plus the `DEFAULTS OK` and `DEPS OK` one-liners | ✅ test script from 01-01 | ⬜ pending |
| 01-03-T2 | 01-03 | 2 | BRW-03, BRW-06 (+ BRW-02, BRW-11 edges) | T-01-08 | Allow-lists reject junk params; history writes only built URLs | unit (fast loop) | `node --test lib/browse/filters.test.ts && npm test && npx tsc --noEmit && npm run lint` | ❌ created by the task | ⬜ pending |
| 01-03-GATE | 01-03 | 2 | DATA-05, BRW-06 | — | N/A | build + smoke (slow gate, plan end) | `npm run build && node scripts/smoke.ts route:/browse "Browse characters" "Browse · Portal Dex" "aria-busy"` | ✅ smoke from 01-02 | ⬜ pending |
| 01-04-T1 | 01-04 | 2 | FND-02, FND-06 | T-01-11 | Static nav targets only | unit suite + static + grep (fast loop) | `npm test && npx tsc --noEmit && npm run lint` | ✅ | ⬜ pending |
| 01-04-T2 | 01-04 | 2 | FND-04, FND-05 | T-01-10 | Focus trap always escapable; inert removed on cleanup | unit suite + lint + grep (fast loop) (+ human-check) | `npm test && npx tsc --noEmit && npm run lint` | ✅ | ⬜ pending |
| 01-04-GATE | 01-04 | 2 | FND-02, FND-04, FND-05, FND-06 | — | N/A | build + smoke (slow gate, plan end) | `npm run build && node scripts/smoke.ts route:/collection "aria-current=\"page\"" "0 collected" "Collection · Portal Dex" "aria-label=\"Main\"" route:/ "Portal Dex" "0 collected" "Skip to content" "aria-controls=\"mobile-menu\"" "Open menu" "Main menu"` | ✅ smoke from 01-02 | ⬜ pending |
| 01-05-T1 | 01-05 | 3 | CARD-01 (partial: star slot reserved and empty per D-03; the star moved to CARD-06, Phase 2), BRW-01 | T-01-14 | API text rendered as React text only | unit suite + static + grep (fast loop) | `npm test && npx tsc --noEmit && npm run lint`; acceptance greps the absence of a raw HTML injection prop | ✅ | ⬜ pending |
| 01-05-T2 | 01-05 | 3 | CARD-08, PERF-01 | T-01-12, T-01-13 | Narrow `remotePatterns` (https, host, avatar path, no query); `isAvatarUrl` guard | unit (fast loop) | `node --test lib/config.test.ts && npm test && npx tsc --noEmit && npm run lint` | ❌ created by the task | ⬜ pending |
| 01-05-T3 | 01-05 | 3 | BRW-11 (spike), BRW-06 (A3) | — | N/A | checkpoint:decision (blocking-human) | n/a (user runs the Back/scroll spike on `next start`) | n/a | ⬜ pending |
| 01-05-GATE | 01-05 | 3 | CARD-01 (partial), CARD-08, PERF-01, BRW-01 | T-01-12 | Production build accepts the narrow `remotePatterns` config | build + smoke (slow gate, plan end) | `npm run build && node scripts/smoke.ts route:/browse "Browse characters" "Browse · Portal Dex"` | ✅ smoke from 01-02 | ⬜ pending |
| 01-06-T1 | 01-06 | 3 | BRW-04, DATA-03, BRW-09 | T-01-15, T-01-16 | Load step capped at 4 API pages; exact allow-listed species | unit + one live step | `node --test lib/browse/species.test.ts lib/browse/steps.test.ts && npx tsc --noEmit` plus the `LIVE STEP OK` one-liner | ❌ created by the task | ⬜ pending |
| 01-06-T2 | 01-06 | 3 | BRW-07, BRW-08, DATA-05 | — | N/A | unit | `node --test lib/browse/announce.test.ts lib/query/client.test.ts && npm test && npx tsc --noEmit && npm run lint` | ❌ created by the task | ⬜ pending |
| 01-07-T1 | 01-07 | 4 | BRW-02, BRW-06 | T-01-17, T-01-18 | 300 ms debounce; 60-character cap | unit suite + lint + grep (fast loop) | `npm test && npx tsc --noEmit && npm run lint` | ✅ | ⬜ pending |
| 01-07-T2 | 01-07 | 4 | BRW-03, BRW-05, BRW-10 | — | N/A | unit suite + lint + grep (fast loop) (+ human-check) | `npm test && npx tsc --noEmit && npm run lint` | ✅ | ⬜ pending |
| 01-07-GATE | 01-07 | 4 | BRW-02, BRW-03, BRW-05, BRW-06, BRW-10 | — | N/A | build + smoke (slow gate, plan end) | `npm run build && node scripts/smoke.ts route:/browse "Browse characters" "Browse · Portal Dex"` | ✅ | ⬜ pending |
| 01-08-T1 | 01-08 | 5 | BRW-04 | T-01-19 | Humanoid count gated to Human after page 1 | unit suite + lint + grep (fast loop) | `npm test && npx tsc --noEmit && npm run lint` | ✅ | ⬜ pending |
| 01-08-T2 | 01-08 | 5 | BRW-07, DATA-05 | T-01-20 | Keys from allow-listed `filtersKey`; signal forwarded to every sub-request | unit (stubbed fetch) (fast loop) (+ human-check) | `node --test lib/query/options.test.ts && npm test && npx tsc --noEmit && npm run lint` | ❌ created by the task | ⬜ pending |
| 01-08-GATE | 01-08 | 5 | BRW-04, BRW-07 | — | N/A | build + smoke (slow gate, plan end) | `npm run build && node scripts/smoke.ts route:/browse "Browse characters"` | ✅ | ⬜ pending |
| 01-09-T1 | 01-09 | 6 | BRW-09 | T-01-21, T-01-22 | Fixed copy, never error details; Retry deduped | unit suite + lint + grep (fast loop) | `npm test && npx tsc --noEmit && npm run lint` | ✅ | ⬜ pending |
| 01-09-T2 | 01-09 | 6 | BRW-09, BRW-01 | — | N/A | unit suite + lint + grep (fast loop) (+ human-check) | `npm test && npx tsc --noEmit && npm run lint` | ✅ | ⬜ pending |
| 01-09-T3 | 01-09 | 6 | BRW-09 | — | N/A | unit suite + lint + contrast (fast loop) (+ human-check) | `npm test && npx tsc --noEmit && npm run lint && node scripts/check-contrast.ts` | ✅ | ⬜ pending |
| 01-09-GATE | 01-09 | 6 | BRW-09, BRW-01 | — | N/A | build + smoke on prerendered HTML (slow gate, plan end) | `npm run build && node scripts/smoke.ts route:/browse "Browse characters" "skeleton-grid" "Counting..." "aria-busy"` | ✅ | ⬜ pending |
| 01-10-T1 | 01-10 | 7 | BRW-08 | T-01-23 | Observer guarded by hasNextPage / fetching / error | unit suite + lint + grep (fast loop) | `npm test && npx tsc --noEmit && npm run lint` | ✅ | ⬜ pending |
| 01-10-T2 | 01-10 | 7 | BRW-08, BRW-09, DATA-03 | T-01-23 | Auto-load paused after a next-page error | unit suite + lint + grep (fast loop) (+ human-check) | `npm test && npx tsc --noEmit && npm run lint` | ✅ | ⬜ pending |
| 01-10-T3 | 01-10 | 7 | BRW-11 | T-01-24 | Router fallback receives built URLs only; scroll memory stores numbers | unit suite + lint + grep (fast loop) (+ human-check) | `npm test && npx tsc --noEmit && npm run lint` | ✅ | ⬜ pending |
| 01-10-GATE | 01-10 | 7 | BRW-08, BRW-11 | T-01-24 | Production build of the spike-selected BRW-11 path | build + smoke (slow gate, plan end) | `npm run build && node scripts/smoke.ts route:/browse "Browse characters" route:/collection "Your collection"` | ✅ | ⬜ pending |
| 01-ALL-01 | all | phase gate | All | — | N/A | static + unit + contrast + build + cumulative smoke (slow, once) | `npm test && node scripts/check-contrast.ts && npx tsc --noEmit && npm run lint && npm run build && node scripts/smoke.ts route:/ ... route:/collection ... route:/browse "Browse characters" "Browse · Portal Dex" "aria-busy" "skeleton-grid" "Counting..."` (union of every plan gate; full command in 01-10 `<verification>`) | ✅ after 01-01 and 01-02 | ⬜ pending |

*Task IDs are `{plan}-T{n}` and match the `<task>` order in each PLAN.md. Every non-checkpoint task carries an `<automated>` command with a `<fails_when>` signal, and every per-task command is the fast loop (no `npm run build`, no `scripts/smoke.ts`); the two checkpoints are human gates by design. `{plan}-GATE` rows are the known-slow plan-end gates from each plan's `<verification>` block, each with a stated "Fails when" (non-zero exit, "SMOKE FAIL", or a last smoke line other than "SMOKE OK"). `01-ALL-01` is the phase gate.*
*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Research's Wave 0 gaps are scheduled in the earliest plans that can host them (execution waves start at 1; there is no separate wave 0):

- [ ] `package.json` `test` script and `tsconfig.json` `allowImportingTsExtensions` plus `erasableSyntaxOnly` → plan 01-01 Task 1 (wave 1)
- [ ] Test files, each created by the task that first needs it (TDD-style, so no task references a missing test): `lib/api/client.test.ts` (01-01-T1), `lib/api/endpoints.test.ts` (01-01-T2), `lib/browse/filters.test.ts` (01-03-T2), `lib/config.test.ts` (01-05-T2), `lib/browse/species.test.ts` and `lib/browse/steps.test.ts` (01-06-T1), `lib/browse/announce.test.ts` and `lib/query/client.test.ts` (01-06-T2), `lib/query/options.test.ts` (01-08-T2)
- [ ] `scripts/check-contrast.ts` parsing `app/globals.css`, including the composited 15% star dot (planning decision 1) → plan 01-02 Task 1 (wave 1)
- [ ] `scripts/smoke.ts` production smoke runner (build + `next start` + HTML assertions) → plan 01-02 Task 1 (wave 1)
- [ ] `@tanstack/react-query` legitimacy `checkpoint:human-verify` (blocking-human) → plan 01-01 Task 3 (wave 1); install with `--save-exact` → plan 01-03 Task 1 (wave 2). Motion is not installed in Phase 1
- [ ] Runtime spike (Browse, scroll, header link to `/collection`, Back; native `pushState` Back/Forward) → plan 01-05 Task 3 `checkpoint:decision` (wave 3, the first point where cards scroll and the header link exists); the decision is applied in plan 01-10 Task 3

---

## Manual-Only Verifications

No zero-dependency browser automation exists, because Playwright and axe need user approval. These run at the end-of-phase human-verify checkpoint. Use visible-element selectors only, since hidden Activity routes stay in the DOM.

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Skip link and focus on `main` | FND-05 | No browser automation | Tab from a fresh load: first stop is "Skip to content", Enter focuses `main` (01-02-T2) |
| Focus never hidden under sticky header; no horizontal scroll | FND-05, BRW-01 | Layout and focus | Tab through at 1280 and 320 px and at 200% zoom (01-04-T2) |
| Footer link and disclaimer | FND-03 | Layout | Footer shows the API link (new tab) and the disclaimer, stacked under 640 px, one row from 640 px (01-02-T2) |
| Mobile menu trap and close | FND-04 | Focus behaviour | Open menu, Tab and Shift+Tab stay in menu and button; Escape and outside tap close it and return focus to the button; navigation closes it and focus goes to the new h1 (01-04-T2) |
| Focus on `h1` and title update after navigation | FND-06 | Navigation behaviour | Click "Collection": focus on the visible h1, title "Collection · Portal Dex" (01-04-T2) |
| Browse state restore after Back | BRW-11 | Navigation behaviour | Go to `/collection`, then Back; filters, loaded pages and scroll restored (01-05-T3 spike, 01-10-T3) |
| Debounce and URL history | BRW-02, BRW-06 | Timing in browser | Type "rick": one request after 300 ms, URL replaced, Back does not step through letters; chips push; Escape and × clear (01-07-T2) |
| Chips, Clear all, reset and scroll to grid top | BRW-03, BRW-05, BRW-10 | Interaction | One value per group, active chip deselects, Clear all is one history step, a change while scrolled down returns to the grid top (01-07-T2) |
| Human chip and count announcement | BRW-04, BRW-07 | Live region | No Humanoid card; count shows "Counting..." then 366; live region never announces 434 (01-08-T2) |
| Card front, grid columns and avatar fallback | CARD-01 (partial, D-03), CARD-08, BRW-01 | Visual | 2/3/4/5 columns; placeholder then fade-in; blocked avatar shows the initial tile; no favourite star is visible (its slot is reserved for CARD-06 in Phase 2) (01-05-T2) |
| Infinite scroll, Load more focus, end note | BRW-08, DATA-03 | Scroll and focus | Scroll to bottom auto-loads; Load more focuses first new card; last page shows end note and no error (01-10-T2) |
| Skeleton, empty, offline and error states | BRW-09 | Network conditions | DevTools offline: first page shows "You appear to be offline" with Retry; "zzzz" shows the empty state; next-page failure keeps cards with inline Retry (01-09-T2, 01-09-T3, 01-10-T2) |
| Reduced motion | FND-07 | OS setting | `prefers-reduced-motion`: star-field and skeleton static (01-02-T2, 01-09-T3) |
| Lighthouse and axe pass | CARD-01, CARD-08, FND-01 | Audit tools in DevTools | Lighthouse accessibility run and one axe pass on `/browse`; explain any gradient-text "needs review" items (end-of-phase UAT) |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (every non-checkpoint task; the two checkpoints are human gates)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (no task references a test file that an earlier or the same task does not create)
- [x] No watch-mode flags
- [x] Per-task feedback latency < 30 s: every task's automated verify is the fast loop (`npm test && npx tsc --noEmit && npm run lint` plus the task's own check, estimated 10 to 25 s). `npm run build` and `scripts/smoke.ts` run only in the known-slow plan-end gates and the phase gate (measured at execution)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
