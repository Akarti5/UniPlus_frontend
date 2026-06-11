// Lightweight API client for the UniPlus backend
// Base URL configurable via VITE_API_URL (default: http://localhost:3000)

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

const TOKEN_KEY = "uniplus_token";
const REFRESH_TOKEN_KEY = "uniplus_refresh_token";
const USER_KEY = "uniplus_user";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: ApiError) => void }> = [];

const processQueue = (error: ApiError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

export const auth = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setToken(token: string, refreshToken?: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    try { window.dispatchEvent(new Event('uniplus:authchange')); } catch (e) { /* noop */ }
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    try { window.dispatchEvent(new Event('uniplus:authchange')); } catch (e) { /* noop */ }
  },
  getUser<T = any>(): T | null {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  setUser(user: unknown) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    try { window.dispatchEvent(new Event('uniplus:authchange')); } catch (e) { /* noop */ }
  },
};

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = auth.getRefreshToken();
  if (!refreshToken) {
    auth.clear();
    window.location.href = "/login";
    return null;
  }

  try {
    const url = new URL(`${API_BASE_URL}/auth/refresh`);
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const text = await res.text();
    let parsed: unknown = undefined;
    if (text) {
      try { parsed = JSON.parse(text); } catch { parsed = text; }
    }

    if (!res.ok) {
      const msg = (parsed as any)?.message || res.statusText || `HTTP ${res.status}`;
      throw new ApiError(res.status, Array.isArray(msg) ? msg.join(", ") : String(msg), parsed);
    }

    const { accessToken } = parsed as any;
    auth.setToken(accessToken, refreshToken);
    return accessToken;
  } catch (error) {
    auth.clear();
    window.location.href = "/login";
    throw error;
  }
}

export async function api<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, headers = {}, signal } = opts;
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  let token = auth.getToken();
  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await res.text();
  let parsed: unknown = undefined;
  if (text) {
    try { parsed = JSON.parse(text); } catch { parsed = text; }
  }

  if (res.status === 401) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          return api<T>(path, { ...opts, headers: { ...headers, Authorization: `Bearer ${token}` } });
        })
        .catch((error) => {
          throw error;
        });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      if (newToken) {
        processQueue(null, newToken);
        return api<T>(path, { ...opts, headers: { ...headers, Authorization: `Bearer ${newToken}` } });
      } else {
        throw new ApiError(401, "Session expired. Please login again.");
      }
    } catch (error) {
      processQueue(error as ApiError, null);
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  if (!res.ok) {
    const msg = (parsed as any)?.message || (parsed as any)?.error || res.statusText || `HTTP ${res.status}`;
    throw new ApiError(res.status, Array.isArray(msg) ? msg.join(", ") : String(msg), parsed);
  }

  return parsed as T;
}
