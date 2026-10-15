# Design system

The current look is a temporary neutral SaaS identity. All feature components should use semantic tokens.

## Tokens

`app/globals.css` defines `--background`, `--foreground`, `--surface`, `--surface-muted`, `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--accent`, `--muted`, `--border`, `--success`, `--warning`, `--error`, `--radius`, `--shadow`, and `--font-sans`. Tailwind 4 `@theme inline` exposes these as utility colors. The `.dark` selector overrides color variables.

### Radius scale (shared tokens)

Rounded corners are driven by a semantic scale so a rebrand only touches `app/globals.css`, never individual components. Change the value in `:root`, and every control that uses the matching utility follows:

| Token | Value | Utility | Use for |
| --- | --- | --- | --- |
| `--radius-control` | 10px | `rounded-control` | small controls: icon buttons, chips, dropdown/menu items |
| `--radius-field` | 12px | `rounded-field` | buttons, inputs, selects, the language-selector trigger |
| `--radius-panel` | 16px | `rounded-panel` | dropdown / popover / select panels |
| `--radius-dialog` | 20px | `rounded-dialog` | dialogs and sheets |
| `--radius` / `--radius-lg` | ~14px | `rounded-lg` | cards and existing surfaces |

`--shadow-panel` is the elevated shadow for floating panels. Do not hardcode raw `rounded-[Npx]` values on new shared controls — reuse a token above so tomorrow's theme stays consistent.

Current visual direction: warm near-white canvas, dark navy text, restrained indigo primary, muted neutral surfaces, subtle borders and shadows. Default radius is about 14px. Display headings use tight tracking; body text uses a comfortable 1.5–1.75 line height. Touch controls have a minimum height near 44px.

## Components

`components/ui/primitives.tsx` contains the shadcn-style Radix UI base. Prefer `Button`, `Input`, `Textarea`, `NativeSelect`, `Card`, `Badge`, `Dialog`, `ConfirmationDialog`, `Dropdown`, `Tooltip`, `Tabs`, `Switch`, `Checkbox`, and `Field` instead of local reimplementations. `components/ui/states.tsx` contains loading, empty, and error surfaces; `feedback.tsx` provides toast notifications. Ensure each new control has a visible label, keyboard handling, focus state, disabled state, and meaningful action.

## Responsive rules

Mobile first. Page gutters are 16–20px on small screens and 28–32px on larger screens. Breakpoints follow Tailwind defaults: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px. The dashboard uses a mobile drawer and collapsible desktop sidebar. Tables scroll horizontally within their card. Dialogs fit within `90dvh` and `calc(100vw - 2rem)`. Motion respects `prefers-reduced-motion`.

### Landing header (validated responsive pattern)

Below `md` (768px) the landing header (`app/page.tsx`) is a single clean row — brand (icon + name) · compact language selector · hamburger button (`md:hidden`) — and nothing else, so it never overcrowds on narrow phones. The hamburger opens a nav `Sheet` that holds the nav links, an Appearance row with the theme toggle, and the primary CTA. The hero section below carries the main on-page CTA, so the header needs no duplicate button on mobile.

At and above `md`, a single row is used too: brand · inline nav links (animated underline on hover) · theme toggle · language selector · short inline CTA. The hamburger is hidden. Verified at 320/360/375/380/390/430px in Uzbek, Russian, and English with no overflow or overlap (the global `body { min-width: 320px }` guard means sub-320 viewports with a classic scrollbar can show a few px of scroll in a desktop test frame; real phones use overlay scrollbars, so there is no overflow).

**Keep CTA labels short.** The header/menu CTA uses a short key like `Get started` ("Boshlash" / "Начать") rather than a long phrase, so it stays balanced on a narrow mobile button and in all three locales.

**Long translated labels:** never assume a label's length. Russian strings (e.g. "Открыть рабочее пространство") are much longer than English. Prefer short CTA keys, let text wrap or the container flex rather than forcing one line with shrunken text, and test all three locales when touching header or nav layout.

### Theme toggle

`components/ui/theme-toggle.tsx` is the shared light/dark control (landing header on desktop, landing mobile menu). It reads the effective theme from `localStorage` `theme` (falling back to `prefers-color-scheme`) — the same source `app/providers.tsx` uses to apply the `.dark` class on load — so its state is correct regardless of effect order, then flips `.dark` and persists the choice. The settings page keeps its own `Switch` for the same preference. Reuse this component anywhere a theme control is needed rather than re-reading the class.

### Language selector

`LanguageSwitcher` (`lib/i18n/provider.tsx`) is built on Radix `Select` (an accessible primitive — keyboard nav, Escape, outside-click, Portal/edge-aware positioning, ARIA — rather than custom dropdown logic). The trigger uses `rounded-field`, the panel `rounded-panel` + `--shadow-panel`; appearance comes entirely from the shared radius tokens. `compact` shows a short code (UZ/RU/EN) with a globe icon for tight headers; the panel always lists full language names. Each panel item is a consistent `rounded-control` pill: `bg-surface-muted` on hover/keyboard-highlight and `bg-secondary` + primary text + check when selected — the same pill shape in every row position, so the selected language reads the same whether it is first, middle, or last. Used compact in the landing, login, and dashboard headers, and full-width on the settings page.

## Rebranding steps

Change CSS variables (including `.dark`), `config/site.ts`, and `public/branding/logo.svg`. Update imagery and copy through `siteConfig.landing`. Do not hardcode a new brand name in individual components. Set the appropriate domain terms and enabled navigation modules. Verify contrast and light/dark views after changing colors.

## Localization

Add all new interface phrases to `lib/i18n/dictionary.ts` with Uzbek and Russian translations; English keys are the source text. Use `T` for fixed JSX text, `useI18n().t` for string props, and `TranslatedText`/`useTranslatedText` for backend-provided content. The user's language choice is saved in localStorage and applied to the document `lang` attribute. Dates use locale-aware formatting. The ◇ marker means automatic translation failed and original content is visible.
