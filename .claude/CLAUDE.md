<!-- GSD:project-start source:PROJECT.md -->

## Project

**Portal Dex**

Portal Dex is a responsive web app that turns every character from the public Rick and Morty API into a holographic collectible card. Fans browse, search, filter, flip and favourite cards, and pull random characters out of an animated portal. It has no backend, no authentication and no database: all data comes from the public API at runtime, and favourites live in `localStorage`. It is an unofficial fan project with original branding only.

**Core Value:** Browsing and collecting characters must feel delightful: cards that tilt, flip and glow, and a portal that reveals a random character, all in a dark "cosmic" UI that stays fast and fully accessible (WCAG 2.1 AA).

### Constraints

- **Tech stack**: Next.js (App Router) + TypeScript, Tailwind CSS, TanStack Query, Motion (`motion/react`), browser View Transitions, `next/image`, Inter via `next/font`, Vercel hosting — decided in the spec
- **Dependencies**: No other libraries (including test libraries) without asking the user first
- **Timeline**: 2 days across 4 GSD phases (Foundation + Browse, Card effects + Portal, Detail + Collection, Light polish)
- **Accessibility**: WCAG 2.1 AA, with `prefers-reduced-motion` honoured everywhere
- **Performance**: Only animate `transform` and `opacity`; multi-ID requests instead of N+1 fetching; Lighthouse 90+ on desktop for Performance and Accessibility
- **Data**: `staleTime` of at least 1 hour and no refetch on window focus; never hardcode API counts
- **Branding**: Original wordmark "Portal Dex" only; no show assets or quotes
- **Manual step**: The Vercel deploy needs the user's Vercel account

<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-fast` for a trivial task inline, with no subagents and no PLAN.md
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
