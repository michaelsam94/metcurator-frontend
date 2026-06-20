import type { ApiError, Collection, Department, MetObject, SafeUser } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

type RequestOptions = {
  token?: string | null;
  signal?: AbortSignal;
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  headers.set("Accept", "application/json");

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.body ? "POST" : "GET",
      credentials: "include",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw mapApiError(response.status, data);
    }

    return data as T;
  } catch (error) {
    if (isApiError(error)) {
      throw error;
    }

    throw {
      kind: "network",
      code: "NETWORK_ERROR",
      message: "Network request failed"
    } satisfies ApiError;
  }
}

function mapApiError(status: number, data: { error?: { code?: string; message?: string; fields?: unknown } }) {
  const code = data.error?.code ?? "UNKNOWN_ERROR";
  const message = data.error?.message ?? "Request failed";

  if (status === 401) {
    return { kind: "auth", code, message } satisfies ApiError;
  }

  if (status === 422) {
    return { kind: "validation", code, message, fields: data.error?.fields } satisfies ApiError;
  }

  if (status === 502 || code === "UPSTREAM_UNAVAILABLE") {
    return { kind: "upstream-unavailable", code, message } satisfies ApiError;
  }

  return { kind: "server", code, message } satisfies ApiError;
}

function isApiError(error: unknown): error is ApiError {
  return Boolean(error && typeof error === "object" && "kind" in error);
}

export const api = {
  departments: (signal?: AbortSignal) =>
    request<{ departments: Department[] }>("/api/departments", { signal }),

  object: (id: number, signal?: AbortSignal) =>
    request<{ object: MetObject }>(`/api/objects/${id}`, { signal }),

  search: (params: { q: string; hasImages?: boolean }, signal?: AbortSignal) => {
    const query = new URLSearchParams({ q: params.q });
    if (params.hasImages !== undefined) {
      query.set("hasImages", String(params.hasImages));
    }
    return request<{ total: number; objectIDs: number[] | null }>(`/api/search?${query}`, {
      signal
    });
  },

  refresh: () => request<{ user: SafeUser; accessToken: string }>("/api/auth/refresh"),

  collections: (token: string) =>
    request<{ collections: Collection[] }>("/api/collections", { token })
};
