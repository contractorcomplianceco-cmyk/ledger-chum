/**
 * Validation, clamping, and legibility guardrails for `InvoiceStyle`.
 *
 * Any style that reaches `<InvoiceDocument>` — whether from a curated preset, the
 * local heuristic provider, or a real AI model — is funneled through
 * `validateAndClampStyle`. That function is the trust boundary: it parses the shape
 * with Zod, then clamps every value to a safe, print-legible range. A generated
 * style can therefore only ever affect PRESENTATION, and can never produce an
 * unreadable or off-page document.
 *
 * Crucially, this module knows nothing about invoice numbers, line items, or totals.
 * Styles carry no monetary data, so no amount can be changed here by construction.
 */

import { z } from "zod";
import {
  CLASSIC_THEME,
  type Density,
  type HeaderLayout,
  type InvoiceStyle,
  type LogoPlacement,
  type PaperSize,
  type TableStyle,
} from "./invoice-theme";

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const hexColor = z.string().trim().regex(HEX_COLOR, "must be a #rgb or #rrggbb hex color");

export const invoiceStyleColorsSchema = z.object({
  accent: hexColor,
  accentForeground: hexColor,
  text: hexColor,
  muted: hexColor,
  border: hexColor,
  surface: hexColor,
  tableHeaderBg: hexColor,
  tableHeaderText: hexColor,
});

export const invoiceStyleTypographySchema = z.object({
  bodyFont: z.string().trim().min(1).max(200),
  headingFont: z.string().trim().min(1).max(200),
  baseSize: z.string().trim().min(1).max(12),
  tabularNumbers: z.boolean(),
});

export const invoiceStyleLayoutSchema = z.object({
  headerLayout: z.enum(["classic", "centered", "banner", "sidebar"]),
  tableStyle: z.enum(["lined", "striped", "minimal"]),
  density: z.enum(["compact", "comfortable"]),
  logoPlacement: z.enum(["left", "right", "center", "none"]),
  radius: z.string().trim().min(1).max(12),
  sectionGap: z.string().trim().min(1).max(12),
  pagePadding: z.string().trim().min(1).max(12),
});

export const invoiceStyleSchema = z.object({
  id: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(80),
  paper: z.enum(["letter", "a4"]),
  colors: invoiceStyleColorsSchema,
  typography: invoiceStyleTypographySchema,
  layout: invoiceStyleLayoutSchema,
});

/** Shape a model/provider is expected to return, before clamping. */
export type InvoiceStyleInput = z.infer<typeof invoiceStyleSchema>;

// ---------------------------------------------------------------------------
// Color math — WCAG relative luminance & contrast ratio.
// ---------------------------------------------------------------------------

