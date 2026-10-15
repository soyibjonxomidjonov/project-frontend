"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Locale, locales, localeNames, localeShort, translateUi } from "./dictionary";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, Globe } from "lucide-react";

const KEY = "nexora_locale";
type I18nValue = { locale: Locale; setLocale: (value: Locale) => void; t: (value: string) => string };
const I18nContext = createContext<I18nValue>({ locale: "en", setLocale: () => {}, t: (value) => value });
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => { const stored = localStorage.getItem(KEY); if (stored && locales.includes(stored as Locale)) setLocaleState(stored as Locale); }, []);
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dataset.locale = locale; }, [locale]);
  function setLocale(value: Locale) { localStorage.setItem(KEY, value); setLocaleState(value); }
  return <I18nContext.Provider value={{ locale, setLocale, t: (value) => translateUi(value, locale) }}>{children}</I18nContext.Provider>;
}
export const useI18n = () => useContext(I18nContext);
export function T({ text }: { text: string }) { const { t } = useI18n(); return <>{t(text)}</>; }
// Accessible, rounded language selector built on Radix Select.
// Radix handles keyboard nav, Escape, outside-click, edge-aware positioning (Portal, no clipping) and ARIA.
// Appearance comes entirely from the shared radius/shadow tokens so a rebrand needs no change here.
// `compact` shows a short code (UZ/RU/EN) in the trigger for tight headers; the panel always shows full names.
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <SelectPrimitive.Root value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectPrimitive.Trigger aria-label={t("Language")} className="group inline-flex min-h-10 items-center gap-2 rounded-field border border-border bg-surface px-3 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 data-[state=open]:border-primary">
        <Globe aria-hidden className="size-4 shrink-0 text-muted" />
        <SelectPrimitive.Value>{compact ? localeShort[locale] : localeNames[locale]}</SelectPrimitive.Value>
        <SelectPrimitive.Icon asChild><ChevronDown aria-hidden className="size-4 shrink-0 text-muted transition-transform duration-200 group-data-[state=open]:rotate-180" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content position="popper" sideOffset={8} collisionPadding={12} className="z-50 min-w-[max(var(--radix-select-trigger-width),9rem)] overflow-hidden rounded-panel border border-border bg-surface p-1.5 shadow-[var(--shadow-panel)]">
          <SelectPrimitive.Viewport className="flex flex-col gap-1">
            {locales.map((item) => (
              <SelectPrimitive.Item key={item} value={item} className="flex min-h-9 cursor-pointer select-none items-center justify-between gap-8 rounded-control px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors data-[highlighted]:bg-surface-muted data-[state=checked]:bg-secondary data-[state=checked]:font-semibold data-[state=checked]:text-primary">
                <SelectPrimitive.ItemText>{localeNames[item]}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator><Check aria-hidden className="size-4 shrink-0 text-primary" /></SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
