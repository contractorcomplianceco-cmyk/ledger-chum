import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreditCard, Landmark, ShieldCheck } from "lucide-react";
import { isDemoMode } from "@/lib/app-mode";

export type CollectResult = {
  mode: "gateway" | "manual";
  gatewayMethod: "card" | "ach";
  manualMethod: "check" | "cash" | "wire" | "other";
  amount: number;
  customerName: string;
  invoiceNumber: string;
  reference: string;
  /** Tokenized nonce (gateway mode). Raw card/bank data never leaves the SDK. */
  token: string;
  idempotencyKey: string;
};

/**
 * Collect-payment entry. Two paths:
 *   - Gateway: card / ACH via a hosted, tokenized field. In production the token
 *     is produced by the gateway SDK (Accept.js) in the browser; raw card/bank
 *     data never touches our server. In demo mode a simulated nonce is used.
 *   - Manual: record a payment received offline (check/cash/wire) — no charge.
 *
 * The dialog only gathers input and returns a {@link CollectResult}; the parent
 * decides whether to call the `collectPayment` / `recordManualPayment` server
 * functions (production) or simulate locally (demo).
 */
export function CollectPaymentDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  defaultCustomerName = "",
  defaultInvoiceNumber = "",
  defaultAmount = "",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (result: CollectResult) => void;
  submitting?: boolean;
  defaultCustomerName?: string;
  defaultInvoiceNumber?: string;
  defaultAmount?: string;
}) {
  const [mode, setMode] = useState<"gateway" | "manual">("gateway");
  const [gatewayMethod, setGatewayMethod] = useState<"card" | "ach">("card");
  const [manualMethod, setManualMethod] = useState<"check" | "cash" | "wire" | "other">("check");
  const [customerName, setCustomerName] = useState(defaultCustomerName);
  const [invoiceNumber, setInvoiceNumber] = useState(defaultInvoiceNumber);
  const [amount, setAmount] = useState(defaultAmount);
  const [reference, setReference] = useState("");
  const [cardName, setCardName] = useState("");

  const amt = Number(amount);
  const validAmount = Number.isFinite(amt) && amt > 0;

  function tokenize(): string {
    // In production the gateway SDK (Accept.js) returns an opaque nonce here.
    // In demo we synthesize a deterministic nonce so the flow is exercisable.
    if (isDemoMode()) return `demo-nonce-${Date.now()}`;
    // Placeholder: the real SDK integration replaces this. Empty token will be
    // rejected server-side, surfacing a clear "tokenization required" error.
    return "";
  }

  function submit() {
    if (!validAmount) return;
    onSubmit({
      mode,
      gatewayMethod,
      manualMethod,
      amount: amt,
      customerName,
      invoiceNumber,
      reference,
      token: mode === "gateway" ? tokenize() : "",
      idempotencyKey:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `key-${Date.now()}-${Math.random()}`,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Collect payment</DialogTitle>
          <DialogDescription>
            Charge a card or bank account, or record a payment received offline.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "gateway" | "manual")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gateway">Card / ACH</TabsTrigger>
            <TabsTrigger value="manual">Record offline</TabsTrigger>
          </TabsList>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Customer</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Invoice</Label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-1042 (optional)"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Amount (USD)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <TabsContent value="gateway" className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select
                value={gatewayMethod}
                onValueChange={(v) => setGatewayMethod(v as "card" | "ach")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5" /> Card
                    </span>
                  </SelectItem>
                  <SelectItem value="ach">
                    <span className="flex items-center gap-2">
                      <Landmark className="h-3.5 w-3.5" /> Bank / ACH (eCheck)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{gatewayMethod === "card" ? "Name on card" : "Account holder"}</Label>
              <Input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder={gatewayMethod === "card" ? "Cardholder name" : "Account holder name"}
              />
            </div>
            <div className="rounded-md border border-dashed border-border/70 bg-muted/30 p-3 text-[12px] text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Secure hosted entry
              </div>
              <p className="mt-1">
                {gatewayMethod === "card" ? "Card number" : "Routing & account numbers"} are entered
                in the gateway&apos;s hosted field and tokenized in your browser. They never reach
                LedgerOS.
                {isDemoMode() && " (Demo mode uses a simulated token.)"}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label>Method</Label>
              <Select
                value={manualMethod}
                onValueChange={(v) => setManualMethod(v as "check" | "cash" | "wire" | "other")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="wire">Wire</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Reference</Label>
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Check #, wire ref, etc."
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!validAmount || submitting}>
            {submitting ? "Processing…" : mode === "gateway" ? "Charge payment" : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
