import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/mock/finance";
import { CATEGORY_META, type Receipt } from "@/lib/mock/expenses";
import { ConfidenceBar } from "./confidence-bar";
import { Receipt as ReceiptIcon, Copy, AlertCircle, CheckCircle2, Mail, Smartphone, Globe, Plug } from "lucide-react";

const STATUS_LABEL: Record<Receipt["status"], { label: string; className: string }> = {
  new: { label: "New", className: "text-muted-foreground" },
  processing: { label: "Processing…", className: "text-brand" },
  ready: { label: "Ready to match", className: "text-brand" },
  low_confidence: { label: "Low confidence", className: "text-warning" },
  possible_duplicate: { label: "Possible duplicate", className: "text-destructive" },
  missing_expense: { label: "No matching expense", className: "text-warning" },
  matched: { label: "Matched", className: "text-success" },
  rejected: { label: "Rejected", className: "text-destructive" },
};

const SRC_ICON = { email: Mail, mobile: Smartphone, web: Globe, integration: Plug };

export function ReceiptCard({ r }: { r: Receipt }) {
  const SrcIcon = SRC_ICON[r.source];
  const StatusIcon =
    r.status === "matched" ? CheckCircle2 :
    r.status === "possible_duplicate" ? Copy :
    r.status === "low_confidence" || r.status === "missing_expense" ? AlertCircle :
    ReceiptIcon;

  return (
    <Card className="border-border/70 p-3">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
          <ReceiptIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-semibold">{r.vendor}</div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                <SrcIcon className="h-3 w-3" /> {r.uploadedBy} · {r.date}
              </div>
            </div>
            <div className="text-right font-tabular font-semibold">{currency(r.amount)}</div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px]">
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_META[r.suggestedCategory].color }} />
              {CATEGORY_META[r.suggestedCategory].label}
            </span>
            <ConfidenceBar value={r.confidence} label="Extraction confidence" />
            <span className={STATUS_LABEL[r.status].className + " inline-flex items-center gap-1"}>
              <StatusIcon className="h-3 w-3" />
              {STATUS_LABEL[r.status].label}
            </span>
            {r.suggestedMatch && <span className="text-muted-foreground">→ {r.suggestedMatch}</span>}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">Accept</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">Edit fields</Button>
        <Button size="sm" variant="outline" className="h-7 text-[11.5px]">Match</Button>
        <Button size="sm" variant="ghost" className="h-7 text-[11.5px]">Reject</Button>
      </div>
    </Card>
  );
}
