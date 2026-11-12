---
phase: 01-foundation-browse
plan: 02
subsystem: ui
tags: [nextjs, tailwind, next-font, wcag-contrast, star-field, smoke-test, accessibility]

requires:
  - phase: 01-foundation-browse
    provides: "Plan 01-01 test harness and tsconfig verbatimModuleSyntax (type-only imports enforced)"
provides:
  - "Dark-only @theme tokens, base styles, teal focus ring, 80px scroll padding and CSS-only star field (app/globals.css)"
  - "Root layout with Inter, title template, skip link, star field, Providers seam, main#main-content and footer#site-footer"
  - "Interim / and /collection pages, each with exactly one h1"
  - "scripts/check-contrast.ts FND-01 gate including the star dot composited at the 15% cap"
  - "scripts/smoke.ts zero-dependency production smoke runner (next start on 127.0.0.1 plus HTML assertions)"
affects: [01-03, 01-04, 01-05, 01-06, phase-02, phase-03]

actuals:
  tokens: 6200
  tasks: 2
  commits: 2
plan_head_before: 93d2f5068386369e9a35425fbc7b5de888c7789e
plan_head_after: 33d140b5b1ef7f7f0ede13acc1f40cdd02dacc93

tech-stack:
  added: []
  patterns:
    - "Page background on html, body transparent, so the fixed z-index -1 star layer stays visible"
    - "Star layers are oversized by one tile and animate translate3d by exactly one tile (seamless, transform only)"
    - "Token contrast verified in code by parsing app/globals.css, not by hand-copied numbers"
    - "Scripts run with Node type stripping: import type for type-only names, no enums, no parameter properties"
    - "Single client provider seam (app/providers.tsx) wrapped around main and footer; header slot reserved before main"

key-files:
  created:
    - scripts/check-contrast.ts
    - scripts/smoke.ts
    - components/layout/footer.tsx
    - components/layout/star-field.tsx
    - app/providers.tsx
    - app/collection/page.tsx
  modified:
    - app/globals.css
    - app/layout.tsx
    - app/page.tsx

key-decisions:
  - "Skip link is a plain .skip-link class in globals.css (fixed, translateY(-300%) off-screen, transform none on :focus) instead of sr-only/not-sr-only utilities, avoiding Tailwind utility-order ambiguity between not-sr-only and fixed"
  - "check-contrast strips CSS comments before parsing so a commented-out token cannot satisfy the gate"
  - "Footer bg and border span full width with the 1280px container nested inside, so the opaque footer never lets star dots sit under its text"

patterns-established:
  - "Interim pages share one section layout (pt-8 sm:pt-12, h1 tabIndex -1 with focus:outline-none, muted body, blue pill Link)"
  - "Primary button press feedback: active:scale-[0.97] 150ms, removed under motion-reduce"

requirements-completed: [FND-01, FND-03, FND-05, FND-07]

