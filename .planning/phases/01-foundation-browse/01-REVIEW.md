---
phase: 01-foundation-browse
reviewed: 2026-11-12T00:00:00Z
depth: standard
files_reviewed: 55
files_reviewed_list:
  - app/browse/page.tsx
  - app/collection/page.tsx
  - app/globals.css
  - app/layout.tsx
  - app/page.tsx
  - app/providers.tsx
  - components/browse/browse-fallback.tsx
  - components/browse/browse-view.tsx
  - components/browse/character-grid.tsx
  - components/browse/empty-panel.tsx
  - components/browse/error-panel.tsx
  - components/browse/filter-bar.tsx
  - components/browse/filter-group.tsx
  - components/browse/live-region.tsx
  - components/browse/load-more.tsx
  - components/browse/results-toolbar.tsx
  - components/browse/search-field.tsx
  - components/browse/use-browse-url.ts
  - components/browse/use-online-status.ts
  - components/card/card-avatar.tsx
  - components/card/card-skeleton.tsx
  - components/card/character-card.tsx
  - components/layout/footer.tsx
  - components/layout/header.tsx
  - components/layout/mobile-menu.tsx
  - components/layout/nav-links.tsx
  - components/layout/route-focus.tsx
  - components/layout/star-field.tsx
  - components/layout/use-media-query.ts
  - lib/api/avatar.ts
  - lib/api/characters.ts
  - lib/api/client.test.ts
  - lib/api/client.ts
  - lib/api/endpoints.test.ts
  - lib/api/normalize.ts
  - lib/api/resources.ts
  - lib/api/types.ts
  - lib/browse/announce.test.ts
  - lib/browse/announce.ts
  - lib/browse/filters.test.ts
  - lib/browse/filters.ts
  - lib/browse/species.test.ts
  - lib/browse/species.ts
  - lib/browse/steps.test.ts
  - lib/browse/steps.ts
  - lib/config.test.ts
  - lib/query/client.test.ts
  - lib/query/client.ts
  - lib/query/options.test.ts
  - lib/query/options.ts
  - next.config.ts
  - package.json
  - scripts/check-contrast.ts
  - scripts/smoke.ts
  - tsconfig.json
findings:
  critical: 0
  warning: 6
  info: 6
  total: 12
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-11-12
**Depth:** standard
**Files Reviewed:** 55 (package-lock.json skipped as generated)
**Status:** issues_found

## Summary

No security vulnerabilities were found. The URL and filter path is sound. Chip values are allow-listed by exact match. `q` is trimmed, capped and sent through `URLSearchParams`. Only `buildBrowseUrl(window.location.pathname, ...)` is ever passed to the History API. Avatar URLs are guarded twice, in `isAvatarUrl` and in `remotePatterns`. API text is only rendered as React children. The exact-species step loop terminates, because every iteration either returns or increments `calls`, which is capped at 4. It cannot produce duplicates across steps, because the next step starts at `page + 1`, and `flattenSteps` de-duplicates anyway. `networkMode: "always"`, `staleTime` of 1 hour and no refetch on focus all match the project constraints. The mobile menu traps Tab correctly and restores focus on Escape.

The defects are in focus management and live-region behaviour (keyboard and screen-reader users lose their place in three situations). There is also a cache-freshness bug in `applyFilters`, and a Human-total failure mode where "Counting..." never resolves. Each finding was checked against the source, and the TanStack behaviour in WR-01 was checked in the installed `query-core`.

## Warnings

### WR-01: `applyFilters` resets `dataUpdatedAt` on every cached filter set, so stale data is treated as fresh

**File:** `components/browse/browse-view.tsx:173-182`
**Issue:** The updater passed to `setQueryData` returns `data` unchanged when there is nothing to trim. In the installed `query-core`, `setQueryData` returns early only when the updater returns `undefined` (`queryClient.ts:312`). Any other value goes through `Query.setData`, which dispatches a `success` action with `dataUpdatedAt: undefined`. `successState` then stamps `dataUpdatedAt ?? Date.now()` (`query.ts:1075`). So every chip toggle, Clear all or typed search restarts the one-hour `staleTime` clock for the target key. The target key may have been cached more than an hour ago. Instead of revalidating, the user is shown the old data, and the 1-hour freshness guarantee (DATA-05) is silently extended indefinitely.
**Fix:** Write only when trimming is needed, and return `undefined` otherwise, which is a no-op.
```ts
queryClient.setQueryData(browseOptions(next).queryKey, (data) =>
  data && data.pages.length > 1
    ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) }
    : undefined,
);
```
If the trim should keep the original timestamp, pass `{ updatedAt: query.state.dataUpdatedAt }` read from `queryClient.getQueryState(key)`.

### WR-02: Focus is lost after a successful first-page Retry

