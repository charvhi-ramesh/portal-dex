---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-11-12T00:58:14.218Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | unrun-verify | scripts/smoke.ts |  | 01-02 Task 2 human-check (browser Tab, 320/1280 px layout, reduced-motion toggle) not run; needs a browser | open |  | 2026-11-12T00:58:14.218Z |  |

````json
[
  {
    "id": 1,
    "kind": "unrun-verify",
    "phase": "01",
    "file": "scripts/smoke.ts",
    "line": null,
    "description": "01-02 Task 2 human-check (browser Tab, 320/1280 px layout, reduced-motion toggle) not run; needs a browser",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-11-12T00:58:14.218Z",
    "resolved_at": null,
    "milestone": null
  }
]
````
