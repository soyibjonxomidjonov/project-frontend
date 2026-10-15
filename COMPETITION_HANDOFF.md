# Competition handoff

## First steps

1. Read `PROJECT_CONTEXT.md`, `API_CONTRACT.md`, and the competition topic. Preserve this frontend and extend it.
2. Start the sibling FastAPI backend or use `compose.yaml`; check `/health` and `/openapi.json`.
3. Run `npm ci`, `npm run typecheck`, `npm run lint`, and `npm run build`.
4. Set brand, domain terminology, enabled modules, navigation, and landing copy in `config/site.ts`; update `public/branding/logo.svg` and semantic CSS variables in `app/globals.css`.
5. Adapt `config/resources.ts` for simple entity fields. Add separate routes/services for domain workflows that need more than generic CRUD.
6. Add Uzbek, Russian, and English translations for new UI strings in `lib/i18n/dictionary.ts`. Wrap new backend text with `TranslatedText` or `useTranslatedText`.
7. Verify Google/email login, project CRUD, documents, AI, translation, and mobile layout against the running backend.

## Current inventory

Routes: `/`, `/login`, `/auth/callback`, `/auth/error`, `/dashboard`, `/dashboard/projects`, `/dashboard/projects/[id]`, `/dashboard/resources`, `/dashboard/documents`, `/dashboard/ai`, `/dashboard/analytics`, `/dashboard/settings`, and `POST /api/translate`.

Shared UI includes button, inputs, selects, checkbox, radio, switch, badge, cards, tooltip, dropdown, tabs, dialog, sheet, toast, skeleton and states, pagination, breadcrumbs, data table, search/filter/sort controls, stat/chart cards, uploader, document card, status, avatar, page headers, AI input/message, source references, and field. The shell has desktop collapse and mobile drawer.

## Architecture to preserve

> **Future agents must preserve the validated responsive header, rounded language selector, multilingual layout behavior, and shared design tokens when adapting this starter to a new competition topic. Do not rebuild these components unless there is a demonstrated functional requirement.**
>
> Specifically: the single-row mobile landing header (`app/page.tsx`), the Radix-based `LanguageSwitcher` (`lib/i18n/provider.tsx`), the shared `ThemeToggle` (`components/ui/theme-toggle.tsx`), and the semantic radius tokens (`--radius-control/field/panel/dialog` in `app/globals.css`) were verified across 320–430px in UZ/RU/EN, light and dark. Rebrand them through config and tokens — never by hardcoding brand names, fixed label widths, or raw `rounded-[Npx]` values. Keep CTA labels short (e.g. `Get started`) so they stay balanced in every locale. See `DESIGN_SYSTEM.md` for the radius scale, header rules, theme toggle, and long-label handling.

- `config/site.ts`: identity and presentation; `config/resources.ts`: generic entity schema; `app/globals.css`: semantic tokens (colors + radius scale).
- `lib/api/client.ts`: central fetch, auth token refresh, errors, request cancellation, query keys; `lib/api/modules.ts`: typed endpoint adapters; `lib/api/contracts.ts`: models.
- `lib/i18n/provider.tsx` and `dictionary.ts`: selected language and UI copy; `content.tsx` and `app/api/translate/route.ts`: authenticated, cached on-display translation of backend content. Translation never rewrites original records.
- `app/providers.tsx`: React Query, toasts, and language provider.
- `Dockerfile` and `compose.yaml`: frontend, backend, pgvector; `.env.compose.example` documents required secrets and optional providers.

## Backend connection

Current backend routers exist in `../backend-project/backend/app/routers`. Google OAuth callback returns both `access_token` and `refresh_token` in the URL fragment. Email code login and backend demo login are wired. Documents list is `{items}`, AI sessions list is `{items}`, AI chat reply is `{session_id,content,meta}`. See `API_CONTRACT.md` for exact contracts and source-only verification limits.

For Compose, copy `.env.compose.example` to `.env`, replace secrets, and run `docker compose up --build -d`. Set `BACKEND_BUILD_CONTEXT` if the backend checkout is elsewhere. Disable `DEMO_LOGIN_ENABLED` before public deployment. Set `TRANSLATION_*` or `LLM_*` credentials to translate old backend text; choose a provider suitable for the data's sensitivity.

## Known issues

- Docker Engine and live backend were unavailable for end-to-end verification in this session.
- Translation depends on a configured external provider; without it the original appears with ◇.
- Backend statistics currently aggregate all entities. Backend work is needed for private per-user analytics.
- No verified streaming AI, upload progress, or profile update endpoint yet.
