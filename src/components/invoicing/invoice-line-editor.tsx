import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { TREATMENT_META, type Treatment } from "@/lib/mock/cash-availability";
import { TreatmentBadge } from "@/components/cash/treatment-badge";
import type { InvoiceLine } from "@/lib/mock/invoicing";
import { currencyPrecise } from "@/lib/mock/finance";

const TREATMENTS: Treatment[] = [
  "cca_revenue",
  "commissionable",
  "non_commissionable",
  "pass_through",
  "tax_reserve",
  "refundable_deposit",
  "deferred_revenue",
  "reimbursable",
  "other_restricted",
];

export function InvoiceLineEditor({
  line,
  onChange,
  onRemove,
}: {
  line: InvoiceLine;
  onChange: (patch: Partial<InvoiceLine>) => void;
  onRemove: () => void;
}) {
  const gross = line.qty * line.rate;
  const total = gross - line.discount + line.tax;
  const meta = TREATMENT_META[line.treatment];

  return (
    <div className="rounded-xl border border-border/70 bg-surface p-3 shadow-card">
      <div className="grid grid-cols-[auto_minmax(0,2fr)_80px_100px_100px_120px_auto] items-start gap-2">
        <GripVertical className="mt-2 h-4 w-4 text-muted-foreground/60" />
        <div>
          <Input
            value={line.service}
            onChange={(e) => onChange({ service: e.target.value })}
            placeholder="Service or product"
            className="h-9 text-[13px]"
          />
          {line.description !== undefined && (
            <Input
              value={line.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Description"
              className="mt-1.5 h-8 text-[12px]"
            />
          )}
        </div>
        <Input
          type="number"
          value={line.qty}
          min={0}
          onChange={(e) => onChange({ qty: Number(e.target.value) || 0 })}
          className="h-9 text-right font-tabular text-[13px]"
        />
        <Input
          type="number"
          value={line.rate}
          min={0}
          onChange={(e) => onChange({ rate: Number(e.target.value) || 0 })}
          className="h-9 text-right font-tabular text-[13px]"
        />
        <Input
          type="number"
          value={line.discount}
          min={0}
          onChange={(e) => onChange({ discount: Number(e.target.value) || 0 })}
          className="h-9 text-right font-tabular text-[13px]"
        />
        <div className="text-right">
          <div className="font-tabular text-[14px] font-semibold text-foreground">
            {currencyPrecise(total)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-9 w-9 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2 pl-6">
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Financial treatment
          </label>
          <Select
            value={line.treatment}
            onValueChange={(v) => onChange({ treatment: v as Treatment })}
          >
            <SelectTrigger className="mt-1 h-8 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TREATMENTS.map((t) => (
                <SelectItem key={t} value={t} className="text-[12px]">
                  {TREATMENT_META[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Department
          </label>
          <Input
            value={line.department ?? ""}
            onChange={(e) => onChange({ department: e.target.value })}
            placeholder="—"
            className="mt-1 h-8 text-[12px]"
          />
        </div>
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            State / jurisdiction
          </label>
          <Input
            value={line.jurisdiction ?? ""}
            onChange={(e) => onChange({ jurisdiction: e.target.value })}
            placeholder="—"
            className="mt-1 h-8 text-[12px]"
          />
        </div>
        <div>
          <label className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Commission owner
          </label>
          <Input
            value={line.commissionOwner ?? ""}
            onChange={(e) => onChange({ commissionOwner: e.target.value })}
            placeholder="—"
            className="mt-1 h-8 text-[12px]"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 pl-6 text-[11px] text-muted-foreground">
        <TreatmentBadge spendability={meta.spendability} />
        <span>
          {meta.label} · {meta.glAccount}
        </span>
      </div>
    </div>
  );
}