**File:** `components/browse/browse-view.tsx:82-92, 215-235`
**Issue:** The error panel is deliberately kept mounted so the focused Retry button survives the refetch. When the retry succeeds, `showError` becomes false and the panel, including the focused button, unmounts. Nothing hands focus on. `document.activeElement` falls back to `body`, so a keyboard or screen-reader user is dropped at the top of the document. This is the same class of problem the Load more path handles via `pendingFocusIndex`, but the first-page path has no equivalent. (A first-page Retry that fails again is fine, because the button stays.)
**Fix:** After a retry resolves with data, focus the first card, or the empty panel's heading or button if the result is empty. Reuse the `pendingFocusIndex` pattern, for example by setting it to 0 in `retry()` and letting the existing effect focus `gridRef.current.children[0]`. The effect also needs to run when `query.data` first appears.

### WR-03: Scroll-triggered loads can unmount the focused Load more or Retry control and drop focus

**File:** `components/browse/browse-view.tsx:104-108, 121-135`; `components/browse/load-more.tsx:59-75, 111-124`
**Issue:** Focus hand-off only happens when `pendingFocusIndex` is set, and it is set only for `trigger === "button"`. The sentinel sits directly below the Load more button with a 400 px lookahead. Whenever the button is on screen, the observer is already firing a `"scroll"` load. A keyboard user who tabs to Load more is therefore usually racing an automatic load. If that scroll-started load ends the list (the button is replaced by the end note), or fails (the button is replaced by the inline alert and Retry), the focused element is unmounted and focus falls to `body`. The same happens after a Retry press that succeeds but adds no new unique card, because the Retry row unmounts, no card exists at `index`, and `hasNextPage` is still true.
**Fix:** In the focus effect, also handle "focus was inside the load-more region and is now on body". Capture `document.activeElement` before the fetch in `loadMore` and `retryNextPage`, regardless of trigger. When the load settles and the element is detached, apply the same hand-off: first new card, else end note, else the inline Retry, else the Load more button.

### WR-04: A failed Humanoid count leaves "Counting..." on screen forever and never announces a total

**File:** `components/browse/browse-view.tsx:52-66, 160-165`; `components/browse/results-toolbar.tsx:28-34`
**Issue:** With the Human chip active, `total` stays `null` until `humanoid.data` arrives. If the count-only request fails (429, 5xx, network), `humanoid.data` stays `undefined`, so `total` is `null` for as long as the filter is active. The toolbar shows "Counting..." indefinitely while cards are visible. The live-region effect returns early on `total === null`, so no count is ever announced. The code comment says this is intentional ("the total stays null"). The toolbar prop `unavailable` shows that the same never-ending "Counting..." was recognised as a defect for the first-page failure, but it is not handled here. There is also no recovery path other than changing the filter.
**Fix:** Distinguish "pending" from "failed". When `humanoid.isError`, render a neutral count state, for example nothing or "Count unavailable", and announce it once. Alternatively, fall back to a computed "at least N loaded" wording. Pass the failure into `ResultsToolbar` the same way as `unavailable`.

### WR-05: The mobile menu stays open (and the page stays inert) after tapping a link to the current route

**File:** `components/layout/mobile-menu.tsx:57-60`
**Issue:** Open state is derived from `openPath === pathname`, and a route change is the only thing that closes the menu. Tapping "Browse" while on `/browse` does not change `pathname`. Tapping it from `/browse?q=rick` navigates to `/browse`, which resets the filters, but `pathname` is unchanged. In both cases the menu remains open, `main-content` and the footer remain `inert`, and `RouteFocus` (keyed on `pathname`) never runs. Nothing visibly happens, apart from the filters silently clearing behind the dimmer, until the user finds the hamburger.
**Fix:** Close on link activation instead of only on pathname change.
```tsx
<div ref={panelRef} ... onClick={(e) => {
  if ((e.target as HTMLElement).closest("a[href]")) setOpenPath(null);
}}>
```
Add the same behaviour to the `NavLinks` menu variant if you prefer an explicit `onNavigate` prop.

### WR-06: A stale `pendingFocusIndex` can steal focus after a filter change

**File:** `components/browse/browse-view.tsx:100, 106, 113, 121-135`
**Issue:** `pendingFocusIndex` is a ref that is cleared only when the focus effect runs with `isFetchingNextPage === false`. It is not tied to the filter key. If the user presses Load more and then changes a filter before the fetch settles, the effect re-runs on the key change. When the target key is already cached with more than `index` cards, which is the normal case for toggling back to a previously viewed filter, `gridRef.current.children[index]` resolves to a card from a different result set. That card then takes focus, pulling it off the chip or search field the user was operating. When the target key is not cached, the effect clears the ref harmlessly.
**Fix:** Store the key together with the index, `{ key: currentKey, index }`, and ignore and clear the request when `currentKey` differs.

## Info

### IN-01: `getJson` maps an abort during body read to an `ApiError("parse")`, contradicting its own contract

