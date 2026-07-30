import { z } from "zod";

/**
 * Typed HTTP client shared by every external CCA integration.
 *
 * Responsibilities:
 *   - Attach a scoped Bearer API key + JSON headers.
 *   - Attach an Idempotency-Key on writes (mirrors the LedgerOS public
 *     integrations contract so retries are safe end-to-end).
 *   - Retry idempotent/transient failures with exponential backoff + jitter.
 *   - Validate every response body against a caller-supplied Zod schema so a
 *     drifting upstream contract fails loudly instead of leaking `any`.
 *
 * The class is dependency-injected with `fetchImpl` so unit tests can mock the
 * network without touching global fetch.
 */

export class IntegrationError extends Error {
  constructor(
    public readonly service: string,
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(`[${service}] ${message}`);
    this.name = "IntegrationError";
  }
}

export interface IntegrationClientConfig {
  /** Service label used in errors/logs, e.g. "auditengine". */
  service: string;
  /** Base URL with no trailing slash, e.g. https://audit.cca.example. */
  baseUrl: string;
  /** Scoped API key for this consumer. Sent as `Authorization: Bearer`. */
  apiKey?: string;
  /** Max retry attempts for transient failures (default 3). */
  maxRetries?: number;
  /** Base backoff in ms (default 200). */
  backoffBaseMs?: number;
  /** Per-request timeout in ms (default 15000). */
  timeoutMs?: number;
  /** Injectable fetch (defaults to global fetch). */
  fetchImpl?: typeof fetch;
  /** Extra static headers (e.g. a service-identity header). */
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions<TSchema extends z.ZodTypeAny> {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** Path appended to baseUrl, starting with `/`. */
  path: string;
  /** Query params; undefined/null values are skipped. */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** JSON body for writes. */
  body?: unknown;
  /** Zod schema the response JSON must satisfy. */
  schema: TSchema;
  /** Idempotency-Key for safe write retries. */
  idempotencyKey?: string;
  /** Override retry count for this call. */
  maxRetries?: number;
}

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class IntegrationHttpClient {
  private readonly cfg: Required<Omit<IntegrationClientConfig, "apiKey" | "defaultHeaders">> &
    Pick<IntegrationClientConfig, "apiKey" | "defaultHeaders">;

  constructor(config: IntegrationClientConfig) {
    this.cfg = {
      service: config.service,
      baseUrl: config.baseUrl.replace(/\/+$/, ""),
      apiKey: config.apiKey,
      maxRetries: config.maxRetries ?? 3,
      backoffBaseMs: config.backoffBaseMs ?? 200,
      timeoutMs: config.timeoutMs ?? 15000,
      fetchImpl: config.fetchImpl ?? globalThis.fetch,
      defaultHeaders: config.defaultHeaders,
    };
    if (!this.cfg.baseUrl) {
      throw new IntegrationError(
        config.service,
        0,
        "baseUrl is required but was empty — check the service env var",
      );
    }
  }

  private buildUrl(path: string, query?: RequestOptions<z.ZodTypeAny>["query"]): string {
    const url = new URL(this.cfg.baseUrl + path);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private headers(opts: { hasBody: boolean; idempotencyKey?: string }): Headers {
    const headers = new Headers(this.cfg.defaultHeaders);
    headers.set("accept", "application/json");
    if (opts.hasBody) headers.set("content-type", "application/json");
    if (this.cfg.apiKey) headers.set("authorization", `Bearer ${this.cfg.apiKey}`);
    if (opts.idempotencyKey) headers.set("idempotency-key", opts.idempotencyKey);
    return headers;
  }

  async request<TSchema extends z.ZodTypeAny>(
    opts: RequestOptions<TSchema>,
  ): Promise<z.infer<TSchema>> {
    const method = opts.method ?? "GET";
    const url = this.buildUrl(opts.path, opts.query);
    const hasBody = opts.body !== undefined && method !== "GET";
    const maxRetries = opts.maxRetries ?? this.cfg.maxRetries;

    let lastErr: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.cfg.timeoutMs);
      try {
        const res = await this.cfg.fetchImpl(url, {
          method,
          headers: this.headers({ hasBody, idempotencyKey: opts.idempotencyKey }),
          body: hasBody ? JSON.stringify(opts.body) : undefined,
          signal: controller.signal,
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => "");
          if (RETRYABLE_STATUS.has(res.status) && attempt < maxRetries) {
            lastErr = new IntegrationError(
              this.cfg.service,
              res.status,
              `HTTP ${res.status} on ${method} ${opts.path}`,
              errBody,
            );
            await sleep(this.backoff(attempt, res.headers.get("retry-after")));
            continue;
          }
          throw new IntegrationError(
            this.cfg.service,
            res.status,
            `HTTP ${res.status} on ${method} ${opts.path}`,
            errBody,
          );
        }

        const json: unknown = await res.json().catch(() => {
          throw new IntegrationError(
            this.cfg.service,
            res.status,
            `Invalid JSON response on ${method} ${opts.path}`,
          );
        });

        const parsed = opts.schema.safeParse(json);
        if (!parsed.success) {
          throw new IntegrationError(
            this.cfg.service,
            res.status,
            `Response contract violation on ${method} ${opts.path}: ${parsed.error.message}`,
            json,
          );
        }
        return parsed.data;
      } catch (err) {
        // Retry network/abort errors (not contract violations).
        const isContractError =
          err instanceof IntegrationError && !RETRYABLE_STATUS.has(err.status);
        if (isContractError || attempt >= maxRetries) throw err;
        lastErr = err;
        await sleep(this.backoff(attempt, null));
      } finally {
        clearTimeout(timer);
      }
    }
    throw lastErr instanceof Error
      ? lastErr
      : new IntegrationError(this.cfg.service, 0, "Request failed");
  }

  private backoff(attempt: number, retryAfter: string | null): number {
    if (retryAfter) {
      const secs = Number(retryAfter);
      if (Number.isFinite(secs) && secs >= 0) return secs * 1000;
    }
    const base = this.cfg.backoffBaseMs * 2 ** attempt;
    return base + Math.floor(Math.random() * this.cfg.backoffBaseMs);
  }
}
