# Nexora AI frontend

Next.js 15 frontend for the independent FastAPI backend in sibling `../backend-project/backend`. The product name, domain, modules, and design are temporary competition defaults.

## Local development

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local`. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`. Start the FastAPI backend separately. Configure private `TRANSLATION_*` variables in `.env.local` for automatic translation of existing backend content. The optional `NEXT_PUBLIC_ENABLE_DEMO_FIXTURES=true` mode uses clearly labelled local records and does not fake AI or uploads. The backend's real `/auth/demo-login` is separate and should only be surfaced by `NEXT_PUBLIC_ENABLE_BACKEND_DEMO_LOGIN=true` when backend demo login is enabled.

## Docker Compose

Requires Docker Engine running and the backend checkout at `../backend-project/backend`, or set `BACKEND_BUILD_CONTEXT` to its Docker build directory.

```bash
cp .env.compose.example .env
# Replace POSTGRES_PASSWORD, SECRET_KEY, and SESSION_SECRET with long random values.
docker compose config --quiet
docker compose up --build -d
```

On PowerShell, use `Copy-Item .env.compose.example .env`. Open `http://localhost:3000`; backend health is `http://localhost:8000/health`. Compose starts PostgreSQL/pgvector, runs FastAPI migrations, and starts the Next app after backend health passes. The browser uses same-origin `/backend/*`, avoiding browser CORS dependence. PostgreSQL and uploads use named volumes. Set `WEB_PORT`, `API_PORT`, `FRONTEND_ORIGIN`, `API_URL`, and `GOOGLE_REDIRECT_URI` together when changing public host/ports. For public deployment set `DEMO_LOGIN_ENABLED=false`, provide real auth credentials, use HTTPS, and set suitable secrets and allowed frontend origin. Translation and AI require provider credentials; email code login requires SMTP; Google sign-in requires Google OAuth credentials.

The Compose file was syntax-checked with `docker compose --env-file .env.compose.example config --quiet`. Docker Engine was unavailable during this implementation, so images and live container networking were not tested here.

## Language and backend content

Choose O‘zbek, Русский, or English in the header or settings. Preference persists in the browser. Static UI copy lives in `lib/i18n/dictionary.ts`. Backend content is translated on display through the authenticated server route `app/api/translate/route.ts`; source records are preserved. Set `TRANSLATION_BASE_URL`, `TRANSLATION_MODEL`, and `TRANSLATION_API_KEY`, or the equivalent `LLM_*` values. The service must support OpenAI-compatible `/chat/completions`. When the service is unavailable, original content is shown with a ◇ marker. A provider may incur cost and receive the text being translated; use an approved service for sensitive data.

## Checks and continuation

```bash
npm run typecheck
npm run lint
npm run build
```

Read `COMPETITION_HANDOFF.md`, `API_CONTRACT.md`, `PROJECT_CONTEXT.md`, `DESIGN_SYSTEM.md`, and `IMPLEMENTATION_STATUS.md` before adapting the app to the competition topic. Configure identity in `config/site.ts`, generic record fields in `config/resources.ts`, and theme tokens in `app/globals.css`. Add every new UI string to `lib/i18n/dictionary.ts`; display backend text through `TranslatedText` or `useTranslatedText`.
