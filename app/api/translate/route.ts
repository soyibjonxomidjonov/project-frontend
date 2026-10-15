import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { Locale, locales } from "@/lib/i18n/dictionary";

export const runtime = "nodejs";
const cache = new Map<string, string>();
const attempts = new Map<string, { count: number; reset: number }>();
const MAX_CACHE = 2000;
const language: Record<Locale, string> = { en: "English", ru: "Russian", uz: "Uzbek" };

export async function POST(request: NextRequest) {
  const bearer = request.headers.get("authorization");
  if (!bearer?.startsWith("Bearer ")) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const apiOrigin = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const base = apiOrigin.startsWith("http") ? apiOrigin : "http://localhost:8000";
  let identity: Response;
  try { identity = await fetch(`${base.replace(/\/$/, "")}/auth/me`, { headers: { Authorization: bearer }, cache: "no-store", signal: AbortSignal.timeout(8000) }); }
  catch { return NextResponse.json({ error: "Backend unavailable" }, { status: 503 }); }
  if (!identity.ok) return NextResponse.json({ error: "Authentication failed" }, { status: identity.status === 401 ? 401 : 403 });

  let payload: { locale?: Locale; texts?: unknown };
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!payload.locale || !locales.includes(payload.locale) || !Array.isArray(payload.texts) || payload.texts.length > 20 || payload.texts.some((v) => typeof v !== "string" || v.length > 12000) || payload.texts.reduce((n: number, v: string) => n + v.length, 0) > 24000) return NextResponse.json({ error: "Invalid translation request" }, { status: 400 });
  const texts = payload.texts as string[];
  if (texts.length === 0) return NextResponse.json({ translations: texts });

  const id = createHash("sha256").update(bearer).digest("hex");
  const now = Date.now(), usage = attempts.get(id);
  if (usage && usage.reset > now && usage.count >= 60) return NextResponse.json({ error: "Translation rate limit exceeded" }, { status: 429 });
  attempts.set(id, { count: (usage && usage.reset > now ? usage.count : 0) + 1, reset: usage && usage.reset > now ? usage.reset : now + 60_000 });
  const keys = texts.map((value) => createHash("sha256").update(`${payload.locale}\0${value}`).digest("hex"));
  const missingIndices = keys.flatMap((key, index) => cache.has(key) ? [] : [index]);
  if (missingIndices.length) {
    const key = process.env.TRANSLATION_API_KEY || process.env.LLM_API_KEY;
    const model = process.env.TRANSLATION_MODEL || process.env.LLM_MODEL;
    const url = (process.env.TRANSLATION_BASE_URL || process.env.LLM_BASE_URL || "").replace(/\/$/, "");
    if (!key || !model || !url) return NextResponse.json({ error: "Translation service is not configured" }, { status: 503 });
    try {
      const response = await fetch(`${url}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model, temperature: 0, messages: [{ role: "system", content: `Translate each JSON array item into ${language[payload.locale]}. Detect the original language. Preserve meaning, Markdown syntax, proper nouns, numbers, URLs and code. If already in the target language, return it unchanged. Reply ONLY with a JSON array of translated strings in the same order. Never add explanations.` }, { role: "user", content: JSON.stringify(missingIndices.map((index) => texts[index])) }] }), signal: AbortSignal.timeout(30000) });
      if (!response.ok) return NextResponse.json({ error: "Translation provider unavailable" }, { status: 502 });
      const body = await response.json() as { choices?: { message?: { content?: string } }[] };
      const content = body.choices?.[0]?.message?.content?.trim() || "";
      const parsed: unknown = JSON.parse(content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
      if (!Array.isArray(parsed) || parsed.length !== missingIndices.length || parsed.some((value) => typeof value !== "string")) throw new Error("Invalid provider response");
      missingIndices.forEach((index, position) => { if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!); cache.set(keys[index], parsed[position]); });
    } catch { return NextResponse.json({ error: "Translation failed" }, { status: 502 }); }
  }
  return NextResponse.json({ translations: keys.map((key) => cache.get(key)!) });
}
