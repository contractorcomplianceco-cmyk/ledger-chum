import { apiConfig } from "../config";
import { ApiError, NotConfiguredError, type FieldError } from "../errors";
import type { CommissionsService } from "../services/commissions";

/**
 * Express API adapter — typed placeholder.
 *
 * When the production LedgerOS backend URL is configured (VITE_LEDGEROS_API_BASE_URL
 * + VITE_LEDGEROS_API_MODE=production), the httpFetch helper below is used by
 * service adapters to talk to the real backend.
 *
 * Cookie-based auth: relies on `credentials: "include"` so browser session
 * cookies flow to the Express API. No token handling here.
 */

interface HttpOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: HttpOptions["query"]): string {
  if (!apiConfig.baseUrl) {
    throw new NotConfiguredError(
      "VITE_LEDGEROS_API_BASE_URL is not set. Cannot reach production backend.",
    );
  }
  const url = new URL(
    path.startsWith("/") ? path.slice(1) : path,
    apiConfig.baseUrl + "/",
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function normalizeError(res: Response): Promise<never> {
  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // ignore JSON parse errors
  }
  const record = (payload as Record<string, unknown>) ?? {};
  const message =
    (record.message as string | undefined) ||
    (record.error as string | undefined) ||
    `Request failed with status ${res.status}`;
  const fields = record.fields as FieldError[] | undefined;
  const correlationId = res.headers.get("x-correlation-id") ?? undefined;

  const opts = { status: res.status, fields, correlationId };
  switch (res.status) {
    case 401:
      throw new ApiError("unauthorized", message, opts);
    case 403:
      throw new ApiError("forbidden", message, opts);
    case 404:
      throw new ApiError("not_found", message, opts);
    case 409:
      throw new ApiError("conflict", message, opts);
    case 422:
      throw new ApiError("validation", message, opts);
    case 500:
    case 502:
    case 503:
    case 504:
      throw new ApiError("server", message, opts);
    default:
      throw new ApiError("unknown", message, opts);
  }
}

export async function httpFetch<T>(path: string, opts: HttpOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.query);
  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      credentials: apiConfig.useCredentials ? "include" : "same-origin",
      headers: {
        Accept: "application/json",
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
        ...(opts.headers ?? {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch (err) {
    throw new ApiError("network", err instanceof Error ? err.message : "Network error");
  }

  if (!res.ok) await normalizeError(res);
  if (res.status === 204) return undefined as T;

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

/**
 * Real service adapters go here when the backend contract is stable.
 * Kept as `null` (undefined export) so `api.commissions` falls back to
 * the mock impl. When you're ready to wire commissions in production:
 *
 *   export const expressCommissions: CommissionsService = {
 *     listPlans: (params) => httpFetch("/api/commissions/plans", { query: params }),
 *     ...
 *   };
 */
export const expressCommissions: CommissionsService | null = null;