**File:** `lib/api/client.ts:46-50`
**Issue:** The doc comment says an aborted request rejects with the original abort reason and never an `ApiError`. That holds for `fetch`, but `res.json()` can also reject with `AbortError` when the signal fires mid-body. The surrounding `catch {}` turns it into `ApiError("parse", ...)`. TanStack ignores the result of a cancelled query, so there is no user-visible effect today, but the step loop's `throw signal.reason` path and `shouldRetry`'s `AbortError` check assume the contract holds.
**Fix:** `catch (e) { if (signal?.aborted) throw e; throw new ApiError("parse", ...); }`

### IN-02: No request timeout, so a hung API call keeps skeletons or "Loading more..." up forever

**File:** `lib/api/client.ts:36`
**Issue:** `fetch(API_BASE + path, { signal })` has no timeout. A stalled connection neither errors nor aborts, so the first-page skeleton or the Load more spinner never resolves into the Retry UI, and a step reads up to four pages sequentially. This is not a regression, but it undermines BRW-09's "failure shows a Retry" guarantee for the stalled case.
**Fix:** Combine the caller's signal with `AbortSignal.timeout(15_000)` via `AbortSignal.any([...])`, and map a timeout abort to `ApiError("network", ...)`.

### IN-03: A step can return zero cards with a next page, rendering an empty `<ul>` plus Load more

**File:** `components/browse/browse-view.tsx:229-259`; `lib/browse/steps.ts:63-64`
**Issue:** When four consecutive API pages contain no exact matches (for example Human after a run of Humanoid-only pages), the first step returns `items: []` with `nextPage` set. The empty-state test is `characters.length === 0 && !query.hasNextPage`, so the view renders an empty list and a Load more button, and announces the settled count while no cards are visible. The sentinel does auto-continue, so it recovers, but a keyboard or screen-reader user sees a count with nothing shown. `options.test.ts` already exercises this exact shape (`step.items.length === 0`, `nextPage === 5`).
**Fix:** Treat `characters.length === 0 && hasNextPage && !isFetchingNextPage` as loading: keep the skeleton row and trigger the next step, rather than showing an empty grid. Also hold the count announcement until the first cards exist.

### IN-04: The inline next-page Retry gives no feedback while retrying

**File:** `components/browse/load-more.tsx:98-109`
**Issue:** While `isFetchingNextPage` is true the Retry button is `aria-disabled`, but it has no `aria-disabled:` styling and its label does not change. Load more switches to "Loading more...", but Retry shows nothing. Sighted users see no response to the press, and screen-reader users hear no change.
**Fix:** Use the same pattern as Load more: show "Retrying..." (or `aria-disabled:opacity-60`) while fetching.

### IN-05: Card image `alt` duplicates the visible name heading, and the focusable article has no accessible name

**File:** `components/card/card-avatar.tsx:54`; `components/card/character-card.tsx:25-45`
**Issue:** The image has `alt={name}` and the `<h2>` immediately after it repeats the same name, so screen readers read each name twice. The `article` that receives programmatic focus (Load more hand-off) has no `aria-labelledby`, so it is announced without a name. Separately, the CardAvatar `ref` callback only recovers an image that finished loading before hydration. An image that failed before hydration (`complete && naturalWidth === 0`) never fires `onError` and stays at `opacity-0` with no initial fallback.
**Fix:** Use `alt=""` for the decorative avatar, since the heading carries the name. Add `aria-labelledby` pointing at the heading id on the article. In the ref callback, also set `"error"` when `img.complete && img.naturalWidth === 0`.

### IN-06: Repository hygiene and small leftovers

**File:** `tsconfig.json:18`; `package.json:10, 20`; `next.config.ts:4`; `components/browse/search-field.tsx:20-21, 34`; `scripts/smoke.ts:84`
**Issue:**
- `tsconfig.tsbuildinfo` (produced by `"incremental": true`) is tracked by git and not listed in `.gitignore`. It is a generated artifact that churns on every type-check.
- `npm test` relies on unflagged Node type stripping (Node 22.18 or later), but `package.json` has no `engines` field, and `@types/node` is `^20`, which does not describe that runtime.
- `next.config.ts` still carries the scaffold comment `/* config options here */`.
- `SearchField` keeps the same "last committed" value in both `committed` state and `committedRef`, which duplicates state that the render-phase adoption logic and the effect then have to keep in sync.
- `smoke.ts` does `Number(process.env.SMOKE_PORT)` without validating it, so a bad value becomes `NaN` and `next start -p NaN`.
**Fix:** Add `tsconfig.tsbuildinfo` to `.gitignore` and `git rm --cached` it. Add `"engines": { "node": ">=22.18" }` and bump `@types/node`. Remove the scaffold comment. Collapse `SearchField`'s two copies of the committed value into one. Validate `SMOKE_PORT` with `Number.isInteger`.

---

_Reviewed: 2026-11-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
