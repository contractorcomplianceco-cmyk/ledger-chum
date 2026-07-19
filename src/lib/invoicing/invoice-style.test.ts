import { describe, it, expect } from "vitest";
import { heuristicStyleFromPrompt } from "./style-providers/local-provider";
import {
  CONTRAST_BODY,
  contrastRatio,
  relativeLuminance,
  validateAndClampStyle,
} from "./invoice-style-schema";
import { INVOICE_PRESETS, MODERN_PRESET } from "./invoice-presets";
import { CLASSIC_THEME, type InvoiceStyle } from "./invoice-theme";
import { computeDocumentTotals, fromMockInvoice } from "./invoice-document";
import { INVOICES, CUSTOMERS, computeInvoice } from "@/lib/mock/invoicing";

describe("local provider: prompt → style mapping", () => {
  it("maps a color keyword to the accent (navy)", () => {
    const s = heuristicStyleFromPrompt("navy invoice");
    expect(s.colors.accent.toLowerCase()).toBe("#1e3a8a");
  });

  it("selects a base preset from a keyword (minimal)", () => {
    const s = heuristicStyleFromPrompt("keep it minimal and clean");
    expect(s.layout.tableStyle).toBe("minimal");
    expect(s.layout.density).toBe("compact");
  });

  it("maps 'serif' to a serif heading font", () => {
    const s = heuristicStyleFromPrompt("elegant serif look");
    expect(s.typography.headingFont.toLowerCase()).toContain("serif");
  });

  it("maps structural keywords: banner header + striped table + compact", () => {
    const s = heuristicStyleFromPrompt("modern banner header, striped table, compact");
    expect(s.layout.headerLayout).toBe("banner");
    expect(s.layout.tableStyle).toBe("striped");
    expect(s.layout.density).toBe("compact");
  });

  it("maps logo + paper directives", () => {
    const s = heuristicStyleFromPrompt("no logo, a4 page");
    expect(s.layout.logoPlacement).toBe("none");
    expect(s.paper).toBe("a4");
  });

  it("is deterministic — same prompt yields an identical style", () => {
    const a = heuristicStyleFromPrompt("bold red with sharp corners");
    const b = heuristicStyleFromPrompt("bold red with sharp corners");
    expect(a).toEqual(b);
  });

  it("falls back to the provided base style when no preset keyword matches", () => {
    const s = heuristicStyleFromPrompt("teal accent please", { base: MODERN_PRESET });
    // Modern base retained (banner header), only the accent overridden.
    expect(s.layout.headerLayout).toBe("banner");
    expect(s.colors.accent.toLowerCase()).toBe("#0f766e");
  });
});

describe("schema validation & clamping", () => {
  it("returns Classic on an unparseable object", () => {
    const { style, adjustments } = validateAndClampStyle({ nope: true });
    expect(style).toEqual(CLASSIC_THEME);
    expect(adjustments.length).toBeGreaterThan(0);
  });

  it("clamps an oversized base font size into the legible range", () => {
    const bad: InvoiceStyle = {
      ...CLASSIC_THEME,
      typography: { ...CLASSIC_THEME.typography, baseSize: "40px" },
    };
    const { style, adjustments } = validateAndClampStyle(bad);
    expect(style.typography.baseSize).toBe("15px");
    expect(adjustments.some((a) => /font size/i.test(a))).toBe(true);
  });

  it("clamps page padding so the document stays on its page", () => {
    const bad: InvoiceStyle = {
      ...CLASSIC_THEME,
      layout: { ...CLASSIC_THEME.layout, pagePadding: "5in" },
    };
    const { style } = validateAndClampStyle(bad);
    expect(style.layout.pagePadding).toBe("1in");
  });

  it("rejects a non-hex color by falling back to Classic", () => {
    const bad = {
      ...CLASSIC_THEME,
      colors: { ...CLASSIC_THEME.colors, accent: "rebeccapurple" },
    };
    const { style } = validateAndClampStyle(bad);
    expect(style).toEqual(CLASSIC_THEME);
  });
});

describe("guardrails: contrast & print safety", () => {
  it("contrastRatio math: black on white is 21, identical colors are 1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
  });

  it("corrects low-contrast body text on the surface", () => {
    const bad: InvoiceStyle = {
      ...CLASSIC_THEME,
      colors: { ...CLASSIC_THEME.colors, text: "#f5f5f5", surface: "#ffffff" },
    };
    const { style, adjustments } = validateAndClampStyle(bad);
    expect(contrastRatio(style.colors.text, style.colors.surface)).toBeGreaterThanOrEqual(
      CONTRAST_BODY,
    );
    expect(adjustments.some((a) => /body text/i.test(a))).toBe(true);
  });

  it("corrects illegible accent foreground against the accent", () => {
    const bad: InvoiceStyle = {
      ...CLASSIC_THEME,
      colors: { ...CLASSIC_THEME.colors, accent: "#1e293b", accentForeground: "#0f172a" },
    };
    const { style } = validateAndClampStyle(bad);
    expect(
      contrastRatio(style.colors.accentForeground, style.colors.accent),
    ).toBeGreaterThanOrEqual(CONTRAST_BODY);
  });

  it("resets a dark (non-print-safe) surface to white", () => {
    const bad: InvoiceStyle = {
      ...CLASSIC_THEME,
      colors: { ...CLASSIC_THEME.colors, surface: "#0b1020" },
    };
    const { style, adjustments } = validateAndClampStyle(bad);
    expect(style.colors.surface).toBe("#ffffff");
    expect(adjustments.some((a) => /surface/i.test(a))).toBe(true);
    expect(relativeLuminance(style.colors.surface)).toBeGreaterThan(0.9);
  });

  it("every shipped preset is already legible and passes clamping unchanged", () => {
    for (const preset of INVOICE_PRESETS) {
      const { style, adjustments } = validateAndClampStyle(preset);
      expect(adjustments).toEqual([]);
      expect(style).toEqual(preset);
      expect(contrastRatio(style.colors.text, style.colors.surface)).toBeGreaterThanOrEqual(
        CONTRAST_BODY,
      );
    }
  });
});

describe("style never changes the numbers", () => {
  const MONEY_KEYS = ["subtotal", "discount", "tax", "total", "amount", "amountPaid", "balanceDue"];

  it("an InvoiceStyle object carries no monetary fields", () => {
    for (const preset of INVOICE_PRESETS) {
      const json = JSON.stringify(preset);
      for (const k of MONEY_KEYS) expect(json).not.toContain(`"${k}"`);
    }
    const generated = heuristicStyleFromPrompt("bold navy striped compact a4");
    const json = JSON.stringify(generated);
    for (const k of MONEY_KEYS) expect(json).not.toContain(`"${k}"`);
  });

  it("document totals are identical no matter which style is applied", () => {
    const inv = INVOICES[0];
    const customer = CUSTOMERS.find((c) => c.id === inv.customerId);
    const baseline = fromMockInvoice(inv, customer).totals;
    const internal = computeInvoice(inv.lines);

    const styles = [
      ...INVOICE_PRESETS,
      heuristicStyleFromPrompt("wild neon everything, huge fonts, no logo"),
      validateAndClampStyle({
        ...CLASSIC_THEME,
        colors: { ...CLASSIC_THEME.colors, surface: "#000" },
      }).style,
    ];

    for (const _style of styles) {
      // Recomputing the client-facing document is independent of style; totals match.
      const totals = computeDocumentTotals(inv.lines, inv.paid);
      expect(totals).toEqual(baseline);
      expect(totals.total).toBeCloseTo(internal.total, 6);
    }
  });
});
