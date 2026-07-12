import { cn } from "@/lib/utils";
import type { Spendability } from "@/lib/mock/cash-availability";

const toneMap: Record<Spendability, string> = {
  restricted: "bg-destructive/10 text-destructive ring-destructive/20",
  reserved: "bg-warning/15 text-warning ring-warning/25",
  operating: "bg-success/10 text-success ring-success/20",
};

const labelMap: Record<Spendability, string> = {
  restricted: "Restricted",
  reserved: "Reserved",
  operating: "Operating",
};

export function TreatmentBadge({
  spendability,
  className,
}: {
  spendability: Spendability;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        toneMap[spendability],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          spendability === "restricted"
            ? "bg-destructive"
            : spendability === "reserved"
              ? "bg-warning"
              : "bg-success",
        )}
      />
      {labelMap[spendability]}
    </span>
  );
}