coverage:
  - id: D1
    description: "Dark @theme tokens are gated by a contrast check covering every UI-SPEC text, border, focus and frame pair, including text, text-muted and blue over the star dot composited at the 15% cap"
    requirement: "FND-01"
    verification:
      - kind: other
        ref: "node scripts/check-contrast.ts (31 pairs, last line CONTRAST OK)"
        status: pass
      - kind: other
        ref: "negative runs on modified copies of globals.css: missing token, missing --star-dot-opacity, 3-digit hex, opacity 0.35 all exit 1 with CONTRAST FAIL"
        status: pass
    human_judgment: false
  - id: D2
    description: "Production build serves the dark shell: skip link, main-content target, interim home h1, star-field markup, footer link and disclaimer with rel noopener noreferrer, and /collection with its h1 and 'Collection · Portal Dex' title"
    requirement: "FND-03"
    verification:
      - kind: integration
        ref: "npm run build && node scripts/smoke.ts route:/ ... route:/collection ... (11 PASS lines, SMOKE OK)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Smoke runner starts next start on 127.0.0.1, asserts served HTML per route, rejects bad usage with exit 2, and always stops the server"
    verification:
      - kind: integration
        ref: "node scripts/smoke.ts (no args) exit 2; route:/ with no expectation exit 2; full gate exit 0; no leftover next start process on the smoke port"
        status: pass
    human_judgment: false
  - id: D4
    description: "First Tab stop is 'Skip to content' and Enter moves focus into main; footer is stacked at 320 px and one row at 1280 px; no horizontal scroll at 320 px"
    requirement: "FND-05"
    verification: []
    human_judgment: true
    rationale: "Keyboard focus order and responsive layout need a browser; no browser automation is installed (planning decision 3). Served HTML only proves the link and target exist"
  - id: D5
    description: "Star dots drift slowly by transform only behind content and are static under prefers-reduced-motion: reduce"
    requirement: "FND-07"
    verification: []
    human_judgment: true
    rationale: "Motion and painting order (z-index -1 layer over the html background, RESEARCH Pitfall 10, assumed A6) can only be judged visually in a browser; the CSS rules are present and the media query is in globals.css"

duration: 8min
completed: 2026-11-12
status: complete
---

# Phase 1 Plan 02: Dark Cosmic Shell Summary

**Dark-only Portal Dex shell with Inter, skip link, star-field drift (static under reduced motion), disclaimer footer and interim home and collection pages, gated by a 31-pair contrast check that includes the 15%-composited star dot and proven end to end by a production build plus a zero-dependency smoke runner.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-11-12T00:48:09Z
- **Completed:** 2026-11-12T00:56:05Z
- **Tasks:** 2 (1 tracer, 1 auto)
- **Files modified:** 9 (6 created, 3 modified)

## Accomplishments

