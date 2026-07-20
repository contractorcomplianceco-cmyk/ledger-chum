/**
 * Provider factory — the one place that decides which gateway is live.
 *
 * Demo mode (or missing Authorize.net secrets) resolves to the offline
 * {@link DemoPaymentProvider}. Production mode with configured secrets resolves
 * to the {@link AuthorizeNetProvider}.
 *
 * To add a new processor later: implement {@link PaymentProvider} in its own
 * `*.server.ts`, then add a branch here keyed off `PAYMENT_PROVIDER` (or your
 * own selection rule). No call site changes.
 *
 * `.server.ts`: never bundled to the client.
 */

import { resolveServerMode } from "@/lib/app-mode";
import { DemoPaymentProvider } from "./demo-provider";
import { AuthorizeNetProvider } from "./authorize-net.server";
import type { PaymentProvider } from "./types";

let cached: PaymentProvider | null = null;

function build(): PaymentProvider {
  // Explicit override wins (useful for staging against the real sandbox).
  const explicit = (process.env.PAYMENT_PROVIDER ?? "").toLowerCase();
  if (explicit === "demo") return new DemoPaymentProvider();
  if (explicit === "authorize_net" || explicit === "authorizenet") {
    return new AuthorizeNetProvider();
  }

  // Otherwise follow the app data mode. Production requires real secrets; if
  // they are absent we fall back to demo rather than crash a live boot.
  if (resolveServerMode() === "production" && process.env.AUTHORIZENET_API_LOGIN_ID) {
    return new AuthorizeNetProvider();
  }
  return new DemoPaymentProvider();
}

export function getPaymentProvider(): PaymentProvider {
  if (!cached) cached = build();
  return cached;
}

/** Test/hot-reload helper. */
export function resetPaymentProvider(): void {
  cached = null;
}
