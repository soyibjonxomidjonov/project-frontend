"use client";
import { useQuery } from "@tanstack/react-query";
import { getToken } from "@/lib/api/client";
import { authApi } from "@/lib/api/modules";
import { useI18n } from "./provider";

const pending = new Map<string, { text: string; locale: string; resolve: (value: string) => void; reject: (error: Error) => void }[]>();
let timer: ReturnType<typeof setTimeout> | undefined;
function queueTranslation(text: string, locale: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const group = pending.get(locale) || [];
    group.push({ text, locale, resolve, reject }); pending.set(locale, group);
    if (!timer) timer = setTimeout(flush, 15);
  });
}
async function translateLong(text: string, locale: string): Promise<string> {
  if (text.length <= 10000) return queueTranslation(text, locale);
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length) {
    if (remaining.length <= 10000) { chunks.push(remaining); break; }
    const split = remaining.lastIndexOf("\n", 10000);
    const size = split > 5000 ? split + 1 : 10000;
    chunks.push(remaining.slice(0, size)); remaining = remaining.slice(size);
  }
  return (await Promise.all(chunks.map((chunk) => queueTranslation(chunk, locale)))).join("");
}
async function flush() {
  timer = undefined;
  const groups = [...pending.entries()]; pending.clear();
  await Promise.all(groups.flatMap(([locale, requests]) => {
    const batches: typeof requests[] = [];
    let current: typeof requests = [], length = 0;
    for (const item of requests) {
      if (current.length >= 20 || length + item.text.length > 20000) { batches.push(current); current = []; length = 0; }
      current.push(item); length += item.text.length;
    }
    if (current.length) batches.push(current);
    return batches.map(async (batch) => {
      try {
        const token = getToken();
        if (!token) throw new Error("Authentication required");
        const body = JSON.stringify({ locale, texts: batch.map((item) => item.text) });
        let response = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body });
        if (response.status === 401) { await authApi.me(); const renewed = getToken(); if (renewed) response = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${renewed}` }, body }); }
        if (!response.ok) throw new Error("Translation unavailable");
        const result = await response.json() as { translations: string[] };
        if (!Array.isArray(result.translations) || result.translations.length !== batch.length) throw new Error("Invalid translation response");
        batch.forEach((item, index) => item.resolve(result.translations[index]));
      } catch (error) { batch.forEach((item) => item.reject(error instanceof Error ? error : new Error("Translation unavailable"))); }
    });
  }));
}
export function useTranslatedText(text: string | null | undefined) {
  const { locale } = useI18n();
  const original = text || "";
  const needsTranslation = /\p{L}/u.test(original);
  const result = useQuery({ queryKey: ["translation", locale, original], queryFn: () => translateLong(original, locale), enabled: needsTranslation, staleTime: Infinity, retry: false });
  return { text: needsTranslation ? result.data || original : original, unavailable: needsTranslation && result.isError, loading: needsTranslation && result.isPending };
}
export function TranslatedText({ text, className, children }: { text: string | null | undefined; className?: string; children?: (translated: string) => React.ReactNode }) {
  const {t}=useI18n();
  const result = useTranslatedText(text);
  const props = { className, title: result.unavailable ? t("Original text shown because translation is unavailable.") : undefined, "data-translation": result.unavailable ? "unavailable" : result.loading ? "loading" : "ready" };
  const marker = result.unavailable && <span className="ml-1 text-warning" aria-label={t("Automatic translation unavailable")}>◇</span>;
  return children ? <div {...props}>{children(result.text)}{marker}</div> : <span {...props}>{result.text}{marker}</span>;
}
export function TranslatedOption({ value, text }: { value: string; text: string }) { const result = useTranslatedText(text); return <option value={value}>{result.text}</option>; }