- `scripts/check-contrast.ts` parses `app/globals.css`, self-checks the maths (21.00, #767676 passes and #777777 fails at 4.5, symmetric ratio, strict `#RRGGBB`), enforces the 0.15 star-dot cap in code, and prints 31 PASS lines ending in `CONTRAST OK`. Composited worst case: text 12.54, text-muted 6.51, blue 5.20 (all at least 4.5).
- Root layout now uses Inter (`next/font/google`, variable `--font-inter`), the `%s · Portal Dex` title template, a first-in-DOM skip link, `StarField`, a `Providers` seam wrapping `main#main-content` and `footer#site-footer`, with a clear slot before main for the plan 01-04 header.
- `/` and `/collection` are real interim pages with one `h1` each and a link to `/browse`; `/collection` has the document title "Collection · Portal Dex".
- `scripts/smoke.ts` serves the production build on 127.0.0.1 (free OS port or `SMOKE_PORT`), asserts status 200 and substrings per route, and always kills the server tree. The plan's slow gate passed: `npm run build` exit 0, then 11 PASS lines and `SMOKE OK`.

## Task Commits

1. **Task 1: Dark shell served from a production build (tracer)** - `5fa04ec` (feat)
2. **Task 2: Footer, star field, providers seam and interim Collection page** - `33d140b` (feat)

**Plan metadata:** recorded in the docs commit that follows this SUMMARY (docs: complete plan).

Tracer gate: `<verify>` was automated-only and `HUMAN_VERIFY_MODE` end-of-phase, so the tracer verify (`node scripts/check-contrast.ts && npx tsc --noEmit && npm run lint`) was re-run after Task 1 and again after Task 2; both passed, and the production build plus smoke later proved the slice end to end.

## Files Created/Modified

- `app/globals.css` - dark `@theme` tokens, `--star-dot-opacity: 0.15`, html/body base, focus ring, `.skip-link`, `.star-field` and `.star-layer-1..3` with `star-drift` keyframes and the reduced-motion rule
- `app/layout.tsx` - Inter, metadata title template, skip link, StarField, Providers, main landmark, Footer
- `app/page.tsx` - interim home (replaced by the portal in Phase 2, HOME-01)
- `app/collection/page.tsx` - interim Collection page (replaced in Phase 3, COL-04)
- `app/providers.tsx` - `'use client'` seam returning children (plan 01-03 adds QueryClientProvider)
- `components/layout/footer.tsx` - API link (new tab, `noopener noreferrer`, sr-only "(opens in new tab)") and unofficial-fan-project disclaimer
- `components/layout/star-field.tsx` - decorative `aria-hidden` wrapper with three layers
- `scripts/check-contrast.ts` - FND-01 contrast gate CLI
- `scripts/smoke.ts` - production smoke CLI

## Decisions Made

- Skip link implemented as a `.skip-link` rule in `globals.css` (off-screen via `translateY(-300%)`, `transform: none` on `:focus`). The plan said "sr-only until focused"; the visual contract is the same, and a single class avoids relying on Tailwind's relative ordering of `not-sr-only` and `fixed` under the `focus:` variant.
- Contrast script strips CSS comments before parsing and validates only the tokens the pairs use; `--color-*: initial` is ignored by the token regex.
- Footer background and divider are full width with the 1280 px container nested inside, keeping the footer opaque so stars never sit under its text.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- **Open item (inherited from 01-01), MODULE_TYPELESS_PACKAGE_JSON warning:** `node scripts/check-contrast.ts` and `node scripts/smoke.ts` print Node's "Module type ... is not specified" warning on stderr because `package.json` has no `"type"`. Exit codes are unaffected. Adding `"type": "module"` is still deferred (it can affect Next config loading); decide in a later plan.
- **Pre-existing process, not touched:** a `next` server (`start-server.js`, started the previous day) is listening on port 3000 in this checkout. The smoke runner used its own free port and its own server was confirmed stopped. `npm run build` rewrote `.next/` while that process exists, so the user may want to restart it.
- **Human check not run:** Task 2's `<human-check>` (browser Tab, 320/1280 px layout, reduced-motion toggle) needs a browser and is recorded as `human_judgment: true` for D4 and D5 and in `.planning/WINDOWS.md` if the ledger exists.

## Known Stubs

None. The interim home and Collection pages are intentional, planned placeholders (planning decision 2) with real h1 and links, to be replaced by Phase 2 (HOME-01) and Phase 3 (COL-04). `Providers` returns children by design until plan 01-03.

## Threat Flags

None. T-01-05 (tabnabbing) is mitigated and asserted by smoke (`noopener noreferrer` served in HTML); T-01-06 is mitigated (`next start -H 127.0.0.1`, server killed in `finally`, verified no leftover process); T-01-07 holds (Inter self-hosted at build by `next/font/google`); T-01-SC: no packages installed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 01-03 can add `QueryClientProvider` inside `app/providers.tsx` and use `main#main-content`.
- Plan 01-04 inserts the header inside `Providers` before `main` and uses `main#main-content` and `footer#site-footer` as inert targets; re-check focus-obscuring under the sticky header there (flagged assumption FND-05).
- Browser verification of the skip link, star-field drift and reduced motion is still owed at the phase gate.

## Self-Check: PASSED

- Created files exist: scripts/check-contrast.ts, scripts/smoke.ts, components/layout/footer.tsx, components/layout/star-field.tsx, app/providers.tsx, app/collection/page.tsx (present in the `93d2f50..HEAD` diff, 9 files).
- Commits `5fa04ec` and `33d140b` are ancestors of HEAD; `git rev-list --count 93d2f50..HEAD` is 2.
- Re-run: `node scripts/check-contrast.ts` CONTRAST OK, `npx tsc --noEmit` and `npx tsc --noEmit --verbatimModuleSyntax` exit 0, `npm run lint` exit 0, all task acceptance greps exit as required, `npm run build` exit 0, smoke gate SMOKE OK.

---
*Phase: 01-foundation-browse*
*Completed: 2026-11-12*
