/**
 * Curated invoice styles — five complete, hand-tuned `InvoiceStyle` objects that
 * ship as the selectable starting points in the style panel. Each is already
 * print-legible, so it passes `validateAndClampStyle` unchanged; they double as the
 * anchors the local heuristic provider blends toward.
 */

import { CLASSIC_THEME, type InvoiceStyle } from "./invoice-theme";

export const CLASSIC_PRESET = CLASSIC_THEME;

export const MODERN_PRESET: InvoiceStyle = {
  id: "modern",
  label: "Modern",
  paper: "letter",
  colors: {
    accent: "#2563eb",
    accentForeground: "#ffffff",
    text: "#0f172a",
    muted: "#64748b",
    border: "#e5e9f0",
    surface: "#ffffff",
    tableHeaderBg: "#eef2ff",
    tableHeaderText: "#1e3a8a",
  },
  typography: {
    bodyFont: '"Inter", ui-sans-serif, system-ui, sans-serif',
    headingFont: '"Inter", ui-sans-serif, system-ui, sans-serif',
    baseSize: "13px",
    tabularNumbers: true,
  },
  layout: {
    headerLayout: "banner",
    tableStyle: "striped",
    density: "comfortable",
    logoPlacement: "left",
    radius: "12px",
    sectionGap: "24px",
    pagePadding: "0.75in",
  },
};

export const MINIMAL_PRESET: InvoiceStyle = {
  id: "minimal",
  label: "Minimal",
  paper: "a4",
  colors: {
    accent: "#111827",
    accentForeground: "#ffffff",
    text: "#111827",
    muted: "#6b7280",
    border: "#ececec",
    surface: "#ffffff",
    tableHeaderBg: "#ffffff",
    tableHeaderText: "#111827",
  },
  typography: {
    bodyFont: '"Inter", ui-sans-serif, system-ui, sans-serif',
    headingFont: '"Inter", ui-sans-serif, system-ui, sans-serif',
    baseSize: "12px",
    tabularNumbers: true,
  },
  layout: {
    headerLayout: "classic",
    tableStyle: "minimal",
    density: "compact",
    logoPlacement: "none",
    radius: "0px",
    sectionGap: "18px",
    pagePadding: "0.6in",
  },
};

export const BOLD_PRESET: InvoiceStyle = {
  id: "bold",
  label: "Bold",
  paper: "letter",
  colors: {
    accent: "#b91c1c",
    accentForeground: "#ffffff",
    text: "#171717",
    muted: "#737373",
    border: "#e7e5e4",
    surface: "#ffffff",
    tableHeaderBg: "#b91c1c",
    tableHeaderText: "#ffffff",
  },
  typography: {
    bodyFont: '"Inter", ui-sans-serif, system-ui, sans-serif',
    headingFont: '"Georgia", "Times New Roman", serif',
    baseSize: "14px",
    tabularNumbers: true,
  },
  layout: {
    headerLayout: "banner",
    tableStyle: "lined",
    density: "comfortable",
    logoPlacement: "left",
    radius: "6px",
    sectionGap: "26px",
    pagePadding: "0.75in",
  },
};

export const BRANDED_PRESET: InvoiceStyle = {
  id: "branded",
  label: "Branded",
  paper: "letter",
  colors: {
    accent: "#0f766e",
    accentForeground: "#ffffff",
    text: "#134e4a",
    muted: "#5f6b6a",
    border: "#d5e3e0",
    surface: "#ffffff",
    tableHeaderBg: "#ccfbf1",
    tableHeaderText: "#134e4a",
  },
  typography: {
    bodyFont: '"Inter", ui-sans-serif, system-ui, sans-serif',
    headingFont: '"Inter", ui-sans-serif, system-ui, sans-serif',
    baseSize: "13px",
    tabularNumbers: true,
  },
  layout: {
    headerLayout: "sidebar",
    tableStyle: "striped",
    density: "comfortable",
    logoPlacement: "left",
    radius: "14px",
    sectionGap: "22px",
    pagePadding: "0.7in",
  },
};

/** Ordered list backing the preset picker. */
export const INVOICE_PRESETS: InvoiceStyle[] = [
  CLASSIC_PRESET,
  MODERN_PRESET,
  MINIMAL_PRESET,
  BOLD_PRESET,
  BRANDED_PRESET,
];

export const PRESETS_BY_ID: Record<string, InvoiceStyle> = Object.fromEntries(
  INVOICE_PRESETS.map((p) => [p.id, p]),
);

export function presetById(id: string): InvoiceStyle | undefined {
  return PRESETS_BY_ID[id];
}
