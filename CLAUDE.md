# Legalcitation (Bluebook AI)

## Commands

```bash
npm install              # Install all workspace dependencies (always from repo root)
npm run typecheck        # TypeScript type checking across all packages
npm test                 # Run all tests with Vitest
npm run build            # Build all packages and apps (order matters, handled by script)
npm run lint             # ESLint across the monorepo
npm run dev              # Start both web and API dev servers
```

## What This Is

A legal citation tool that validates and formats citations according to The Bluebook: A Uniform System of Citation. Users paste or type legal citations and get back corrections, formatting suggestions, and verification against known sources. The web app (React + Vite) communicates with an Express API that uses a citation parsing pipeline, Bluebook rule engine, and AI-powered verification service.

## Project Structure

```
apps/
  web/          - React + Vite frontend (SPA, Tailwind CSS)
  api/          - Express REST API (Node 22)
packages/
  shared/            - Shared TypeScript types and utilities
  citation-parser/   - Parses raw citation strings into structured objects
  rule-engine/       - Applies Bluebook formatting rules
  verification/      - Verifies citations using Anthropic Claude SDK
drizzle/             - Database migration files (do not edit directly)
```

This is an npm workspaces monorepo. All packages are TypeScript with strict mode enabled.

## Key Conventions

- **TypeScript strict mode** everywhere. No `any`. No unused variables or imports.
- **Vitest** for all tests. Test files use `*.test.ts` or live in `__tests__/` directories.
- **Drizzle ORM** for database access. Schema is in `apps/api/src/db/`. Use Drizzle Kit to generate migrations — never edit migration files in `drizzle/` directly.
- **Named exports only** — no default exports.
- Always run `npm install` from the repository root, never inside individual workspaces.

## Things to Know

- `packages/shared` is a dependency of nearly every other package. Changes there can break multiple workspaces — always run `npm run typecheck` after modifying shared types.
- `citation-parser` and `rule-engine` have no external service dependencies and can be tested independently.
- `verification` package may need mocked HTTP responses in tests.
- The API requires `DATABASE_URL` (PostgreSQL) and `REDIS_URL` environment variables at runtime. In CI, database-dependent tests are skipped or mocked.
- The build script has a specific order (shared → parser → rules → verification → api → web). The root `npm run build` handles this automatically.

## CI Pipeline

The CI workflow (`.github/workflows/ci.yml`) runs on push to main and PRs:
1. `npm run typecheck` — must pass with zero errors
2. `npm test` — all Vitest tests must pass
3. `npm run build` — production build must succeed

Ensure changes pass all three before considering work complete.
