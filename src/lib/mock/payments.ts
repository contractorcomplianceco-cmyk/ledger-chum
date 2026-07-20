/**
 * Simulated incoming customer payments for demo mode. No network, no gateway —
 * the /payments page renders this when {@link isDemoMode} is true, and a
 * successful demo "Collect payment" prepends a row here in component state.
 */

export type DemoPaymentMethod = "card" | "ach" | "check" | "cash" | "wire" | "other";
export type DemoPaymentStatus = "succeeded" | "pending" | "failed" | "refunded";

export type DemoPayment = {
  id: string;
  date: string;
  customerName: string;
  invoiceNumber: string | null;
  method: DemoPaymentMethod;
  status: DemoPaymentStatus;
  amount: number;
  reference: string;
  type: "gateway" | "manual";
};

export const DEMO_PAYMENTS: DemoPayment[] = [
  {
    id: "pay-2051",
    date: "2025-05-12",
    customerName: "Acme Contracting LLC",
    invoiceNumber: "INV-1042",
    method: "card",
    status: "succeeded",
    amount: 5300,
    reference: "auth_60219847",
    type: "gateway",
  },
  {
    id: "pay-2050",
    date: "2025-05-11",
    customerName: "Blue Ridge Builders",
    invoiceNumber: "INV-1039",
    method: "ach",
    status: "pending",
    amount: 4250,
    reference: "auth_60219712",
    type: "gateway",
  },
  {
    id: "pay-2048",
    date: "2025-05-09",
    customerName: "Harbor Point Marine",
    invoiceNumber: "INV-1036",
    method: "check",
    status: "succeeded",
    amount: 1875,
    reference: "Check #4471",
    type: "manual",
  },
  {
    id: "pay-2047",
    date: "2025-05-08",
    customerName: "Coastal Fabrication",
    invoiceNumber: "INV-1035",
    method: "wire",
    status: "succeeded",
    amount: 9200,
    reference: "WIRE-2205-XT",
    type: "manual",
  },
  {
    id: "pay-2045",
    date: "2025-05-06",
    customerName: "Acme Contracting LLC",
    invoiceNumber: null,
    method: "card",
    status: "refunded",
    amount: 640,
    reference: "auth_60218330",
    type: "gateway",
  },
];
