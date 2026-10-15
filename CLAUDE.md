# CLAUDE.md

Orientation for Claude Code. Read this first every session so the project does not need re-explaining.

> **📖 Read `TOMORROW.md` first — it is the single, complete brief** (project, deploy, backend
> wiring, rebrand, adding features, design rules, gotchas). This CLAUDE.md is a short summary;
> `TOMORROW.md` has everything in one place.

## What this is

**Nexora AI frontend** — a domain-neutral, rebrandable **competition starter** (Next.js 15 App Router, React 19, TypeScript strict, Tailwind 4). "Nexora AI" is a placeholder brand. The competition topic is revealed 2026-10-16; after that the app is rebranded via central config and wired to the real backend/LLM. Preserve and extend this starter — do not rebuild it.

The FastAPI backend is a **sibling project** (`../backend-project`, path `backend/app`). Never modify the backend from this repo — only read it to align contracts.

## Backend API (read `../backend-project/backend/app/routers`)

Routers are mounted at root (no `/api` prefix). The frontend reaches them via `NEXT_PUBLIC_API_BASE_URL` (compose: `/backend` → proxied to `api:8000`). `lib/api/modules.ts` already wires the core surface.

- `auth` `/auth`: `email/send-code`, `email/verify`, `refresh`, `demo-login`, `google/login`, `google/callback`, `me` — **wired**.
- `entities` `/entities`: `stats`, list `""`, `{id}`, create, `PATCH {id}`, `DELETE {id}` — **wired** (projects + configurable resources).
- `knowledge` `/knowledge`: `upload`, `text`, `documents`, `DELETE documents/{id}`, `search` — upload/list/delete wired; **`text` + `search` not yet used**.
- `ai` `/ai`: `chat`, `insights`, `sessions`, `sessions/{id}`, `DELETE sessions/{id}` — chat/sessions wired; **`insights` not yet used**.
- `admin` `/admin`: `users`, `PATCH users/{id}`, `overview` — **no frontend admin panel yet**.
- `GET /health` — wired.

When wiring new features, add typed adapters in `lib/api/modules.ts` + models in `lib/api/contracts.ts`; confirm exact shapes against the router source and `API_CONTRACT.md`.

## Read these for detail (do not re-derive)

- `PROJECT_CONTEXT.md` — architecture, what's implemented, limits, what to preserve.
- `COMPETITION_HANDOFF.md` — inventory, protected components, backend connection.
- `API_CONTRACT.md` — exact backend contracts.
- `DESIGN_SYSTEM.md` — radius scale, header rules, theme toggle, long-label handling.
- `IMPLEMENTATION_STATUS.md` — feature status.

## Commands

```bash
npm run dev         # local dev
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # production build (same step Docker runs)
```

## Where things live

- `config/site.ts` — brand, nav, landing copy, terminology, enabled modules (rebrand here first).
- `config/resources.ts` — generic entity schema.
- `app/globals.css` — semantic color + radius tokens.
- `lib/api/client.ts` — central fetch, bearer auth, token refresh, error mapping, cancellation.
- `lib/api/modules.ts` / `contracts.ts` — typed endpoint adapters / models.
- `lib/i18n/` — UZ/RU/EN UI strings + on-display translation of backend content.
- `app/api/translate/route.ts` — server route (Node runtime) for content translation.

## Deployment (decided)

**Model: static SPA export served by nginx on a container.** `next.config.ts` has `output: "export"` → `next build` emits `out/`. The `Dockerfile` is multi-stage: node:20-alpine builds, nginx:alpine serves `out/` with SPA fallback (`nginx.conf` `try_files $uri $uri.html $uri/index.html /index.html`). `docker-compose.yml` has one `web` service on `127.0.0.1:3000:80`. The host nginx proxies the subdomain → `127.0.0.1:3000` and handles SSL.

- CD is **the user's own `.github/workflows/deploy.yml`** — do not edit it or create other workflows. It SSHes to `/srv/frontend`, `git reset --hard`, `docker compose up -d --build`, curls `127.0.0.1:3000`. Needs GitHub secrets `HOST_DNS` + `EC2_SSH_KEY` and a `.env` at `/srv/frontend/.env`.
- Server `.env` provides the build arg `NEXT_PUBLIC_API_BASE_URL` (the real backend URL, e.g. `https://api.<domain>`). The client calls the backend directly at that URL (no proxy).
- Backend is deployed separately (sibling repo); this repo ships frontend only.

Static-export consequences (already handled): the `/api/translate` server route was removed and on-display translation is gated behind `NEXT_PUBLIC_ENABLE_TRANSLATION` (off by default, content shows as-is); the old `/dashboard/projects/[id]` dynamic route became the static `/dashboard/projects/view?id=...` page.

## Working conventions

- The user communicates in **Uzbek** — respond in Uzbek.
- Rebrand through config + tokens; never hardcode the brand name, fixed label widths, or raw `rounded-[Npx]`.
- No fake/fabricated data. Demo fixtures are gated behind `NEXT_PUBLIC_ENABLE_DEMO_FIXTURES=true`.
- Preserve the responsive header, `LanguageSwitcher`, `ThemeToggle`, and semantic radius tokens (verified 320–430px, UZ/RU/EN, light+dark).
