# AGENTS.md

This file provides repository-level guidance for coding agents and collaborators.

## Source of Truth

- Follow `docs/code-conventions.md` for project coding conventions.
- Cursor-specific always-on guidance lives in `.cursor/rules/*.mdc`.

## Agent Expectations

- Keep React component files under 300 lines.
- Split by concern as complexity grows:
  - UI structure in focused components
  - reusable state/effects in hooks
  - shared helper logic in utilities
  - shared feature interfaces in `types.ts`
- Prefer incremental, testable changes over large mixed refactors.
- Preserve existing behavior unless a change request explicitly asks for behavior changes.
