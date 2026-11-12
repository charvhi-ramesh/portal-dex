# Phase 01 code review disposition

Source: `01-REVIEW.md` (standard depth, 55 files, 0 critical, 6 warnings, 6 info). Every finding started `open`. WR-01 to WR-06 are now fixed; the info items remain open. Advisory only: this file never blocks the phase.

| ID | Severity | Where | Summary | Disposition |
|----|----------|-------|---------|-------------|
| WR-01 | warning | browse-view.tsx:173 | `setQueryData` updater returns old data, resetting `dataUpdatedAt` so a cache older than 1 hour reads as fresh | fixed (4ff4c2e) |
| WR-02 | warning | browse-view.tsx:82-92, 215-235 | After a first-page Retry succeeds, focus falls to `body` | fixed (cf89e93) |
| WR-03 | warning | browse-view.tsx:104-135, load-more.tsx:59-75 | Focus can be lost when a scroll-started load ends the list or fails, or when Retry adds no card | fixed (7d6d5eb) |
| WR-04 | warning | browse-view.tsx:52-66, 160-165 | If the Humanoid count request fails under the Human chip, "Counting..." stays and no total is announced | fixed (70abf15) |
| WR-05 | warning | mobile-menu.tsx:57-60 | Menu stays open and page stays inert when a link targets the current route | fixed (aa64cff) |
| WR-06 | warning | browse-view.tsx:100-135 | `pendingFocusIndex` not tied to the filter key; a filter change during Load more can steal focus | fixed (1a4da78) |
| IN-01 | info | client.ts | Abort during body read becomes a "parse" ApiError | open |
| IN-02 | info | client.ts | No request timeout | open |
| IN-03 | info | steps / browse-view | A step can return zero cards with a next page | open |
| IN-04 | info | load-more.tsx | Inline next-page Retry gives no feedback while retrying | open |
| IN-05 | info | card components | Image alt repeats the heading; focusable article has no accessible name; early image failure never reaches the fallback | open |
| IN-06 | info | repo | `tsconfig.tsbuildinfo` tracked, no `engines` field, scaffold comment in next.config.ts, duplicated committed value in SearchField, `SMOKE_PORT` not validated | open |

Note: WR-04 and the "Counting..." interim state were already flagged in the 01-07 and 01-08 summaries. WR-02 and WR-03 touch the focus requirements the end-of-phase UAT will exercise.
