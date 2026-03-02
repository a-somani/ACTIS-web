# Next.js/React Frontend Conventions

These conventions apply to this Next.js project.

## General Principles

- Keep React Function Components (RFCs) under 300 lines.
- Keep code DRY by extracting repeated logic into components or hooks.
- Prefer readable code over clever abstractions.
- Add comments only when logic is not self-evident.
- Follow React performance best practices where they provide real value.
- Use Next.js best practices (`next/dynamic` for heavy client-only modules, appropriate data-fetching patterns).
- Prefer popular, well-maintained packages over custom one-off solutions.
- Keep styling minimal unless explicit design guidance is provided.
- Avoid dependency bloat; install only what is needed.

## Tech Stack

- Framework: Next.js (App Router or Pages Router)
- Language: TypeScript
- Styling: Tailwind CSS
- 3D graphics (when needed): Three.js with `ol-threejs-toolkit`
- Animation (when needed): GSAP, Framer Motion
- Component development: Storybook
- Deployment: Vercel

## Project Structure

```text
├── app/                    # Next.js App Router (or pages/ for Pages Router)
├── components/             # Reusable React components
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Third-party config and wrappers
├── scripts/                # Build/utility scripts
├── services/               # External service and HTTP API clients
├── styles/                 # Global styles and Tailwind config
├── typescript/             # Shared TypeScript definitions
│   ├── types/
│   ├── interfaces/
│   └── definitions/
└── utils/                  # Utilities and constants
    ├── constants.ts
    └── *.ts
```

## Organization Rules

- Components: keep focused and under 300 lines; extract visual sections and behavior as needed.
- Hooks: extract reusable state/effects to keep component files small.
- Services: one service concern per file in `services/`.
- Utils: pure helpers and constants in `utils/`.
- Types: shared interfaces/types in `typescript/` (or colocated `types.ts` when local to a feature).
- Lib: third-party initialization and configuration only.

## Best Practices

1. Keep RFCs under 300 lines.
2. Use dynamic imports for heavy/optional modules.
3. Keep type definitions explicit and reusable.
4. Keep constants centralized and named consistently.
5. Move reusable helper logic out of components.
6. Use React memoization intentionally (not by default).
7. Prefer established, maintained packages.
8. Keep styling simple and functional-first.

## Code Style

- Import ordering is handled by formatter tooling.
- Keep type-only imports explicit (`import type { Foo } from 'bar'`).
- Use Prettier for formatting consistency.
- Run TypeScript and lint checks before shipping changes.

## Commit Messages

Follow conventional commit format:

```text
<type>: <subject>
```

Common types:

- feat, fix, refactor, style, docs, test, chore, perf, build, ci, wip, motion, pxpush, improve

Rules:

- Header length <= 72 chars
- Lowercase type
- No period at end of subject
