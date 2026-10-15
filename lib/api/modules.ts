import { api, API_BASE_URL, ApiError, clearToken } from "./client";
import type { ChatReply, ChatSession, Document, Entity, EntityStats, PageResult, User, ChatMessage, TokenPair, Source } from "./contracts";

const params = (input: Record<string, string | number | undefined>) => { const q = new URLSearchParams(); Object.entries(input).forEach(([k, v]) => { if (v !== undefined && v !== "") q.set(k, String(v)); }); return q.toString(); };
export const authApi = {
  loginUrl: (redirect: string) => `${API_BASE_URL}/auth/google/login?${params({ redirect })}`,
  me: (signal?: AbortSignal) => api<User>("/auth/me", { auth: true, signal }),
  sendCode: (email: string) => api<{ message: string; email: string }>("/auth/email/send-code", { method: "POST", body: JSON.stringify({ email }) }),
  verifyCode: (email: string, code: string) => api<TokenPair>("/auth/email/verify", { method: "POST", body: JSON.stringify({ email, code }) }),
  demoLogin: () => api<TokenPair>("/auth/demo-login", { method: "POST" }),
  health: (signal?: AbortSignal) => api<{ status: string; db: string; version: string }>("/health", { signal }),
  logout: () => clearToken(), // Backend currently specifies bearer JWT and no logout endpoint.
};
export const projectsApi = {
  list: (signal?: AbortSignal) => api<PageResult<Entity>>(`/entities?${params({ type: "project", page_size: 100 })}`, { auth: true, signal }),
  get: (id: string, signal?: AbortSignal) => api<Entity>(`/entities/${encodeURIComponent(id)}`, { auth: true, signal }),
  create: (title: string, description: string) => api<Entity>("/entities", { method: "POST", auth: true, body: JSON.stringify({ type: "project", title, data: { description } }) }),
  update: (id: string, input: { title?: string; description?: string; status?: string }) => api<Entity>(`/entities/${encodeURIComponent(id)}`, { method: "PATCH", auth: true, body: JSON.stringify({ title: input.title, status: input.status, data: input.description === undefined ? undefined : { description: input.description } }) }),
  delete: (id: string) => api<void>(`/entities/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }),
};
export const resourcesApi = {
  list: (type: string, input: { q?: string; status?: string; sort?: string; page?: number; page_size?: number }, signal?: AbortSignal) => api<PageResult<Entity>>(`/entities?${params({ type, ...input })}`, { auth: true, signal }),
  create: (type: string, title: string, data: Record<string, unknown>) => api<Entity>("/entities", { method: "POST", auth: true, body: JSON.stringify({ type, title, data }) }),
  update: (id: string, title: string, data: Record<string, unknown>) => api<Entity>(`/entities/${encodeURIComponent(id)}`, { method: "PATCH", auth: true, body: JSON.stringify({ title, data }) }),
  delete: (id: string) => api<void>(`/entities/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }),
  stats: (type?: string, signal?: AbortSignal) => api<EntityStats>(`/entities/stats?${params({ type })}`, { signal }),
};
export const documentsApi = {
  list: async (signal?: AbortSignal) => { const result = await api<{ items: Document[] }>("/knowledge/documents", { auth: true, signal }); return { ...result, total: result.items.length, page: 1, page_size: result.items.length }; },
  upload: (file: File) => { const data = new FormData(); data.append("file", file); return api<Document>("/knowledge/upload", { method: "POST", auth: true, body: data }); },
  delete: (id: string) => api<void>(`/knowledge/documents/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }),
};
export const assistantsApi = { options: [
  { id: "chat", label: "General", description: "Think, draft, and explore ideas" },
  { id: "knowledge", label: "Knowledge", description: "Ask about connected documents" },
  { id: "analytics", label: "Analytics", description: "Explore patterns in your data" },
] };
type BackendChatMessage = Omit<ChatMessage, "meta"> & { meta?: { sources?: { document_id?: string; document_title: string; content: string }[] } | null };
const sourceFromBackend = (source: { document_id?: string; document_title: string; content: string }): Source => ({ document_id: source.document_id, title: source.document_title, excerpt: source.content });
export const conversationsApi = {
  list: async (signal?: AbortSignal) => (await api<{ items: ChatSession[] }>("/ai/sessions", { auth: true, signal })).items,
  get: async (id: string, signal?: AbortSignal) => { const result = await api<ChatSession & { messages: BackendChatMessage[] }>(`/ai/sessions/${encodeURIComponent(id)}`, { auth: true, signal }); return { session: { id: result.id, title: result.title, assistant: result.assistant, created_at: result.created_at }, messages: result.messages.map((message): ChatMessage => ({ ...message, meta: { sources: message.meta?.sources?.map(sourceFromBackend) || [] } })) }; },
  send: async (message: string, assistant: string, session_id?: string): Promise<ChatReply> => { const result = await api<{ session_id: string; content: string; meta?: { sources?: { document_id?: string; document_title: string; content: string }[] } }>("/ai/chat", { method: "POST", auth: true, body: JSON.stringify({ message, assistant, session_id, stream: false }) }); if (result.content.startsWith("AI xatolik:")) throw new ApiError(502, "AI service unavailable. Check the backend LLM configuration."); const sources: Source[] = result.meta?.sources?.map(sourceFromBackend) || []; return { session_id: result.session_id, message: { id: `${result.session_id}-new`, role: "assistant", content: result.content, meta: { sources }, created_at: new Date().toISOString() }, sources }; },
  delete: (id: string) => api<void>(`/ai/sessions/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }),
};
export const analyticsApi = { overview: (type?: string, signal?: AbortSignal) => resourcesApi.stats(type, signal) };
