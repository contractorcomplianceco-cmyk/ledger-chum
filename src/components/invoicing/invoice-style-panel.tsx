import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Check, Save, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { InvoiceStyle } from "@/lib/invoicing/invoice-theme";
import { INVOICE_PRESETS } from "@/lib/invoicing/invoice-presets";
import { validateAndClampStyle } from "@/lib/invoicing/invoice-style-schema";
import { getStyleProvider, isAiStyleProviderEnabled } from "@/lib/invoicing/style-providers";

/**
 * Style panel for the invoice document/preview. Lets the user pick a curated preset,
 * describe a look in free text ("Make it look like…"), and save the current style as
 * the company brand default. It only ever calls `onChange` with a validated style —
 * it never touches the invoice's numbers or content.
 */
export function InvoiceStylePanel({
  style,
  onChange,
  companyName,
  onSaveBrand,
  canSaveBrand = false,
  className,
}: {
  style: InvoiceStyle;
  onChange: (style: InvoiceStyle) => void;
  companyName?: string;
  /** When provided, renders a "Save as brand default" action. */
  onSaveBrand?: (style: InvoiceStyle) => Promise<void>;
  canSaveBrand?: boolean;
  className?: string;
}) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);

  const applyPreset = (preset: InvoiceStyle) => {
    setNotes([]);
    onChange(validateAndClampStyle(preset).style);
  };

  const generate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setGenerating(true);
    try {
      const next = await getStyleProvider().generate(trimmed, { companyName, base: style });
      const { style: safe, adjustments } = validateAndClampStyle(next);
      setNotes(adjustments);
      onChange(safe);
      toast.success("Style generated", {
        description: isAiStyleProviderEnabled
          ? "Applied a model-generated style (validated for legibility)."
          : "Applied a style from your description.",
      });
    } catch {
      toast.error("Could not generate a style", { description: "Please try a different prompt." });
    } finally {
      setGenerating(false);
    }
  };

  const saveBrand = async () => {
    if (!onSaveBrand) return;
    setSaving(true);
    try {
      await onSaveBrand(validateAndClampStyle(style).style);
      toast.success("Saved as brand default", {
        description: "New invoices will inherit this style; you can override per invoice.",
      });
    } catch {
      toast.error("Could not save brand default");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className={cn("border border-border/70 bg-surface p-4 shadow-card", className)}>
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4 text-muted-foreground" />
        <div className="text-[13.5px] font-semibold text-foreground">Invoice style</div>
        <Badge variant="outline" className="ml-auto text-[10px] font-normal">
          {isAiStyleProviderEnabled ? "AI" : "Local"} engine
        </Badge>
      </div>

      <div className="mt-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Presets
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {INVOICE_PRESETS.map((preset) => {
            const active = preset.id === style.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-colors",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:bg-muted/60",
                )}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                  style={{ background: preset.colors.accent }}
                  aria-hidden="true"
                />
                {preset.label}
                {active && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="invoice-style-prompt"
          className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
        >
          Describe a look
        </label>
        <Textarea
          id="invoice-style-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") generate();
          }}
          rows={2}
          placeholder="Make it look like… e.g. 'modern navy with a banner header and striped table'"
          className="mt-1 text-[13px]"
        />
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm" onClick={generate} disabled={generating || !prompt.trim()}>
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {generating ? "Generating…" : "Generate style"}
          </Button>
          {onSaveBrand && (
            <Button
              variant="outline"
              size="sm"
              onClick={saveBrand}
              disabled={saving || !canSaveBrand}
              title={
                canSaveBrand
                  ? "Save this style as the company default"
                  : "Sign in to an organization to save a brand default"
              }
            >
              <Save className="mr-1.5 h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save as brand default"}
            </Button>
          )}
        </div>
      </div>

      {notes.length > 0 && (
        <div className="mt-3 rounded-md border border-warning/30 bg-warning/5 p-2 text-[11.5px] text-warning">
          <div className="font-semibold">Legibility guardrails applied:</div>
          <ul className="mt-1 space-y-0.5">
            {notes.map((n, i) => (
              <li key={i}>• {n}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted-foreground">
        Styling only affects presentation. Amounts, line items, and totals are locked.
      </p>
    </Card>
  );
}
