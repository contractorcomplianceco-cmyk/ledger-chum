/**
 * Invoice document theme contract.
 *
 * The visual invoice is intentionally split from its content: `InvoiceDocumentData`
 * (see `./invoice-document`) carries the numbers and text, while `InvoiceTheme`
 * carries every styling decision. Phase B (AI styling) will generate `InvoiceTheme`
 * objects; nothing about the figures or their correctness depends on the theme.
 *
 * All theme values are surfaced to the DOM as `--inv-*` CSS custom properties via
 * `themeToCssVars`, so the component itself never branches on the theme — it just
 * reads variables. That keeps the styling seam declarative and forward-compatible.
 */

import type { CSSProperties } from "react";

export type PaperSize = "letter" | "a4";

export type HeaderLayout = "logo-left" | "logo-right" | "centered";

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

export interface InvoiceThemeColors {
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

export interface InvoiceThemeTypography {
  /** Body font stack. */
  bodyFont: string;
  /** Heading font stack (invoice number, section titles). */
  headingFont: string;
  /** Base body font size, CSS length. */
  baseSize: string;
  /** Numeric font-feature — tabular figures keep money columns aligned. */
  tabularNumbers: boolean;
}

export interface InvoiceThemeLayout {
  header: HeaderLayout;
  /** Show the issuer logo block. */
  showLogo: boolean;
  /** Corner radius for framed blocks, CSS length. */
  radius: string;
  /** Vertical rhythm between document sections, CSS length. */
  sectionGap: string;
  /** Padding inside the page, CSS length. */
  pagePadding: string;
}

export interface InvoiceTheme {
  /** Stable id (e.g. "classic"); Phase B may mint new ids. */
  id: string;
  label: string;
  paper: PaperSize;
  colors: InvoiceThemeColors;
  typography: InvoiceThemeTypography;
  layout: InvoiceThemeLayout;
}

/**
 * Default, always-safe theme. Neutral navy + clean sans, US Letter. Chosen so a
 * document renders correctly even if a caller passes no theme.
 */
export const CLASSIC_THEME: InvoiceTheme = {
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
    header: "logo-left",
    showLogo: true,
    radius: "10px",
    sectionGap: "22px",
    pagePadding: "0.75in",
  },
};

/**
 * Flatten a theme into inline CSS custom properties. The component reads these
 * exclusively, so swapping themes never touches component code.
 */
export function themeToCssVars(theme: InvoiceTheme): CSSProperties {
  const paper = PAPER[theme.paper];
  return {
    "--inv-accent": theme.colors.accent,
    "--inv-accent-fg": theme.colors.accentForeground,
    "--inv-text": theme.colors.text,
    "--inv-muted": theme.colors.muted,
    "--inv-border": theme.colors.border,
    "--inv-surface": theme.colors.surface,
    "--inv-thead-bg": theme.colors.tableHeaderBg,
    "--inv-thead-fg": theme.colors.tableHeaderText,
    "--inv-body-font": theme.typography.bodyFont,
    "--inv-heading-font": theme.typography.headingFont,
    "--inv-base-size": theme.typography.baseSize,
    "--inv-numeric": theme.typography.tabularNumbers ? "tabular-nums" : "normal",
    "--inv-radius": theme.layout.radius,
    "--inv-section-gap": theme.layout.sectionGap,
    "--inv-page-padding": theme.layout.pagePadding,
    "--inv-page-width": paper.width,
    "--inv-page-min-height": paper.minHeight,
  } as CSSProperties;
}

/** CSS `@page` size keyword for a paper size. */
export function paperPageSize(size: PaperSize): string {
  return size === "a4" ? "A4" : "letter";
}
