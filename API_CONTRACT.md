# API contract — 2026-10-15

Source checked: `../backend-project/backend/app/routers`, schemas, and `app/main.py`. These paths and shapes are **verified from backend source**, but a running FastAPI instance was not available for end-to-end tests. Compare against `/openapi.json` after deployment.

## Connection and authentication

Browser API base: `NEXT_PUBLIC_API_BASE_URL` (`http://localhost:8000` for local development, `/backend` in Compose). The `/backend/*` Next rewrite targets `API_INTERNAL_URL`. The translation server route uses `API_INTERNAL_URL` directly for `GET /auth/me` authentication.

Backend errors: `{ "error": { "code": number, "message": string } }`. Frontend also handles network, 401, 403, 404, 422, 429, 500, and cancellation.

| Endpoint | Request | Response / frontend use |
|---|---|---|
| `GET /auth/google/login?redirect=<origin>` | Browser redirect | Google OAuth; backend redirects to `<origin>/auth/callback#access_token=...&refresh_token=...` |
| `POST /auth/email/send-code` | `{email}` | `{message,email}`; requires configured SMTP |
| `POST /auth/email/verify` | `{email,code}` | `TokenPair` |
| `POST /auth/refresh` | `{refresh_token}` | `TokenPair` |
| `POST /auth/demo-login` | Empty | `TokenPair`; use only when backend `DEMO_LOGIN_ENABLED=true` |
| `GET /auth/me` | Bearer access token | `{id,email,name,role,...}` |
| `GET /health` | None | `{status:"ok"|"degraded",db,version}` |

`TokenPair = {access_token,refresh_token,token_type,expires_in}`. Tokens live in tab `sessionStorage`, are cleared at logout, and access token refresh is serialized. The backend has no logout endpoint or cookie session. Google credentials are required for OAuth. Never enable backend demo login on a public deployment.

## Entities and analytics

`Entity = {id,type,title,data,status,owner_id,is_public,created_at,updated_at}`. `PageResult<T> = {items,total,page,page_size}`. Project type is `project`; generic record type is `item` in `config/resources.ts`.

| Endpoint | Request | Response |
|---|---|---|
| `GET /entities?type=&q=&status=&sort=&page=&page_size=` | Bearer token sent, query params | `PageResult<Entity>` |
| `GET /entities/{id}` | Bearer token sent | `Entity` |
| `POST /entities` | Bearer; `{type,title,data,status?,is_public?}` | `Entity` |
| `PATCH /entities/{id}` | Bearer; `{title?,data?,status?,is_public?}` | `Entity` |
| `DELETE /entities/{id}` | Bearer | 204 |
| `GET /entities/stats?type=` | Optional type | `{total,by_status,by_day:[{date,count}]}` |

Backend `GET /entities` treats anonymous callers as public-only, so the frontend sends the token for signed-in lists. The current backend stats route aggregates all entities without an owner filter; avoid presenting it as a private per-user statistic until backend filtering is added.

## Documents

| Endpoint | Request | Response |
|---|---|---|
| `GET /knowledge/documents` | Bearer | `{items:Document[]}`; frontend derives `total` |
| `POST /knowledge/upload` | Bearer multipart `file` | `Document` |
| `DELETE /knowledge/documents/{id}` | Bearer | 204 |

Upload accepts PDF, DOCX, TXT, max 20 MB in the current backend. The frontend shows request pending state; backend provides no upload progress stream.

## AI

| Endpoint | Request | Response |
|---|---|---|
| `GET /ai/sessions` | Bearer | `{items:Session[]}` |
| `GET /ai/sessions/{id}` | Bearer | Session fields plus `messages:Message[]` |
| `DELETE /ai/sessions/{id}` | Bearer | 204 |
| `POST /ai/chat` | Bearer; `{message,assistant,session_id?,stream:false}` | `{session_id,content,meta}` |

Frontend adapts `meta.sources[]` with `document_title` and `content` into displayed source references. Streaming remains off until its event contract is tested. AI requires backend LLM credentials.

## Automatic content translation

Frontend `POST /api/translate` accepts `{locale:"uz"|"ru"|"en",texts:string[]}` with the user's bearer token. It validates the token through backend `/auth/me`, then uses an OpenAI-compatible provider configured by private `TRANSLATION_BASE_URL`, `TRANSLATION_API_KEY`, `TRANSLATION_MODEL` (falling back to private `LLM_*`). Responses are `{translations:string[]}`. Rate, item count, and size limits apply; long text is chunked by the client. Translations are cached in memory by text and locale, not written back to backend. If unavailable, the original text and a ◇ indicator remain visible. This applies to existing entity titles/descriptions/fields, document titles, conversation titles/messages, and RAG references. Provider credentials and live translation quality have not been verified locally.
