import { cn } from "@/lib/utils";
import { LIKELIHOOD_META, type PaymentLikelihood } from "@/lib/mock/invoicing";
import { Sparkles } from "lucide-react";

const toneClass = {
  success: "bg-success/10 text-success ring-success/20",
  info: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
  warning: "bg-warning/15 text-warning ring-warning/25",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
} as const;

export function PaymentLikelihoodChip({
  likelihood,
  compact = false,
  className,
}: {
  likelihood: PaymentLikelihood;
  compact?: boolean;
  className?: string;
}) {
  const meta = LIKELIHOOD_META[likelihood];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        toneClass[meta.tone],
        className,
      )}
      title={meta.label}
    >
      <Sparkles className="h-3 w-3" />
      {compact ? meta.short : meta.label}
      <span className="ml-0.5 font-tabular opacity-75">{meta.score}</span>
    </span>
  );
}
