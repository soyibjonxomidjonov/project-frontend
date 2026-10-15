export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const TOKEN_KEY = "nexora_access_token";
const REFRESH_KEY = "nexora_refresh_token";

export function getToken() { return typeof window === "undefined" ? null : sessionStorage.getItem(TOKEN_KEY); }
export function hasSession() { return typeof window !== "undefined" && !!(sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(REFRESH_KEY)); }
export function setToken(token: string) { sessionStorage.setItem(TOKEN_KEY, token); }
export function setTokenPair(pair: { access_token: string; refresh_token: string }) { sessionStorage.setItem(TOKEN_KEY, pair.access_token); sessionStorage.setItem(REFRESH_KEY, pair.refresh_token); }
export function clearToken() { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(REFRESH_KEY); }

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string | number) { super(message); this.name = "ApiError"; }
}

type ApiOptions = RequestInit & { auth?: boolean };
let refreshInFlight: Promise<string | null> | null = null;
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = typeof window === "undefined" ? null : sessionStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;
  if (!refreshInFlight) refreshInFlight = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: refreshToken }) });
      if (!response.ok) { clearToken(); return null; }
      const pair = await response.json() as { access_token: string; refresh_token: string };
      setTokenPair(pair);
      return pair.access_token;
    } catch { return null; }
  })().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = false, headers, ...init } = options;
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_FIXTURES === "true") {
    const { demoRequest } = await import("./demo");
    return demoRequest<T>(path, init);
  }
  let token = getToken();
  if (auth && !token) token = await refreshAccessToken();
  if (auth && !token) throw new ApiError(401, "Sign in to continue.");
  let response: Response;
  try {
    const request = {
      ...init,
      headers: { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(token && auth ? { Authorization: `Bearer ${token}` } : {}), ...headers },
      cache: "no-store",
    } as RequestInit;
    response = await fetch(`${API_BASE_URL}${path}`, request);
    if (response.status === 401 && auth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) response = await fetch(`${API_BASE_URL}${path}`, { ...request, headers: { ...request.headers as Record<string, string>, Authorization: `Bearer ${refreshed}` } });
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "Cannot connect to the API. Check that the backend is running.", "NETWORK_ERROR");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: { code?: string | number; message?: string }; detail?: string } | null;
    const fallback: Record<number, string> = { 401: "Your session has expired. Sign in again.", 403: "You do not have access to this action.", 404: "This item could not be found.", 422: "Please check the information you entered.", 429: "Too many requests. Please try again soon.", 500: "The server encountered an error." };
    throw new ApiError(response.status, body?.error?.message || body?.detail || fallback[response.status] || `Request failed (${response.status}).`, body?.error?.code);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const queryKeys = {
  me: ["me"] as const, projects: ["projects"] as const, resources: (type: string) => ["resources", type] as const,
  documents: ["documents"] as const, sessions: ["sessions"] as const, analytics: ["analytics"] as const,
};
