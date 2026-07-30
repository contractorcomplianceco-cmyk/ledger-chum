/**
 * Server-side integration config resolver.
 *
 * Reads the base URL + scoped API key for a given external service from
 * environment variables. NEVER import this from client components — the API
 * keys are secrets and must stay on the server.
 *
 * Convention per service X:
 *   <X>_BASE_URL   — required to enable the live client
 *   <X>_API_KEY    — scoped consumer key (optional for public endpoints)
 */

export interface ResolvedServiceConfig {
  service: string;
  baseUrl: string;
  apiKey?: string;
  /** True when a base URL is configured; false means "stub / not wired". */
  enabled: boolean;
}

export interface ServiceEnvKeys {
  service: string;
  baseUrlVar: string;
  apiKeyVar?: string;
}

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : undefined;
}

export function resolveServiceConfig(keys: ServiceEnvKeys): ResolvedServiceConfig {
  const baseUrl = readEnv(keys.baseUrlVar) ?? "";
  const apiKey = keys.apiKeyVar ? readEnv(keys.apiKeyVar) : undefined;
  return {
    service: keys.service,
    baseUrl,
    apiKey,
    enabled: Boolean(baseUrl),
  };
}

/** Throws a clear error when a live client is requested but not configured. */
export function requireServiceConfig(
  keys: ServiceEnvKeys,
): Required<Pick<ResolvedServiceConfig, "baseUrl">> & ResolvedServiceConfig {
  const cfg = resolveServiceConfig(keys);
  if (!cfg.enabled) {
    throw new Error(
      `[${keys.service}] ${keys.baseUrlVar} is not set — integration is not configured. ` +
        `Set it in .env (see docs/integrations/README.md) or use the stub.`,
    );
  }
  return cfg;
}
