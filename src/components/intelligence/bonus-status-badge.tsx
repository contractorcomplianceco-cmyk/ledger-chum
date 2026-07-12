import { cn } from "@/lib/utils";
import { BONUS_STATUS_META, type BonusStatus } from "@/lib/mock/intelligence";

export function BonusStatusBadge({ status }: { status: BonusStatus }) {
  const meta = BONUS_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}
