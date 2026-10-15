# TOMORROW.md — single read-first brief for the frontend

Read this one file to understand everything needed to work on this frontend: what it is,
how it deploys, how it talks to the backend, how to rebrand, how to add features, the
design rules, and the gotchas. Deeper detail is in the docs linked at the bottom — only
open those when this file points you there.

---

## 1. What this is & tomorrow's job

**Nexora AI frontend** — a domain-neutral, rebrandable **competition starter**
(Next.js 15 App Router, React 19, TypeScript strict, Tailwind 4). "Nexora AI" is a
placeholder brand. The FastAPI backend is a **separate sibling repo** (`../backend-project`,
deployed independently). Both are reusable templates.

**Tomorrow (competition day):** the topic is revealed. The job is to (1) **rebrand** to the
topic via central config + tokens, and (2) **wire the frontend to the real backend** and
extend features for the topic. **Preserve and extend this starter — do not rebuild it.**

**Live now:**
- Frontend: `https://app.scholarmap.uz` (the subdomain may change on competition day)
- Backend: `https://api.scholarmap.uz` (healthy; `/health` → `{"status":"ok"}`)

---

## 2. Golden rules (do not break)

1. **Never touch** the backend repo, the server, nginx, SSL, DNS, or the CD workflow. Fit
   code to the contract in `SERVER.md`. If a server error appears, fix the **code**.
2. **Static SPA export** — the app builds to static files (`out/`), served by nginx. This
   means **no server-side code at runtime**: no Next route handlers (`app/api/*`), no SSR,
   no `rewrites`. (See §9.)
3. **Rebrand through config + tokens** — never hardcode the brand name, fixed label widths,
   or raw `rounded-[Npx]` / raw Tailwind radii. Use the semantic tokens (§8).
4. **No fake/fabricated data.** Demo fixtures are gated behind
   `NEXT_PUBLIC_ENABLE_DEMO_FIXTURES=true` only.
5. **Preserve** the responsive header, `LanguageSwitcher`, `ThemeToggle`, and the radius
   tokens (verified 320–430px, UZ/RU/EN, light+dark).

---

## 3. Commands

```bash
npm run dev         # local dev (http://localhost:3000)
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # production static export → ./out  (same step the server runs)
```
Before pushing, run `npm run build` locally — and if deps changed, `npm ci --dry-run`
to catch lockfile drift (see §10).

---

## 4. Deploy & environment

**Model:** push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) SSHes to the
server, `git reset --hard origin/main`, `docker compose up -d --build`. The multi-stage
`Dockerfile` builds with `node:20-alpine` (`npm ci && npm run build` → `out/`) then serves
`out/` with `nginx:alpine` (SPA fallback in `nginx.conf`). `docker-compose.yml` has one
`web` service on `127.0.0.1:3000:80`. Host nginx proxies the subdomain → `127.0.0.1:3000`.
Deploy takes ~60–90s; verify at the live URL.

**Server:** repo at `/home/ec2-user/project-frontend`; secrets `HOST_DNS` + `EC2_SSH_KEY`
in GitHub repo settings.

