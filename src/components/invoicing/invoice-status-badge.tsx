import { cn } from "@/lib/utils";
import { INVOICE_STATUS_META, type InvoiceStatus } from "@/lib/mock/invoicing";

const toneClass: Record<string, string> = {
  muted: "bg-muted text-muted-foreground ring-border",
  info: "bg-blue-500/10 text-blue-600 ring-blue-500/20",
  warning: "bg-warning/15 text-warning ring-warning/25",
  success: "bg-success/10 text-success ring-success/20",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  violet: "bg-violet-500/10 text-violet-600 ring-violet-500/20",
};

export function InvoiceStatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  const meta = INVOICE_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        toneClass[meta.tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </span>
  );
}
