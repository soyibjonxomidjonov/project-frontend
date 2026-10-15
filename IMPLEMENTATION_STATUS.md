# Implementation status — 2026-10-15

## UI update — 2026-10-15 (responsive header + language selector)

- Landing header (`app/page.tsx`) rebuilt as a two-row mobile layout (brand + compact language selector + hamburger `Sheet`; full-width CTA on its own row), single row from `md` up. No desktop/tablet redesign.
- `LanguageSwitcher` (`lib/i18n/provider.tsx`) rebuilt on Radix `Select`: rounded trigger/panel from shared tokens, globe icon, short code (UZ/RU/EN) when compact, full names + active-check in the panel, keyboard/Escape/outside-click/edge-aware positioning.
- Added semantic radius tokens to `app/globals.css` (`--radius-control` 10px, `--radius-field` 12px, `--radius-panel` 16px, `--radius-dialog` 20px) and `--shadow-panel`; exposed via `@theme inline`. Existing component radii left intact.
- Dashboard "Sign in required" screen (`components/layout/platform-shell.tsx`) replaced the reused error card + generic "Try again" with a purpose-built card (login icon + primary "Open workspace" button).
- Docs updated: `DESIGN_SYSTEM.md`, `COMPETITION_HANDOFF.md`, this file.

### UI polish follow-up (same day)

- Language dropdown items now render as consistent pills (`bg-surface-muted` on hover, `bg-secondary` + primary + check when selected) so the active language looks identical in any row position — fixes the uneven highlight the middle item showed.
- Landing header simplified on mobile to a single row (brand + language + hamburger); the duplicate full-width CTA row was removed (the hero CTA and the hamburger menu cover it). Header/menu CTA shortened to the `Get started` key so it stays balanced in all locales.
- Desktop nav links got an animated underline + color transition on hover.
- Added a reusable light/dark `ThemeToggle` (`components/ui/theme-toggle.tsx`) to the landing header (desktop) and mobile menu; it reads the theme from `localStorage`/`prefers-color-scheme` so its state matches the applied `.dark` class regardless of effect order.

## Complete in frontend

- Responsive landing, auth pages, protected dashboard shell, projects, generic records, documents, AI chat, analytics, and settings.
- Uzbek, Russian, and English UI dictionaries with persistent language switchers in the landing header, login, dashboard header, and settings. Dates and known status labels follow the selected language.
- Automatic display translation boundary for existing backend entity text, document titles, conversation titles/messages, and source references, including English as a target language. Original content is preserved and visibly marked when translation fails.
- Source-verified FastAPI endpoint adapters for Google callback token pair, email OTP, refresh, entities, documents, AI sessions/chat, and health. Authenticated entity listing now sends the bearer token.
- Frontend Dockerfile, Compose stack for frontend/FastAPI/pgvector, env templates, health checks, named volumes, and same-origin API rewrite.
- Explicit local fixture mode and separate real backend demo login for development.

## Pending external configuration or verification

- Live backend integration requires a running FastAPI/PostgreSQL instance. Backend source contracts were inspected, but no live endpoint was available in this environment.
- Automatic translation requires a configured OpenAI-compatible LLM provider key. Translation quality and provider availability have not been live tested. Original text is shown with ◇ if unavailable.
- Google OAuth requires client credentials; email OTP requires SMTP. AI replies require backend LLM configuration. Document processing may also require embedding credentials.
- Docker Compose syntax passed, but Docker Engine was not running, so container build/start and cross-container requests remain unverified.
- Backend `GET /entities/stats` aggregates all entities; add user scoping in backend if private analytics are required.
- No streaming AI or upload progress contract has been verified. Profile editing awaits a backend endpoint.

## Checks executed

- `npm run typecheck`: passed after implementation (re-run 2026-10-15, clean).
- `npm run lint`: passed with no warnings (re-run 2026-10-15, clean).
- `npm run build`: passed (2026-10-15, `✓ Compiled successfully`, 15 routes, type + lint validation during build).
- `docker compose --env-file .env.compose.example config --quiet`: passed.
- Browser (2026-10-15, Chrome): landing header rendered at 320/360/375/380/390/430px in UZ/RU/EN — clean single-row mobile header, no overlap. Language dropdown opens rounded and unclipped with a consistent pill highlight for hover vs selected (verified on the middle item), updates translations on select, closes on Escape. Theme toggle switches light/dark on the landing page and persists; the mobile hamburger menu shows translated nav links, the Appearance/theme row, and the short CTA. Desktop nav underline animates on hover. The only sub-320px scroll seen was the `body { min-width: 320px }` guard against a desktop test-frame scrollbar (overlay scrollbars on real phones, so no overflow). Full live API and Docker browser tests remain pending the external services.
