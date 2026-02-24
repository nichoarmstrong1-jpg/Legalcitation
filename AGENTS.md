## Cursor Cloud specific instructions

### Services overview

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Express API | `npm run dev:api` | 3001 | Uses `tsx watch` for hot-reload |
| Vite Frontend | `npm run dev:web` | 5173 | Proxies `/api` to the API server |
| Both (concurrent) | `npm run dev` | 3001 + 5173 | |

Standard commands (`npm run typecheck`, `npm test`, `npm run lint`, `npm run build`) are documented in `CLAUDE.md`.

### Docker services

PostgreSQL 16 and Redis 7 run via `docker-compose.yml`. Start them with:

```bash
sudo dockerd &>/tmp/dockerd.log &  # if Docker daemon isn't running
sudo docker compose up -d postgres redis
```

The API gracefully degrades without these services, but full auth and caching features require them.

### Environment setup

A `.env` file is needed at the repo root. Copy from `.env.example` and set at minimum:

- `DATABASE_URL=postgresql://legalcitation:localdev@localhost:5432/legalcitation`
- `REDIS_URL=redis://localhost:6379`
- `JWT_SECRET=local-dev-secret-change-in-production`

The API starts without `ANTHROPIC_API_KEY` — citation analysis still works but AI-powered verification is disabled.

### Gotchas

- **Integration tests require built packages.** `npm run build` must run before `npm test` to pass integration tests in `citation-parser` and `rule-engine`. The integration tests import from compiled output of sibling workspace packages.
- **One pre-existing test failure** in `apps/api/src/services/__tests__/verification-cache.test.ts` — expects a spy to be called 2 times but it's only called once. This is a known codebase issue, not an environment problem.
- **Database migrations run automatically** on API startup when `DATABASE_URL` is set (`runMigrations()` in `server.ts`). No manual migration step needed.
- **Vite dev server must run from `apps/web/`** for Tailwind CSS to work correctly.
- **ESLint warnings** (47) are expected — all are `no-unused-vars` or `no-explicit-any` warnings, zero errors.
- **Git hooks:** The `prepare` script sets `core.hooksPath` to `.githooks/`. The `precommit` script runs typecheck.
