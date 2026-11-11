---
phase: "01"
slug: "foundation-browse"
status: draft
nyquist_compliant: false
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
| **Quick run command** | `node --test lib/browse/species.test.ts` (single file) |
| **Full suite command** | `npm test && npx tsc --noEmit && npm run lint && npm run build` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** `node --test <changed file>` plus `npx tsc --noEmit`
- **After every plan wave:** `npm test && npx tsc --noEmit && npm run lint && npm run build`
- **Before `/gsd-verify-work`:** Full suite green and manual checklist signed off
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-W0-01 | TBD | 0 | FND-01 | — | N/A | unit (script) | `node scripts/check-contrast.ts` | ❌ W0 | ⬜ pending |
| 01-W0-02 | TBD | 0 | DATA-01 | — | Fixed base URL, `URLSearchParams` encoding | unit (stubbed fetch) | `node --test lib/api/characters.test.ts` | ❌ W0 | ⬜ pending |
| 01-W0-03 | TBD | 0 | DATA-02 | — | N/A | unit | `node --test lib/api/normalize.test.ts` | ❌ W0 | ⬜ pending |
| 01-W0-04 | TBD | 0 | DATA-03 | — | 429/HTML body raises `ApiError`, not a parse crash | unit | `node --test lib/api/client.test.ts lib/browse/steps.test.ts` | ❌ W0 | ⬜ pending |
| 01-W0-05 | TBD | 0 | DATA-05 | — | N/A | unit | `node --test lib/query/client.test.ts` | ❌ W0 | ⬜ pending |
| 01-W0-06 | TBD | 0 | BRW-03, BRW-05, BRW-06 | Allow-list rejects junk URL params | URL and filters round-trip, `q` capped at 60 | unit | `node --test lib/browse/filters.test.ts` | ❌ W0 | ⬜ pending |
| 01-W0-07 | TBD | 0 | BRW-04 | — | N/A | unit | `node --test lib/browse/species.test.ts lib/browse/steps.test.ts` | ❌ W0 | ⬜ pending |
| 01-W0-08 | TBD | 0 | BRW-07, BRW-08 | — | N/A | unit | `node --test lib/browse/announce.test.ts` | ❌ W0 | ⬜ pending |
| 01-W0-09 | TBD | 0 | PERF-01 | Narrow `remotePatterns` | Image optimizer limited to the avatar path | unit | `node --test lib/config.test.ts` | ❌ W0 | ⬜ pending |
| 01-ALL-01 | TBD | all | All | — | N/A | static | `npx tsc --noEmit && npm run lint && npm run build` | ✅ scripts exist | ⬜ pending |

*Task IDs and plan numbers are placeholders until plans exist. The planner must update this map.*
*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` `test` script and `tsconfig.json` `allowImportingTsExtensions` (optionally `erasableSyntaxOnly`)
- [ ] `lib/api/*.test.ts`, `lib/browse/*.test.ts`, `lib/query/client.test.ts`, `lib/config.test.ts`
- [ ] `scripts/check-contrast.ts` and the token source it parses from `app/globals.css`
- [ ] Install `@tanstack/react-query` after a `checkpoint:human-verify` (package flagged SUS for release freshness only)
- [ ] Runtime spike: Browse, scroll, placeholder `/collection`, Back. Record whether `scrollY` and filters survive and whether native `pushState` Back behaves

---

## Manual-Only Verifications

No zero-dependency browser automation exists, because Playwright and axe need user approval. These run at the end-of-phase human-verify checkpoint. Use visible-element selectors only, since hidden Activity routes stay in the DOM.

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Skip link and focus on `main` | FND-03 | No browser automation | Tab from a fresh load: first stop is "Skip to content", Enter focuses `main` |
| Focus never hidden under sticky header; no horizontal scroll | FND-04 | Layout and focus | Tab through at 1280 and 320 px and at 200% zoom |
| Mobile menu trap and close | FND-05 | Focus behaviour | Open menu, Tab and Shift+Tab stay in menu and button; Escape, outside tap and navigation close it and return focus to the button |
| Focus on `h1`, title update, Browse state restore | FND-06, BRW-11 | Navigation behaviour | Go to `/collection`, then Back; filters, loaded pages and scroll restored |
| Debounce and URL history | BRW-02, BRW-03 | Timing in browser | Type "rick": one request after 300 ms, URL replaced, Back does not step through letters; chips push; Escape and x clear |
| Human chip and count announcement | BRW-04, BRW-07 | Live region | No Humanoid card; count shows "Counting..." then 366; live region never announces 434 |
| Infinite scroll, Load more focus, end note | BRW-08, BRW-09 | Scroll and focus | Scroll to bottom auto-loads; Load more focuses first new card; last page shows end note and no error |
| Offline and error states | BRW-10 | Network conditions | DevTools offline: first page shows "You appear to be offline" with Retry; next-page failure keeps cards with inline Retry |
| Reduced motion | FND-07 | OS setting | `prefers-reduced-motion`: star-field and skeleton static |
| Lighthouse and axe pass | CARD-01, CARD-08, FND-01 | Audit tools in DevTools | Lighthouse accessibility run and one axe pass on `/browse`; explain any gradient-text "needs review" items |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
