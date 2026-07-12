import type { TransactionKind } from "@/lib/mock/banking";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Percent,
  Receipt,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAP: Record<TransactionKind, { icon: typeof ArrowDownLeft; label: string; className: string }> = {
  deposit: { icon: ArrowDownLeft, label: "Deposit", className: "text-success bg-success/10" },
  withdrawal: { icon: ArrowUpRight, label: "Withdrawal", className: "text-foreground bg-muted" },
  transfer: { icon: ArrowLeftRight, label: "Transfer", className: "text-brand-cyan bg-brand-cyan/15" },
  fee: { icon: Receipt, label: "Fee", className: "text-muted-foreground bg-muted" },
  interest: { icon: Percent, label: "Interest", className: "text-success bg-success/10" },
  refund: { icon: Undo2, label: "Refund", className: "text-warning bg-warning/15" },
};

export function TxKindIcon({ kind, size = "sm" }: { kind: TransactionKind; size?: "sm" | "md" }) {
  const m = MAP[kind];
  const Icon = m.icon;
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-md",
        size === "sm" ? "h-6 w-6" : "h-8 w-8",
        m.className,
      )}
      aria-label={m.label}
      title={m.label}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </span>
  );
}

export function TxKindLabel({ kind }: { kind: TransactionKind }) {
  return <span className="text-xs text-muted-foreground">{MAP[kind].label}</span>;
}
