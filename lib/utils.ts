import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export function formatDate(value?: string | null) { const locale = typeof document === "undefined" ? "en-US" : ({ uz: "uz-UZ", ru: "ru-RU", en: "en-US" }[document.documentElement.lang] || "en-US"); return value ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value)) : "—"; }
