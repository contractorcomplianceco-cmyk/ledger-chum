import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { BANK_ACCOUNTS, RECON_HISTORY } from "@/lib/mock/banking";
import { currencyPrecise } from "@/lib/mock/finance";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

function accountLabel(id: string) {
  const a = BANK_ACCOUNTS.find((b) => b.id === id);
  return a ? `${a.nickname} ${a.mask}` : id;
}

export function ReconciliationHistoryTable() {
  return (
    <Card className="overflow-hidden border-border/60 shadow-elegant">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-3 py-2.5 text-left">Account</th>
              <th className="px-3 py-2.5 text-left">Period</th>
              <th className="px-3 py-2.5 text-right">Starting</th>
              <th className="px-3 py-2.5 text-right">Ending</th>
              <th className="px-3 py-2.5 text-right">Diff</th>
              <th className="px-3 py-2.5 text-left">Status</th>
              <th className="px-3 py-2.5 text-left">Prepared by</th>
              <th className="px-3 py-2.5 text-left">Approved by</th>
              <th className="px-3 py-2.5 text-left">Completed</th>
              <th className="px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {RECON_HISTORY.map((r) => (
              <tr key={r.id} className="border-t border-border/60 hover:bg-muted/30">
                <td className="whitespace-nowrap px-3 py-2.5 font-medium">
                  {accountLabel(r.accountId)}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">{r.period}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-tabular">
                  {currencyPrecise(r.starting)}
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-tabular">
                  {currencyPrecise(r.ending)}
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap px-3 py-2.5 text-right font-tabular",
                    r.diff === 0 ? "text-success" : "text-destructive",
                  )}
                >
                  {currencyPrecise(r.diff)}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-xs">{r.preparedBy}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-xs">{r.approvedBy}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted-foreground">
                  {r.completedOn}
                </td>
                <td className="px-3 py-2.5">
                  <Button variant="ghost" size="sm" className="h-7">
                    <Eye className="mr-1 h-3.5 w-3.5" /> View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
