import { apiConfig } from "../config";

/**
 * Mock adapter helpers. Services import these to simulate latency and
 * return typed envelopes matching the real Express contract.
 */

export async function mockDelay(ms = apiConfig.mockLatencyMs): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockGet<T>(fn: () => T): Promise<T> {
  await mockDelay();
  return fn();
}

export async function mockMutation<T>(
  fn: () => T,
  message: string,
): Promise<{
  ok: true;
  demo: true;
  data: T;
  message: string;
}> {
  await mockDelay();
  return { ok: true, demo: true, data: fn(), message };
}
