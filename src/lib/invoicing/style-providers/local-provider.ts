/**
 * Deterministic, offline `InvoiceStyleProvider`. Maps keywords in the prompt to
 * concrete style tokens so the "Make it look like…" box works end-to-end today with
 * no AI model connected. It is also the fallback the LLM provider degrades to when
 * unconfigured or on error.
 *
 * The mapping is intentionally simple and total: it starts from a base style (a
 * matched preset or the provided context base), layers keyword-driven overrides,
 * then hands the result to `validateAndClampStyle`. Same prompt → same style.
 */

import { CLASSIC_THEME, type InvoiceStyle } from "../invoice-theme";
import {
  BOLD_PRESET,
  BRANDED_PRESET,
  CLASSIC_PRESET,
  MINIMAL_PRESET,
  MODERN_PRESET,
} from "../invoice-presets";
import { bestForeground, validateAndClampStyle } from "../invoice-style-schema";
import type { InvoiceStyleProvider, StyleContext } from "./provider";

/** Ordered preset keyword matches — first hit wins, so it is deterministic. */
const PRESET_KEYWORDS: Array<[RegExp, InvoiceStyle]> = [
  [/\b(minimal|minimalist|clean|simple|understated|bare)\b/, MINIMAL_PRESET],
  [/\b(bold|strong|loud|striking|dramatic|heavy)\b/, BOLD_PRESET],
  [/\b(brand|branded|logo[- ]?forward|sidebar)\b/, BRANDED_PRESET],
  [/\b(modern|sleek|contemporary|fresh)\b/, MODERN_PRESET],
  [/\b(classic|traditional|formal|standard|professional)\b/, CLASSIC_PRESET],
];

/** Named accent colors the heuristic understands. First match wins. */
const COLOR_KEYWORDS: Array<[RegExp, string]> = [
  [/\bnavy\b/, "#1e3a8a"],
  [/\b(teal|aqua)\b/, "#0f766e"],
  [/\b(green|emerald|forest)\b/, "#15803d"],
  [/\b(red|crimson|scarlet)\b/, "#b91c1c"],
  [/\b(purple|violet|indigo)\b/, "#6d28d9"],
  [/\borange\b/, "#ea580c"],
  [/\b(gold|amber|mustard)\b/, "#b45309"],
  [/\b(pink|magenta|rose)\b/, "#be185d"],
  [/\b(black|charcoal|monochrome|mono)\b/, "#111827"],
  [/\b(slate|gray|grey)\b/, "#334155"],
  [/\bblue\b/, "#2563eb"],
];

const SERIF_STACK = '"Georgia", "Times New Roman", serif';
const SANS_STACK = '"Inter", ui-sans-serif, system-ui, sans-serif';
const MONO_STACK = '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace';

function clone(style: InvoiceStyle): InvoiceStyle {
  return {
    ...style,
    colors: { ...style.colors },
    typography: { ...style.typography },
    layout: { ...style.layout },
  };
}

function firstMatch<T>(text: string, table: Array<[RegExp, T]>): T | undefined {
  for (const [re, val] of table) if (re.test(text)) return val;
  return undefined;
}

/**
 * Pure prompt → style mapping. Exported for direct unit testing. The result is
 * already validated/clamped, so it is always safe to render.
 */
export function heuristicStyleFromPrompt(prompt: string, context?: StyleContext): InvoiceStyle {
  const text = (prompt ?? "").toLowerCase();

  // 1. Base: matched preset > provided context base > Classic.
  const preset = firstMatch(text, PRESET_KEYWORDS);
  const base = clone(preset ?? context?.base ?? CLASSIC_THEME);

  // 2. Accent color.
  const accent = firstMatch(text, COLOR_KEYWORDS);
  if (accent) {
    base.colors.accent = accent;
    base.colors.accentForeground = bestForeground(accent);
  }

  // 3. Typography pairing.
  if (/\b(serif|elegant|editorial|luxury|refined)\b/.test(text)) {
    base.typography.headingFont = SERIF_STACK;
    if (/\ball[- ]?serif|serif body\b/.test(text)) base.typography.bodyFont = SERIF_STACK;
  } else if (/\b(mono|monospace|technical|code)\b/.test(text)) {
    base.typography.headingFont = MONO_STACK;
  } else if (/\b(sans|geometric|clean)\b/.test(text)) {
    base.typography.headingFont = SANS_STACK;
    base.typography.bodyFont = SANS_STACK;
  }

  // 4. Density.
  if (/\b(compact|dense|tight|condensed)\b/.test(text)) base.layout.density = "compact";
  else if (/\b(spacious|airy|roomy|comfortable|breathable)\b/.test(text)) {
    base.layout.density = "comfortable";
  }

  // 5. Table style.
  if (/\b(striped|zebra|banded)\b/.test(text)) base.layout.tableStyle = "striped";
  else if (/\b(borderless|no lines|minimal table|clean table)\b/.test(text)) {
    base.layout.tableStyle = "minimal";
  } else if (/\b(lined|bordered|grid|ruled)\b/.test(text)) base.layout.tableStyle = "lined";

  // 6. Header layout.
  if (/\b(banner|header band|full[- ]?width header)\b/.test(text)) {
    base.layout.headerLayout = "banner";
  } else if (/\b(sidebar|rail|left column)\b/.test(text)) base.layout.headerLayout = "sidebar";
  else if (/\bcenter(ed)?\b/.test(text)) base.layout.headerLayout = "centered";
  else if (/\bclassic header\b/.test(text)) base.layout.headerLayout = "classic";

  // 7. Logo placement.
  if (/\b(no logo|logoless|without (a )?logo|hide logo)\b/.test(text)) {
    base.layout.logoPlacement = "none";
  } else if (/\blogo (on the )?right\b/.test(text)) base.layout.logoPlacement = "right";
  else if (/\b(centered logo|logo (in the )?cent(er|re))\b/.test(text)) {
    base.layout.logoPlacement = "center";
  }

  // 8. Paper size.
  if (/\ba4\b/.test(text)) base.paper = "a4";
  else if (/\b(letter|us letter)\b/.test(text)) base.paper = "letter";

  // 9. Rounded / sharp corners.
  if (/\b(sharp|square|hard) corners?\b/.test(text)) base.layout.radius = "0px";
  else if (/\b(rounded|soft|pill) corners?\b/.test(text)) base.layout.radius = "14px";

  // Mint a fresh id/label so the result is distinguishable from the seed preset.
  base.id = `prompt-${hashPrompt(text)}`;
  base.label = "Custom (prompt)";

  return validateAndClampStyle(base).style;
}

/** Small stable hash for a readable, deterministic id suffix. */
function hashPrompt(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export class LocalStyleProvider implements InvoiceStyleProvider {
  readonly id = "local-heuristic";

  async generate(prompt: string, context?: StyleContext): Promise<InvoiceStyle> {
    return heuristicStyleFromPrompt(prompt, context);
  }
}
