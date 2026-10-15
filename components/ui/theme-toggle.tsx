"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

// Shared light/dark toggle. Reads the class set in app/providers.tsx on load,
// then flips the `.dark` class and persists the choice. Appearance from shared tokens.
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    setReady(true);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }
  return (
    <button type="button" onClick={toggle} aria-label={t(dark ? "Switch to light theme" : "Switch to dark theme")} aria-pressed={dark} title={t("Toggle theme")} className={cn("inline-grid size-10 shrink-0 place-items-center rounded-field border border-border bg-surface text-muted shadow-sm transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45", className)}>
      {ready && (dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />)}
    </button>
  );
}
