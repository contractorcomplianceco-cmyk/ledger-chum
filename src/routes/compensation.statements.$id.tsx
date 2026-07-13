import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CompensationShell } from "@/components/compensation/compensation-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api/client";
import type { CompensationStatement } from "@/lib/api/services/compensation";
import { currency } from "@/lib/mock/finance";

export const Route = createFileRoute("/compensation/statements/$id")({
  head: () => ({ meta: [{ title: "Statement — LedgerOS" }] }),
  component: StatementDetail,
});

function StatementDetail() {
  const { id } = Route.useParams();
  const [s, setS] = useState<CompensationStatement | undefined>();
  useEffect(() => { api.compensationOps.getStatement(id).then(setS); }, [id]);

  if (!s) return <CompensationShell title="Statement"><Card className="p-6 text-sm text-muted-foreground">Loading…</Card></CompensationShell>;

  return (
    <CompensationShell eyebrow={`${s.periodType} statement`} title={s.participantName} description={`${s.periodStart} → ${s.periodEnd} · Compensation classes kept strictly separate`}>
      <Card className="p-5 grid gap-3 md:grid-cols-6 text-sm">
        <F k="Beginning" v={s.beginningBalance} />
        <F k="Projected" v={s.projected} />
        <F k="Earned" v={s.earned} />
        <F k="Verified" v={s.verified} />
        <F k="Approved" v={s.approved} />
        <F k="Reserved" v={s.reserved} />
        <F k="Payable" v={s.payable} />
        <F k="Paid" v={s.paid} />
        <F k="Holdbacks" v={s.holdbacks} />
        <F k="Adjustments" v={s.adjustments} />
        <F k="Clawbacks" v={s.clawbacks} />
        <F k="Ending" v={s.endingBalance} bold />
      </Card>

      {s.sections.map((sec) => (
        <Card key={sec.kind} className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{sec.label}</div>
              <Badge variant="outline" className="mt-1 text-[10px]">{sec.kind.replace(/_/g, " ")}</Badge>
            </div>
            <div className="font-tabular text-lg font-bold">{currency(sec.total)}</div>
          </div>
          {sec.lines.length === 0 ? (
            <div className="text-xs text-muted-foreground">No activity in this period.</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {sec.lines.map((l) => (
                <li key={l.id} className="rounded-md border border-border/40 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{l.clientName ?? "—"} · {l.opportunityName ?? ""}</div>
                    <div className="font-tabular font-semibold">{currency(l.amount)}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{l.planName} v{l.planVersion} · {l.status.replace(/_/g, " ")} · {l.effectiveDate}</div>
                  <div className="mt-1 text-xs">{l.explanation}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </CompensationShell>
  );
}

function F({ k, v, bold }: { k: string; v: number; bold?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{k}</div>
      <div className={`mt-0.5 font-tabular ${bold ? "text-lg font-bold" : ""}`}>{currency(v)}</div>
    </div>
  );
}
