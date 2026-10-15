# Project context

## Purpose

Nexora AI is a temporary, domain-neutral frontend starter for a web development competition. The topic will be known tomorrow. This repository is the foundation to extend, not a throwaway mockup.

## Architecture

- Next.js 15 App Router, React 19, TypeScript strict mode, Tailwind CSS 4.
- App Router public landing with a small client boundary for instant language changes; client components for authenticated data, forms, dialogs, settings, and chat.
- Radix primitives styled with semantic Tailwind classes form the shadcn-style UI base in `components/ui`.
- TanStack Query owns server data, query keys, refresh, and mutation invalidation. No Zustand store is needed yet.
- React Hook Form + Zod validate project and configurable resource forms.
- `lib/api/client.ts` owns base URL, bearer authorization, serialized token refresh, error mapping, cancellation, and an explicit demo adapter. `lib/api/modules.ts` contains feature boundaries.
- `lib/i18n` owns Uzbek/Russian/English UI strings, saved locale, and on-display translation of existing backend content. `app/api/translate` validates bearer auth and calls a private OpenAI-compatible provider.
- `compose.yaml` runs pgvector, FastAPI, and the Next frontend; the Next rewrite proxies browser `/backend` requests to FastAPI.
- `config/site.ts` contains brand, navigation, landing copy, terminology, and enabled modules. `config/resources.ts` is the current entity schema.
- `app/globals.css` contains light/dark design tokens.

## What is implemented

Public landing and Google/email sign-in screens; OAuth callback/error; protected dashboard shell; overview, project CRUD, configurable record CRUD, document upload/list/delete UI, non-streaming AI chat UI, analytics charts, and settings. Three-language UI and backend content translation are implemented. The demo fixture adapter supports local project and record CRUD when explicitly enabled.

## Important limits

The sibling FastAPI checkout now has implemented routers. Frontend contracts were aligned with backend source, but no running backend or Docker Engine was available for end-to-end verification. The frontend does not silently switch to fixtures after errors. Access and refresh JWTs are stored in tab sessionStorage, not localStorage. Automatic translation needs provider credentials; without them, original content is marked and shown. Backend statistics are currently global, not user scoped.

## Preserve tomorrow

Keep the existing App Router layout, semantic CSS variables, reusable UI primitives, central API client, and Query setup. Change central config before editing page-specific copy. Extend schemas and API modules for topic-specific requirements. Avoid reinstalling or replacing the stack without a concrete incompatibility.
