import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceLineEditor } from "@/components/invoicing/invoice-line-editor";
import { AllocationPreviewCard } from "@/components/invoicing/allocation-preview-card";
import { MarginPreviewCard } from "@/components/invoicing/margin-preview-card";
import { InvoiceDocument } from "@/components/invoicing/invoice-document";
import { InvoiceStylePanel } from "@/components/invoicing/invoice-style-panel";
import { CLASSIC_THEME, type InvoiceStyle } from "@/lib/invoicing/invoice-theme";
import { useBrandStyle } from "@/lib/invoicing/brand-style-store";
import { CUSTOMERS, SERVICE_CATALOG, type InvoiceLine } from "@/lib/mock/invoicing";
import { TREATMENT_META } from "@/lib/mock/cash-availability";
import {
  DEFAULT_ISSUER,
  computeDocumentTotals,
  lineAmount,
  type InvoiceDocumentData,
} from "@/lib/invoicing/invoice-document";
import { Plus, ArrowLeft, Send, Save } from "lucide-react";

export const Route = createFileRoute("/invoices/new")({
  head: () => ({
    meta: [
      { title: "New invoice — LedgerOS" },
      { name: "description", content: "Build an invoice with live allocation and margin preview." },
    ],
  }),
  component: NewInvoicePage,
});

const seedLine = (id: string, serviceId?: string): InvoiceLine => {
  const svc = SERVICE_CATALOG.find((s) => s.id === serviceId) ?? SERVICE_CATALOG[0];
  return {
    id,
    service: svc.name,
    qty: 1,
    rate: svc.defaultRate,
    discount: 0,
    tax: 0,
    treatment: svc.defaultTreatment,
    department: TREATMENT_META[svc.defaultTreatment].label,
    estCost: svc.estCost,
    targetMarginPct: svc.targetMarginPct,
  };
};

function NewInvoicePage() {
  const [customerId, setCustomerId] = useState<string>(CUSTOMERS[0].id);
  const [issued] = useState("May 15, 2025");
  const [due, setDue] = useState("May 29, 2025");
  const [terms, setTerms] = useState("Net 14");
  const [po, setPo] = useState("");
  const [notes, setNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("Thank you for your business.");
  const [laborCost] = useState(800);
  const [techAllocation] = useState(120);
  const [marketingCac] = useState(180);
  const [lines, setLines] = useState<InvoiceLine[]>([
    seedLine("l1", "svc-state-fee"),
    seedLine("l2", "svc-app-prep"),
    seedLine("l3", "svc-consulting"),
  ]);

  const customer = CUSTOMERS.find((c) => c.id === customerId)!;

  // Style seam (Phase B): a new invoice inherits the company brand default; the user
  // can override it here. Styling never affects the figures below.
  const { brandStyle, save: saveBrand, canSave } = useBrandStyle();
  const [override, setOverride] = useState<InvoiceStyle | null>(null);
  const activeStyle = override ?? brandStyle ?? CLASSIC_THEME;

  // Live client-facing document — mirrors the form state and, like the internal
  // allocation preview, updates on every change. Only client fields are mapped;
  // treatments / GL / commission owners never reach this document.
  const previewDoc: InvoiceDocumentData = {
    number: "DRAFT",
    issueDate: issued,
    dueDate: due,
    terms,
    poNumber: po || undefined,
    billFrom: DEFAULT_ISSUER,
    billTo: {
      name: customer.name,
      lines: [customer.address].filter(Boolean),
      email: customer.email,
      phone: customer.phone,
    },
    lines: lines.map((l) => ({
      id: l.id,
      description: l.service,
      detail: [l.jurisdiction, l.project].filter(Boolean).join(" · ") || undefined,
      quantity: l.qty,
      rate: l.rate,
      amount: lineAmount(l),
    })),
    totals: computeDocumentTotals(lines, 0),
    notes: customerNotes || undefined,
    footer: "Thank you for your business.",
  };

  const patch = (id: string, p: Partial<InvoiceLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...p } : l)));
  const remove = (id: string) => setLines((prev) => prev.filter((l) => l.id !== id));
  const add = (serviceId?: string) =>
    setLines((prev) => [...prev, seedLine(`l${Date.now()}`, serviceId)]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/invoices">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to invoices
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Save className="mr-1.5 h-3.5 w-3.5" /> Save draft
          </Button>
          <Button size="sm">
            <Send className="mr-1.5 h-3.5 w-3.5" /> Send for approval
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Card className="border border-border/70 bg-surface p-4 shadow-card">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Customer
                </label>
                <Select value={customerId} onValueChange={setCustomerId}>
                  <SelectTrigger className="mt-1 h-9 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMERS.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-[13px]">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-1 text-[11px] text-muted-foreground">{customer.email}</div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Issue date
                </label>
                <Input value={issued} readOnly className="mt-1 h-9 text-[13px]" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Due date
                </label>
                <Input
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="mt-1 h-9 text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Terms
                </label>
                <Select value={terms} onValueChange={setTerms}>
                  <SelectTrigger className="mt-1 h-9 text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                    <SelectItem value="Net 7">Net 7</SelectItem>
                    <SelectItem value="Net 14">Net 14</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  PO number
                </label>
                <Input
                  value={po}
                  onChange={(e) => setPo(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 h-9 text-[13px]"
                />
              </div>
              <div className="md:col-span-2 xl:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Internal notes
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Not shown to client"
                  className="mt-1 h-9 text-[13px]"
                />
              </div>
            </div>
          </Card>

          <Card className="border border-border/70 bg-surface p-4 shadow-card">
            <div className="mb-2 grid grid-cols-[auto_minmax(0,2fr)_80px_100px_100px_120px_auto] items-center gap-2 px-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              <span />
              <span>Service</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Rate</span>
              <span className="text-right">Discount</span>
              <span className="text-right">Line total</span>
              <span />
            </div>
            <div className="space-y-2">
              {lines.map((l) => (
                <InvoiceLineEditor
                  key={l.id}
                  line={l}
                  onChange={(p) => patch(l.id, p)}
                  onRemove={() => remove(l.id)}
                />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => add()}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> Blank line
              </Button>
              <Select onValueChange={(v) => add(v)}>
                <SelectTrigger className="h-9 w-64 text-[13px]">
                  <SelectValue placeholder="Add from service catalog…" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATALOG.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-[13px]">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="border border-border/70 bg-surface p-4 shadow-card">
            <div className="text-[13.5px] font-semibold text-foreground">Notes to customer</div>
            <Textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={3}
              className="mt-2 text-[13px]"
            />
          </Card>
        </div>

        <aside>
          <Tabs defaultValue="preview" className="space-y-3">
            <TabsList className="w-full">
              <TabsTrigger value="preview" className="flex-1">
                Client preview
              </TabsTrigger>
              <TabsTrigger value="internal" className="flex-1">
                Internal (CCA)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="space-y-3">
              <Card className="border border-border/70 bg-muted/30 p-3 shadow-card">
                <InvoiceDocument data={previewDoc} style={activeStyle} />
              </Card>
              <InvoiceStylePanel
                style={activeStyle}
                onChange={setOverride}
                companyName={DEFAULT_ISSUER.name}
                onSaveBrand={saveBrand}
                canSaveBrand={canSave}
              />
              <p className="text-[11px] text-muted-foreground">
                Live preview of exactly what the client will see. Internal allocation is on the next
                tab.
              </p>
            </TabsContent>
            <TabsContent value="internal" className="space-y-4">
              <AllocationPreviewCard lines={lines} />
              <MarginPreviewCard invoice={{ lines, laborCost, techAllocation, marketingCac }} />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
