---
phase: "01"
slug: foundation-browse
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: "2026-11-12"
---

# Phase 01 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Register authored at plan time (10 plans). Verified by the security auditor against the implementation at branch `gsd/phase-01-foundation-browse`, with `npm test` at 120 of 120 passing. Block threshold: high.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Browser to rickandmortyapi.com | The only network egress, through a fixed `API_BASE` in `lib/api/client.ts` | Public character, episode and location data; filter and search text in the query string |
| URL query to app state | `/browse?q=&status=&gender=&species=` is user-controlled input | Untrusted strings, allow-list parsed |
| next/image optimizer to the avatar host | The optimizer fetches remote avatars | Public avatar images, restricted by `remotePatterns` |
| npm registry to the build | Dependency installs | Package code; one runtime dependency added (`@tanstack/react-query` 5.107.1) |
| Browser storage | None used in Phase 1 (no cookies, localStorage or sessionStorage) | n/a |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-01-01 | Tampering | lib/api/characters.ts query building | high | mitigate | `URLSearchParams` with a fixed key set; test proves `a&status=Dead` cannot inject a param | closed |
| T-01-02 | Denial of Service | lib/api/client.ts response handling | medium | mitigate | `res.ok` checked before `res.json()`; 429 HTML body becomes `ApiError` http 429 | closed |
| T-01-03 | Tampering | multi-ID path building | medium | mitigate | `toIdList` keeps positive safe integers only | closed |
| T-01-04 | Information Disclosure | ApiError messages | low | mitigate | Fixed messages; response bodies never copied into errors | closed |
| T-01-05 | Spoofing | footer external link | medium | mitigate | `target="_blank"` with `rel="noopener noreferrer"`; smoke asserts it | closed |
| T-01-06 | Information Disclosure | scripts/smoke.ts server binding | low | mitigate | `next start -H 127.0.0.1`; server killed in `finally` | closed |
| T-01-07 | Information Disclosure | app/layout.tsx font loading | low | mitigate | `next/font/google` self-hosts Inter at build time; no runtime third-party request | closed |
| T-01-08 | Tampering | filters.ts parse, use-browse-url.ts write | high | mitigate | Case-sensitive allow-lists; `q` trimmed and capped at 60 code points; history writes only through `buildBrowseUrl(window.location.pathname, ...)` | closed |
| T-01-09 | Denial of Service | lib/query/client.ts, options.ts | medium | mitigate | AbortSignal forwarded to fetch; never retries 4xx, aborts, parse or unknown errors | closed |
| T-01-10 | Denial of Service | components/layout/mobile-menu.tsx focus trap | medium | mitigate | Trap active only while open; every close path restores focus; `inert` removed in effect cleanup. Code evidence only, no unit test | closed |
| T-01-11 | Tampering | components/layout/nav-links.tsx | low | accept | Link targets are a static constant list; no user-controlled href reaches the router | closed (accepted) |
| T-01-12 | Information Disclosure | next.config.ts images.remotePatterns | high | mitigate | Single pattern: https, `rickandmortyapi.com`, `/api/character/avatar/**`, empty search; pinned by `config.test.ts` | closed |
| T-01-13 | Tampering | components/card/card-avatar.tsx image src | medium | mitigate | `isAvatarUrl` guard mirrors remotePatterns; anything else renders the fallback tile | closed |
| T-01-14 | Tampering | components/card/character-card.tsx text | medium | mitigate | API strings render as React text children only; no raw-HTML injection API anywhere in app, components, lib or scripts | closed |
| T-01-15 | Denial of Service | lib/browse/steps.ts fill loop | medium | mitigate | `STEP_MAX_API_PAGES` = 4; abort checked between sub-requests; unit-tested cap | closed |
| T-01-16 | Tampering | lib/browse/species.ts matching | low | mitigate | Strict comparison against allow-listed chip values | closed |
| T-01-17 | Denial of Service | components/browse/search-field.tsx | medium | mitigate | 300 ms debounce; only the committed value reaches the URL and query key | closed |
| T-01-18 | Tampering | search text to URL and API | medium | mitigate | `maxLength={60}` plus the 60-code-point cap on parse; `URLSearchParams` only | closed |
| T-01-19 | Denial of Service | lib/query/options.ts humanoidCountOptions | low | mitigate | Enabled only for the Human chip after page 1 settles; one page-1 request per filter set, 1 h cache | closed |
| T-01-20 | Tampering | lib/query/options.ts query keys | low | mitigate | Keys from allow-listed `filtersKey` in fixed order | closed |
| T-01-21 | Information Disclosure | components/browse/error-panel.tsx | low | mitigate | Fixed UI-SPEC copy only; no error message, status or body rendered | closed |
| T-01-22 | Denial of Service | Retry button | low | mitigate | `aria-disabled` while fetching and presses ignored; TanStack dedupes in-flight queries | closed |
| T-01-23 | Denial of Service | components/browse/load-more.tsx observer | medium | mitigate | Observer fires only when `hasNextPage` and not fetching and no next-page error; auto-load pauses after a failure until Retry | closed |
| T-01-24 | Tampering | router fallback and scroll-memory hook | low | mitigate | Not applicable: spike decision `native-ok`, so neither was built (`use-scroll-memory.ts` does not exist; no router fallback, no storage) | closed (not applicable) |
| T-01-SC (01-01) | Supply chain | npm install of @tanstack/react-query | high | mitigate | Blocking-human legitimacy checkpoint; the user's reply "approved 5.107.1" is recorded in `01-01-SUMMARY.md` | closed |
| T-01-SC (01-03) | Supply chain | npm install of @tanstack/react-query | high | mitigate | Exact pin `5.107.1`, `--save-exact`; dependencies are exactly next, react, react-dom and @tanstack/react-query; lockfile adds only `@tanstack/query-core` and `@tanstack/react-query` | closed |
| T-01-SC (01-02, 01-04 to 01-10) | Supply chain | package installs | low | accept | These plans install no packages; `git log` on package.json and the lockfile confirms only the scaffold, 01-01 and 01-03 touched them | closed (accepted) |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `workflow.security_block_on` count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01-01 | T-01-11 | Nav link targets are a static `as const` list; no user-controlled href reaches the router. Verified true in `nav-links.tsx`, `header.tsx` and the page files | Plan-time disposition (accept); rationale verified by the security auditor | 2026-11-12 |
| AR-01-02 | T-01-SC (plans 01-02, 01-04 to 01-10) | These plans install no packages. Verified through git history on package.json and package-lock.json | Plan-time disposition (accept); rationale verified by the security auditor | 2026-11-12 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-11-12 | 34 (24 numbered threats plus the T-01-SC row from each of 10 plans) | 34 | 0 | gsd-security-auditor |

Notes from the audit:
- No unregistered threat flags. Every SUMMARY `## Threat Flags` section that exists reports none. `01-07-SUMMARY.md` has no such section; T-01-17 and T-01-18 were verified directly in code.
- T-01-10 (mobile menu focus trap) is verified by code reading only, with no unit test. Its behaviour was confirmed by the human UAT pass (test 21).

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-11-12
