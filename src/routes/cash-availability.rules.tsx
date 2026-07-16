import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TREATMENT_META, type Treatment } from "@/lib/mock/cash-availability";
import { TreatmentBadge } from "@/components/cash/treatment-badge";
import { AlertTriangle, Pencil } from "lucide-react";

export const Route = createFileRoute("/cash-availability/rules")({
  head: () => ({
    meta: [
      { title: "Treatment rules — LedgerOS Cash Availability" },
      {
        name: "description",
        content:
          "Financial treatment for every invoice line item: GL account mapping, recognition policy, and accountant-review flags.",
      },
    ],
  }),
  component: TreatmentRulesPage,
});

const ORDER: Treatment[] = [
  "cca_revenue",
  "commissionable",
  "non_commissionable",
  "pass_through",
  "tax_reserve",
  "deferred_revenue",
  "refundable_deposit",
  "reimbursable",
  "other_restricted",
];

function TreatmentRulesPage() {
  return (
    <div className="space-y-4">
      <Card className="border border-warning/25 bg-warning/[0.05] p-4 shadow-card">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div className="text-[12.5px] text-foreground/80">
            <span className="font-semibold text-foreground">
              Draft — pending accountant review.
            </span>{" "}
            Final GL mapping and recognition policy should be reviewed by CCA's accountant before
            production posting. Treatments marked{" "}
            <span className="font-semibold">Needs review</span> below have material
            accounting-policy implications.
          </div>
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {ORDER.map((t) => {
          const meta = TREATMENT_META[t];
          return (
            <Card key={t} className="border border-border/70 bg-surface p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-[14px] font-semibold text-foreground">{meta.label}</div>
                    <TreatmentBadge spendability={meta.spendability} />
                    {meta.reviewNeeded && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-warning ring-1 ring-inset ring-warning/20">
                        <AlertTriangle className="h-3 w-3" />
                        Needs review
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-[12.5px] text-muted-foreground">{meta.description}</div>
                </div>
                <Button variant="outline" size="sm" className="h-8 shrink-0 text-[12px]">
                  <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
              </div>

              <div className="mt-3 grid gap-2 rounded-lg border border-border/70 bg-muted/20 p-3 sm:grid-cols-2">
                <Field label="GL account" value={meta.glAccount} mono />
                <Field label="Spendability" value={spendabilityCopy[meta.spendability]} />
                <Field label="Recognition" value={recognitionCopy[t]} />
                <Field label="Held on balance sheet as" value={balanceSheetCopy[t]} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

const spendabilityCopy = {
  restricted: "Never available for operating spend",
  reserved: "Held for a known obligation; not free cash",
  operating: "Free operating cash after allocation",
} as const;

const recognitionCopy: Record<Treatment, string> = {
  cca_revenue: "Recognized at service delivery",
  commissionable: "Recognized at delivery; commission accrues at recognition",
  non_commissionable: "Recognized at delivery; no commission accrual",
  pass_through: "Never revenue — liability until remitted to third party",
  tax_reserve: "Set aside at collection; released against tax payment",
  deferred_revenue: "Recognized ratably over service period",
  refundable_deposit: "Not revenue until earned; refunded on cancellation",
  reimbursable: "Offset against expense at recoup, not revenue",
  other_restricted: "Held per contract terms; not commingled with operating cash",
};

const balanceSheetCopy: Record<Treatment, string> = {
  cca_revenue: "Revenue (P&L)",
  commissionable: "Revenue with commission accrual liability",
  non_commissionable: "Revenue (P&L)",
  pass_through: "Client trust liability",
  tax_reserve: "Tax reserve liability",
  deferred_revenue: "Deferred revenue liability",
  refundable_deposit: "Refundable deposit liability",
  reimbursable: "Reimbursable receivable / expense offset",
  other_restricted: "Restricted liability",
};

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div
        className={mono ? "font-mono text-[12px] text-foreground" : "text-[12.5px] text-foreground"}
      >
        {value}
      </div>
    </div>
  );
}
