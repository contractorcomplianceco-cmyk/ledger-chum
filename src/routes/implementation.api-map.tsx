import { createFileRoute } from "@tanstack/react-router";
import { ImplementationPage } from "@/components/implementation/implementation-page";
import { Card } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/mock/implementation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/implementation/api-map")({
  head: () => ({ meta: [{ title: "API Contract Map — LedgerOS" }] }),
  component: ApiMap,
});

const STATUS_META = {
  exists: { label: "Exists", tone: "border-success/40 bg-success/10 text-success" },
  extend: { label: "Extend", tone: "border-warning/40 bg-warning/10 text-warning" },
  new: { label: "New", tone: "border-brand/40 bg-brand/10 text-brand" },
} as const;

const METHOD_TONE: Record<string, string> = {
  GET: "text-success",
  POST: "text-brand",
  PATCH: "text-warning",
  DELETE: "text-destructive",
};

function ApiMap() {
  return (
    <ImplementationPage
      title="API Contract Map"
      description="Every UI action mapped to an HTTP endpoint, required permission, audit event, and backend status."
    >
      <Card className="border-border/70 p-0">
        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_60px_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>UI Route</span>
            <span>Action</span>
            <span>Method</span>
            <span>Endpoint</span>
            <span>Permission</span>
            <span>Audit Event</span>
            <span>Status</span>
          </div>
        {API_ENDPOINTS.map((e, i) => (
          <div
            key={i}
            className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)_60px_minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] items-center gap-2 border-b border-border px-4 py-2.5 text-[12px] last:border-b-0 hover:bg-muted/20"
          >
            <code className="truncate font-mono text-[11.5px] text-muted-foreground">{e.ui}</code>
            <span className="truncate">{e.action}</span>
            <span className={cn("font-mono text-[11px] font-semibold", METHOD_TONE[e.method])}>{e.method}</span>
            <code className="truncate font-mono text-[11.5px]">{e.endpoint}</code>
            <code className="truncate font-mono text-[11px] text-muted-foreground">{e.permission}</code>
            <code className="truncate font-mono text-[11px] text-muted-foreground">{e.audit}</code>
            <span className={cn("rounded-full border px-2 py-0.5 text-[10.5px] font-semibold", STATUS_META[e.status].tone)}>
              {STATUS_META[e.status].label}
            </span>
          </div>
        ))}
      </Card>

      <Card className="border-border/70 p-4 text-[12px] text-muted-foreground">
        <div className="font-semibold text-foreground">Contract convention</div>
        <ul className="mt-1 space-y-1 list-disc pl-5">
          <li>Every mutation must include actor, target_type, target_id, before, after in its audit event.</li>
          <li>Every non-GET endpoint requires a permission match — no implicit ownership rules.</li>
          <li>Every write endpoint returns the resulting resource including <code>audit_event_id</code>.</li>
          <li>Endpoints marked "New" must ship an OpenAPI stub and Postman collection before wiring.</li>
        </ul>
      </Card>
    </ImplementationPage>
  );
}
