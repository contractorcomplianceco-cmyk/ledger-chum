import { AlertTriangle, Info, ShieldAlert, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type BankingAlertSeverity = "info" | "review" | "warning" | "critical";

const MAP: Record<
  BankingAlertSeverity,
  { icon: typeof Info; label: string; className: string; iconClass: string }
> = {
  info: {
    icon: Info,
    label: "Informational",
    className: "border-info/30 bg-info/5",
    iconClass: "text-info bg-info/10",
  },
  review: {
    icon: Eye,
    label: "Review",
    className: "border-brand/30 bg-brand/5",
    iconClass: "text-brand bg-brand/10",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    className: "border-warning/40 bg-warning/5",
    iconClass: "text-warning bg-warning/10",
  },
  critical: {
    icon: ShieldAlert,
    label: "Critical",
    className: "border-destructive/40 bg-destructive/5",
    iconClass: "text-destructive bg-destructive/10",
  },
};

export function BankingAlert({
  severity,
  title,
  detail,
  account,
}: {
  severity: BankingAlertSeverity;
  title: string;
  detail: string;
  account?: string;
}) {
  const m = MAP[severity];
  const Icon = m.icon;
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-3", m.className)}>
      <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", m.iconClass)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {m.label}
          </span>
          {account && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {account}
            </span>
          )}
        </div>
        <div className="mt-0.5 text-sm font-medium">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}