**Server `.env`** (at `/home/ec2-user/project-frontend/.env`, gitignored, created by hand):
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.scholarmap.uz   # <-- change this one line if backend URL changes
NEXT_PUBLIC_ENABLE_DEMO_FIXTURES=false
NEXT_PUBLIC_ENABLE_BACKEND_DEMO_LOGIN=false
NEXT_PUBLIC_ENABLE_TRANSLATION=false
```
These are **build-time** values (baked into the static bundle by `docker-compose.yml`
build args). Change `.env` + redeploy (`--build`) to apply. ⚠️ The variable is
`NEXT_PUBLIC_API_BASE_URL` (this is Next.js), **not** `VITE_API_URL` — `SERVER.md`'s
example says VITE because it assumes a Vite app; ignore that naming here.

---

## 5. How the frontend talks to the backend

- `lib/api/client.ts` — the single fetch layer. Reads base URL from
  `NEXT_PUBLIC_API_BASE_URL` and calls the backend **directly** (no proxy). Adds
  `Authorization: Bearer <token>` on authed calls, serializes token refresh, maps errors,
  supports cancellation. Access/refresh JWTs live in **tab `sessionStorage`**.
- `lib/api/modules.ts` — typed endpoint adapters (authApi, projectsApi, resourcesApi,
  documentsApi, aiApi). Add new endpoints here.
- `lib/api/contracts.ts` — request/response models. Add new types here.
- **Auth flow:** Google login sends the user to
  `${API}/auth/google/login?redirect=${window.location.origin}`; the backend redirects back
  to `/auth/callback`, which reads the tokens from the URL fragment and stores them. Email
  code login and backend demo login are also wired. Exact shapes: `API_CONTRACT.md`.

When wiring a new feature: add the adapter in `modules.ts` + model in `contracts.ts`,
confirm the shape against the backend router source (`../backend-project/backend/app/routers`)
and `API_CONTRACT.md`.

---

## 6. Backend API surface (routers mounted at root, no `/api` prefix)

| Router | Endpoints | Frontend |
|---|---|---|
| `auth` `/auth` | email send-code/verify, refresh, demo-login, google login/callback, me | ✅ wired |
| `entities` `/entities` | stats, list, get, create, PATCH, DELETE | ✅ wired (projects + resources) |
| `knowledge` `/knowledge` | upload, **text**, documents, DELETE, **search** | 🟡 upload/list/delete wired; `text`+`search` not yet |
| `ai` `/ai` | chat, **insights**, sessions get/list/delete | 🟡 chat/sessions wired; `insights` not yet |
| `admin` `/admin` | users, PATCH user, overview | ❌ no frontend admin panel yet |
| system | `GET /health` | ✅ |

Unused capabilities (opportunities for the topic): `knowledge/text`, `knowledge/search`,
`ai/insights`, and a whole admin panel.

---

## 7. How to rebrand (do this first on competition day)

- `config/site.ts` — brand name, logo, nav labels, landing copy, terminology, enabled
  modules, primary CTA. **Change here before editing page-specific copy.**
- `config/resources.ts` — the generic entity schema (fields for the topic's records).
- `app/globals.css` — semantic **color** tokens (light `:root` + dark overrides) and the
  **radius** scale. Change brand colors here; everything else follows.
- `public/branding/logo.svg` — the logo.
- `lib/i18n/dictionary.ts` — UZ/RU/EN UI strings. Wrap new backend text with
  `TranslatedText` / `useTranslatedText`. Keep CTA labels short so they balance in every locale.

---

## 8. Design system essentials

Radius tokens (use the semantic classes, never raw Tailwind radii):
- `rounded-control` 10px — chips, badges, icon buttons, menu items
- `rounded-field` 12px — buttons, inputs, select/dropdown triggers
- `rounded-panel` 16px — dropdown / popover / select panels
- `rounded-dialog` 20px — dialogs, sheets

Shared UI lives in `components/ui/primitives.tsx` (Button, Input, Dropdown, Dialog, …) and
already uses these tokens — reuse it; don't re-style per page. Colors come only from the
semantic tokens in `globals.css` (uniform across the app). For stacked rounded menu items
keep a visible gap (gap-1) so corners don't pinch. The user is attentive to visual polish
and corner consistency; verify UI changes in the browser (light mode) before pushing.
Pending (user said "ertaga"): add icons/stickers next to buttons; polish other components.

---

## 9. Static-export rules (what you CAN'T do, and the workaround)

`next.config.ts` has `output: "export"`. Therefore:
- ❌ **No route handlers** (`app/api/*/route.ts`) — they break the build. (The old
  `/api/translate` was removed; translation is gated off via `NEXT_PUBLIC_ENABLE_TRANSLATION`,
  so content shows in its original language.)
- ❌ **No dynamic route segments** without `generateStaticParams`. For client-fetched detail
  pages use a **static route + query param** instead — e.g. the project detail page is
  `/dashboard/projects/view?id=...` (reads `useSearchParams`, wrapped in `<Suspense>`),
  not `[id]`.
- ❌ No SSR, no `rewrites`, no server-only features. `images: { unoptimized: true }`.
- ✅ Everything client-side (TanStack Query, forms, dialogs, API calls) works normally.

---

## 10. Gotchas

- **Lockfile / `npm ci`:** `package.json` and `package-lock.json` must be in sync or the
  server build fails (`EUSAGE`). If you change deps, run `npm install` and commit the
  updated lockfile; `npm ci --dry-run` locally confirms sync.
- **`VITE_API_URL` vs `NEXT_PUBLIC_API_BASE_URL`:** use the latter (§4).
- **Docs-only pushes still deploy** — `deploy.yml` triggers on every push to `main`
  (harmless; just rebuilds the same output).
- **CORS / OAuth** are on the backend side (allows `*.scholarmap.uz`); if auth misbehaves,
  check the backend, don't change server config.

---

## 11. Deeper docs (open only when pointed here)

- `SERVER.md` — authoritative server/deploy contract (both repos' root).
- `PROJECT_CONTEXT.md` — architecture & what's implemented.
- `API_CONTRACT.md` — exact backend request/response contracts.
- `DESIGN_SYSTEM.md` — radius scale, header rules, theme toggle, long-label handling.
- `COMPETITION_HANDOFF.md` — route/component inventory, protected components.
- `IMPLEMENTATION_STATUS.md` — feature status & known limits.