function expandHex(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length === 3)
    return h
      .split("")
      .map((c) => c + c)
      .join("");
  return h;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = expandHex(hex);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** WCAG relative luminance (0 = black, 1 = white). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors (1..21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Pick black or white — whichever reads better on `bg`. */
export function bestForeground(bg: string): "#0f172a" | "#ffffff" {
  return contrastRatio("#ffffff", bg) >= contrastRatio("#0f172a", bg) ? "#ffffff" : "#0f172a";
}

/**
 * Ensure `fg` meets `min` contrast against `bg`; if not, fall back to the
 * higher-contrast of black/white. Returns the (possibly corrected) foreground.
 */
export function ensureContrast(fg: string, bg: string, min: number): string {
  return contrastRatio(fg, bg) >= min ? fg : bestForeground(bg);
}

// WCAG AA thresholds: 4.5 for body/normal text, 3.0 for large/secondary text.
export const CONTRAST_BODY = 4.5;
export const CONTRAST_LARGE = 3;

// A surface must be light enough to print cheaply and read under ink. Below this
// luminance we treat it as "dark page" and reset to white.
const MIN_SURFACE_LUMINANCE = 0.6;

// ---------------------------------------------------------------------------
// Length clamping — keep the document on its page and legible.
// ---------------------------------------------------------------------------

interface LengthBound {
  units: string[];
  /** min/max in the length's own unit, keyed by unit. */
  min: Record<string, number>;
  max: Record<string, number>;
}

function clampLength(value: string, fallback: string, bound: LengthBound): string {
  const m = /^(-?\d*\.?\d+)(px|in|mm|rem|em)$/.exec(value.trim());
  if (!m) return fallback;
  const num = parseFloat(m[1]);
  const unit = m[2];
  if (!bound.units.includes(unit)) return fallback;
  const min = bound.min[unit];
  const max = bound.max[unit];
  if (min === undefined || max === undefined) return fallback;
  const clamped = Math.min(max, Math.max(min, num));
  // Trim trailing ".0" for tidy output.
  const out = Number.isInteger(clamped) ? String(clamped) : String(clamped);
  return `${out}${unit}`;
}

const BASE_SIZE_BOUND: LengthBound = {
  units: ["px"],
  min: { px: 11 },
  max: { px: 15 },
};
const RADIUS_BOUND: LengthBound = {
  units: ["px"],
  min: { px: 0 },
  max: { px: 20 },
};
const SECTION_GAP_BOUND: LengthBound = {
  units: ["px"],
  min: { px: 12 },
  max: { px: 36 },
};
const PAGE_PADDING_BOUND: LengthBound = {
  units: ["in", "mm", "px"],
  min: { in: 0.4, mm: 10, px: 32 },
  max: { in: 1, mm: 25, px: 96 },
};

// ---------------------------------------------------------------------------
// The trust boundary.
// ---------------------------------------------------------------------------

export interface ClampResult {
  style: InvoiceStyle;
  /** Human-readable notes about what was corrected — surfaced in the UI/tests. */
  adjustments: string[];
}

/**
 * Parse, clamp, and legibility-correct an untrusted style object. On a total parse
 * failure, returns `CLASSIC_THEME` with a single adjustment note (never throws), so
 * callers always get a renderable style.
 */
export function validateAndClampStyle(input: unknown): ClampResult {
  const parsed = invoiceStyleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      style: CLASSIC_THEME,
      adjustments: ["Style could not be parsed; fell back to Classic."],
    };
  }

  const raw = parsed.data;
  const adjustments: string[] = [];
  const colors = { ...raw.colors };

  // 1. Print-safe: page background must be light. A dark surface both burns ink and
  //    breaks the "text on white" contrast assumptions below.
  if (relativeLuminance(colors.surface) < MIN_SURFACE_LUMINANCE) {
    colors.surface = "#ffffff";
    adjustments.push("Surface darkened past print-safe range; reset to white.");
  }

  // 2. Body text must clear AA against the surface.
  const fixedText = ensureContrast(colors.text, colors.surface, CONTRAST_BODY);
  if (fixedText !== colors.text) {
    colors.text = fixedText;
    adjustments.push("Body text had low contrast on the page; corrected.");
  }

  // 3. Secondary/muted text — large-text AA is enough.
  const fixedMuted = ensureContrast(colors.muted, colors.surface, CONTRAST_LARGE);
  if (fixedMuted !== colors.muted) {
    colors.muted = fixedMuted;
    adjustments.push("Muted text had low contrast on the page; corrected.");
  }

  // 4. Accent foreground (logo/banner/pay button) vs accent.
  const fixedAccentFg = ensureContrast(colors.accentForeground, colors.accent, CONTRAST_BODY);
  if (fixedAccentFg !== colors.accentForeground) {
    colors.accentForeground = fixedAccentFg;
    adjustments.push("Accent foreground was illegible on the accent color; corrected.");
  }

  // 5. Table header text vs its background.
  const fixedTheadFg = ensureContrast(colors.tableHeaderText, colors.tableHeaderBg, CONTRAST_BODY);
  if (fixedTheadFg !== colors.tableHeaderText) {
    colors.tableHeaderText = fixedTheadFg;
    adjustments.push("Table header text had low contrast; corrected.");
  }

  // 6. Lengths — keep the invoice on its page and readable.
  const baseSize = clampLength(
    raw.typography.baseSize,
    CLASSIC_THEME.typography.baseSize,
    BASE_SIZE_BOUND,
  );
  if (baseSize !== raw.typography.baseSize) {
    adjustments.push(`Base font size clamped to a legible range (${baseSize}).`);
  }
  const radius = clampLength(raw.layout.radius, CLASSIC_THEME.layout.radius, RADIUS_BOUND);
  if (radius !== raw.layout.radius) adjustments.push(`Corner radius clamped (${radius}).`);
  const sectionGap = clampLength(
    raw.layout.sectionGap,
    CLASSIC_THEME.layout.sectionGap,
    SECTION_GAP_BOUND,
  );
  if (sectionGap !== raw.layout.sectionGap) {
    adjustments.push(`Section spacing clamped to fit the page (${sectionGap}).`);
  }
  const pagePadding = clampLength(
    raw.layout.pagePadding,
    CLASSIC_THEME.layout.pagePadding,
    PAGE_PADDING_BOUND,
  );
  if (pagePadding !== raw.layout.pagePadding) {
    adjustments.push(`Page padding clamped to fit the page (${pagePadding}).`);
  }

  const style: InvoiceStyle = {
    id: raw.id,
    label: raw.label,
    paper: raw.paper as PaperSize,
    colors,
    typography: {
      bodyFont: raw.typography.bodyFont,
      headingFont: raw.typography.headingFont,
      baseSize,
      tabularNumbers: raw.typography.tabularNumbers,
    },
    layout: {
      headerLayout: raw.layout.headerLayout as HeaderLayout,
      tableStyle: raw.layout.tableStyle as TableStyle,
      density: raw.layout.density as Density,
      logoPlacement: raw.layout.logoPlacement as LogoPlacement,
      radius,
      sectionGap,
      pagePadding,
    },
  };

  return { style, adjustments };
}
