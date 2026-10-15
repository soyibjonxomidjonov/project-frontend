import type { Entity, PageResult, User } from "./contracts";

// Explicit, local-only fixture adapter. Never enabled without NEXT_PUBLIC_ENABLE_DEMO_FIXTURES=true.
const initial: Entity[] = [
  { id: "demo-project-1", type: "project", title: "Explore a new idea", data: { description: "A starting place for an upcoming project." }, status: "active", owner_id: "demo-user", is_public: false, created_at: "2026-10-12T09:00:00Z", updated_at: "2026-10-12T09:00:00Z" },
  { id: "demo-project-2", type: "project", title: "Plan the next phase", data: { description: "Collect requirements and define the next steps." }, status: "active", owner_id: "demo-user", is_public: false, created_at: "2026-10-10T09:00:00Z", updated_at: "2026-10-10T09:00:00Z" },
  { id: "demo-item-1", type: "item", title: "Example record", data: { description: "This is local demo data.", category: "Sample" }, status: "active", owner_id: "demo-user", is_public: false, created_at: "2026-10-11T09:00:00Z", updated_at: "2026-10-11T09:00:00Z" },
];
const key = "nexora_demo_entities";
function read(): Entity[] { try { return JSON.parse(localStorage.getItem(key) || "null") || initial; } catch { return initial; } }
function save(items: Entity[]) { localStorage.setItem(key, JSON.stringify(items)); }
const now = () => new Date().toISOString();
export async function demoRequest<T>(path: string, options: RequestInit): Promise<T> {
  const url = new URL(path, "http://demo.local"), method = options.method || "GET";
  const body = options.body && !(options.body instanceof FormData) ? JSON.parse(String(options.body)) : {};
  if (url.pathname === "/auth/me") return { id: "demo-user", name: "Demo User", email: "demo@example.local", role: "user" } as User as T;
  if (url.pathname === "/entities/stats") { const items = read().filter((item) => !url.searchParams.get("type") || item.type === url.searchParams.get("type")); return { total: items.length, by_status: { active: items.filter((item)=>item.status==="active").length, archived: items.filter((item)=>item.status==="archived").length }, by_day: [] } as T; }
  if (url.pathname === "/entities" && method === "GET") { const type = url.searchParams.get("type"), q = url.searchParams.get("q")?.toLowerCase(), status = url.searchParams.get("status"), sort = url.searchParams.get("sort"); const page = Number(url.searchParams.get("page") || 1), page_size = Number(url.searchParams.get("page_size") || 20); const items = read().filter((item)=> (!type || item.type===type) && (!q || item.title.toLowerCase().includes(q) || JSON.stringify(item.data).toLowerCase().includes(q)) && (!status || item.status===status)); items.sort((a,b)=>sort === "title" ? a.title.localeCompare(b.title) : sort === "created_at" ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at)); return { items: items.slice((page-1)*page_size,page*page_size), total: items.length, page, page_size } as PageResult<Entity> as T; }
  if (url.pathname === "/entities" && method === "POST") { const item: Entity = { id: crypto.randomUUID(), type: body.type, title: body.title, data: body.data || {}, status: "active", owner_id: "demo-user", is_public: false, created_at: now(), updated_at: now() }; save([item,...read()]); return item as T; }
  if (url.pathname.startsWith("/entities/")) { const id = url.pathname.split("/")[2], items = read(), current = items.find((item)=>item.id===id); if (!current) throw new Error("Demo record not found."); if (method === "GET") return current as T; if (method === "DELETE") { save(items.filter((item)=>item.id!==id)); return undefined as T; } if (method === "PATCH") { const updated = { ...current, ...body, data: { ...current.data, ...(body.data||{}) }, updated_at: now() }; save(items.map((item)=>item.id===id?updated:item)); return updated as T; } }
  if (url.pathname === "/knowledge/documents" && method === "GET") return { items: [], total: 0, page: 1, page_size: 20 } as T;
  if (url.pathname === "/ai/sessions" && method === "GET") return { items: [] } as T;
  if (url.pathname === "/ai/chat") throw new Error("AI replies are unavailable in demo mode. Connect the FastAPI backend to chat.");
  if (url.pathname === "/knowledge/upload" && method === "POST") throw new Error("Uploads need a connected backend. Demo mode does not store documents.");
  throw new Error("This action is not available in demo mode.");
}

