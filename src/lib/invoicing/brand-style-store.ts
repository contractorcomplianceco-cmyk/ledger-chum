/**
 * Client seam for the per-company brand-default `InvoiceStyle`, honoring the Phase 1
 * data mode:
 *   • DEMO — persisted to `localStorage` (with an in-memory fallback for SSR), so the
 *     save-brand-default flow is fully exercisable without a backend.
 *   • PRODUCTION — persisted via the org-scoped server functions in
 *     `brand-style.functions.ts` (RLS-backed table).
 *
 * Either way the loaded style is run through `validateAndClampStyle`, so a stale or
 * hand-edited value can never render an unsafe document.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { isProductionMode } from "@/lib/app-mode";
import { useOrgId } from "@/hooks/use-current-org";
import type { InvoiceStyle } from "./invoice-theme";
import { validateAndClampStyle } from "./invoice-style-schema";
import { getBrandStyle, saveBrandStyle } from "./brand-style.functions";

const DEMO_KEY = "ledgeros.invoice.brandStyle.v1";

let memoryFallback: InvoiceStyle | null = null;

function loadDemoBrandStyle(): InvoiceStyle | null {
  if (typeof window === "undefined") return memoryFallback;
  try {
    const raw = window.localStorage.getItem(DEMO_KEY);
    if (!raw) return null;
    return validateAndClampStyle(JSON.parse(raw)).style;
  } catch {
    return memoryFallback;
  }
}

function saveDemoBrandStyle(style: InvoiceStyle): void {
  memoryFallback = style;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(style));
  } catch {
    // Ignore quota/availability errors — the in-memory copy still holds.
  }
}

export interface UseBrandStyleResult {
  /** The saved brand default, or null if none is set. */
  brandStyle: InvoiceStyle | null;
  loading: boolean;
  /** Whether saving is currently possible (production requires a resolved org). */
  canSave: boolean;
  /** Persist `style` as the company default for the active mode. */
  save: (style: InvoiceStyle) => Promise<void>;
}

export function useBrandStyle(): UseBrandStyleResult {
  const production = isProductionMode();
  const orgId = useOrgId();
  const queryClient = useQueryClient();
  const getFn = useServerFn(getBrandStyle);
  const saveFn = useServerFn(saveBrandStyle);

  const query = useQuery({
    queryKey: ["invoice-brand-style", production, orgId],
    queryFn: async (): Promise<InvoiceStyle | null> => {
      if (production && orgId) {
        try {
          return await getFn({ data: { orgId } });
        } catch {
          return null;
        }
      }
      return loadDemoBrandStyle();
    },
    staleTime: 5 * 60 * 1000,
  });

  const save = async (style: InvoiceStyle) => {
    if (production && orgId) {
      await saveFn({ data: { orgId, style } });
    } else {
      saveDemoBrandStyle(style);
    }
    await queryClient.invalidateQueries({ queryKey: ["invoice-brand-style"] });
  };

  return {
    brandStyle: query.data ?? null,
    loading: query.isLoading,
    canSave: !production || !!orgId,
    save,
  };
}
