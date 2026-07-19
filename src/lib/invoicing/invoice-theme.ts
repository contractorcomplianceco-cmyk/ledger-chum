/**
 * Invoice document style contract.
 *
 * The visual invoice is intentionally split from its content: `InvoiceDocumentData`
 * (see `./invoice-document`) carries the numbers and text, while `InvoiceStyle`
 * carries every presentation decision. Phase B (AI styling) generates `InvoiceStyle`
 * objects — from curated presets, a free-text prompt, or a saved brand default —
 * and nothing about the figures or their correctness depends on the style.
 *
 * Phase B widens the Phase A `InvoiceTheme` into a full generative contract: on top
 * of the visual tokens (colors, typography, spacing) it now controls LAYOUT and
 * STRUCTURE — header variants, table style, density, logo placement, paper size.
 * `InvoiceTheme` remains exported as a backward-compatible alias of `InvoiceStyle`.
 *
 * Visual tokens are surfaced to the DOM as `--inv-*` CSS custom properties via
 * `styleToCssVars`; structural choices are surfaced as `data-*` attributes via
 * `styleDataAttrs`. The component reads those, so the styling seam stays declarative.
 */

import type { CSSProperties } from "react";

export type PaperSize = "letter" | "a4";

/** Structural arrangement of the document header. */
export type HeaderLayout = "classic" | "centered" | "banner" | "sidebar";

/** Line-item table treatment. */
export type TableStyle = "lined" | "striped" | "minimal";

/** Vertical rhythm / whitespace budget. */
export type Density = "compact" | "comfortable";

/** Where (if anywhere) the issuer logo block sits. */
export type LogoPlacement = "left" | "right" | "center" | "none";

export interface InvoicePaper {
  size: PaperSize;
  /** CSS length for the rendered page width (screen preview). */
  width: string;
  /** CSS length for the minimum page height (screen preview). */
  minHeight: string;
  /** Print `@page` margin, e.g. "0.75in". */
  margin: string;
}

export const PAPER: Record<PaperSize, Omit<InvoicePaper, "margin">> = {
  letter: { size: "letter", width: "8.5in", minHeight: "11in" },
  a4: { size: "a4", width: "210mm", minHeight: "297mm" },
};

export interface InvoiceStyleColors {
  /** Primary brand color — header band, accents, totals emphasis. */
  accent: string;
  /** Text/graphics drawn on top of `accent`. */
  accentForeground: string;
  /** Default body text. */
  text: string;
  /** Secondary / label text. */
  muted: string;
  /** Hairline borders and rules. */
  border: string;
  /** Page background. */
  surface: string;
  /** Line-item table header background. */
  tableHeaderBg: string;
  /** Line-item table header text. */
  tableHeaderText: string;
}

export interface InvoiceStyleTypography {
  /** Body font stack. */
  bodyFont: string;
  /** Heading font stack (invoice number, section titles). */
  headingFont: string;
  /** Base body font size, CSS length. */
  baseSize: string;
  /** Numeric font-feature — tabular figures keep money columns aligned. */
  tabularNumbers: boolean;
}

export interface InvoiceStyleLayout {
  /** Header structure variant. */
  headerLayout: HeaderLayout;
  /** Line-item table treatment. */
  tableStyle: TableStyle;
  /** Whitespace budget. */
  density: Density;
  /** Logo block placement (also gates whether the logo renders at all). */
  logoPlacement: LogoPlacement;
  /** Corner radius for framed blocks, CSS length. */
  radius: string;
  /** Vertical rhythm between document sections, CSS length. */
  sectionGap: string;
  /** Padding inside the page, CSS length. */
  pagePadding: string;
}

export interface InvoiceStyle {
  /** Stable id (e.g. "classic"); prompt/LLM generation may mint new ids. */
  id: string;
  label: string;
  paper: PaperSize;
  colors: InvoiceStyleColors;
  typography: InvoiceStyleTypography;
  layout: InvoiceStyleLayout;
}

/**
 * Backward-compatible alias. Phase A code referenced `InvoiceTheme`; it is now the
 * full `InvoiceStyle`. New code should prefer `InvoiceStyle`.
 */
export type InvoiceTheme = InvoiceStyle;

/**
 * Default, always-safe style. Neutral navy + clean sans, US Letter. Chosen so a
 * document renders correctly even if a caller passes no style.
 */
export const CLASSIC_THEME: InvoiceStyle = {
  id: "classic",
  label: "Classic",
  paper: "letter",
  colors: {
    accent: "#1e293b",
    accentForeground: "#ffffff",
    text: "#0f172a",
    muted: "#64748b",
    border: "#e2e8f0",
    surface: "#ffffff",
    tableHeaderBg: "#f1f5f9",
    tableHeaderText: "#334155",
  },
  typography: {
    bodyFont: '"Inter", ui-sans-serif, system-ui, sans-serif',
    headingFont: '"Inter", ui-sans-serif, system-ui, sans-serif',
    baseSize: "13px",
    tabularNumbers: true,
  },
  layout: {
    headerLayout: "classic",
    tableStyle: "lined",
    density: "comfortable",
    logoPlacement: "left",
    radius: "10px",
    sectionGap: "22px",
    pagePadding: "0.75in",
  },
};

/** Row padding (Y axis) per density — drives table/meta breathing room. */
const DENSITY_ROW_PAD: Record<Density, string> = {
  compact: "5px",
  comfortable: "9px",
};

/**
 * Flatten a style's visual tokens into inline CSS custom properties. The component
 * reads these exclusively for color/type/spacing, so swapping styles never touches
 * component code.
 */
export function styleToCssVars(style: InvoiceStyle): CSSProperties {
  const paper = PAPER[style.paper];
  return {
    "--inv-accent": style.colors.accent,
    "--inv-accent-fg": style.colors.accentForeground,
    "--inv-text": style.colors.text,
    "--inv-muted": style.colors.muted,
    "--inv-border": style.colors.border,
    "--inv-surface": style.colors.surface,
    "--inv-thead-bg": style.colors.tableHeaderBg,
    "--inv-thead-fg": style.colors.tableHeaderText,
    "--inv-body-font": style.typography.bodyFont,
    "--inv-heading-font": style.typography.headingFont,
    "--inv-base-size": style.typography.baseSize,
    "--inv-numeric": style.typography.tabularNumbers ? "tabular-nums" : "normal",
    "--inv-radius": style.layout.radius,
    "--inv-section-gap": style.layout.sectionGap,
    "--inv-page-padding": style.layout.pagePadding,
    "--inv-row-pad-y": DENSITY_ROW_PAD[style.layout.density],
    "--inv-page-width": paper.width,
    "--inv-page-min-height": paper.minHeight,
  } as CSSProperties;
}

/** Structural choices surfaced as `data-*` attributes for the component to branch on. */
export function styleDataAttrs(style: InvoiceStyle): Record<string, string> {
  return {
    "data-header": style.layout.headerLayout,
    "data-table": style.layout.tableStyle,
    "data-density": style.layout.density,
    "data-logo": style.layout.logoPlacement,
  };
}

/**
 * @deprecated Use `styleToCssVars`. Kept so Phase A imports keep compiling.
 */
export const themeToCssVars = styleToCssVars;

/** CSS `@page` size keyword for a paper size. */
export function paperPageSize(size: PaperSize): string {
  return size === "a4" ? "A4" : "letter";
}
