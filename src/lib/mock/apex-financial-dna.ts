// Financial DNA — demonstration flow of a single dollar from source to outcome.

export type DnaStage =
  | "Client"
  | "Contract"
  | "Service"
  | "Invoice"
  | "Payment"
  | "Pass-Through"
  | "Revenue"
  | "Commission"
  | "Payroll"
  | "Direct Cost"
  | "Technology"
  | "Marketing"
  | "Overhead"
  | "Contribution Profit"
  | "Tax Reserve"
  | "Profit Share"
  | "Owner Distribution"
  | "Retained Earnings";

export type Classification = "restricted" | "available" | "reserved" | "distributed";

export type DnaNode = {
  id: string;
  label: string;
  stage: DnaStage;
  amount: number;
  pctOfOrigin: number;
  classification: Classification;
  source: string;
  freshness: string;
  confidence: number;
  auditStatus: "posted" | "draft" | "review";
  explanation: string;
  parents: string[];
  children: string[];
  relatedTimeline?: string;
  relatedOpportunity?: string;
  relatedGraphNode?: string;
};

// Represents the DNA of a single $100,000 client payment.
export const DNA_ORIGIN = 100000;

export const DNA_NODES: DnaNode[] = [
  { id: "n1", label: "ALD Holdings", stage: "Client", amount: 100000, pctOfOrigin: 100, classification: "available", source: "Zoho CRM", freshness: "live", confidence: 99, auditStatus: "posted", explanation: "Origin client of this cash flow.", parents: [], children: ["n2"], relatedGraphNode: "client:ald" },
  { id: "n2", label: "MSA #2024-08", stage: "Contract", amount: 100000, pctOfOrigin: 100, classification: "available", source: "Google Drive", freshness: "2h", confidence: 95, auditStatus: "posted", explanation: "Master agreement governing this engagement.", parents: ["n1"], children: ["n3"] },
  { id: "n3", label: "Compliance Audit — Q2", stage: "Service", amount: 100000, pctOfOrigin: 100, classification: "available", source: "Harvest", freshness: "1h", confidence: 96, auditStatus: "posted", explanation: "Delivered service tied to this payment.", parents: ["n2"], children: ["n4"] },
  { id: "n4", label: "INV-2025-0501", stage: "Invoice", amount: 100000, pctOfOrigin: 100, classification: "available", source: "Zoho Books", freshness: "live", confidence: 99, auditStatus: "posted", explanation: "Invoice issued 05/01.", parents: ["n3"], children: ["n5"], relatedTimeline: "TL-INVOICE-0501" },
  { id: "n5", label: "Client Payment", stage: "Payment", amount: 100000, pctOfOrigin: 100, classification: "available", source: "Stripe", freshness: "live", confidence: 99, auditStatus: "posted", explanation: "Wire received 05/12.", parents: ["n4"], children: ["n6", "n7"] },
  { id: "n6", label: "Vendor Pass-Through", stage: "Pass-Through", amount: 18000, pctOfOrigin: 18, classification: "restricted", source: "Bill.com", freshness: "live", confidence: 97, auditStatus: "posted", explanation: "Reserved to pay upstream vendor. Not company revenue.", parents: ["n5"], children: ["n13"] },
  { id: "n7", label: "Realized Revenue", stage: "Revenue", amount: 82000, pctOfOrigin: 82, classification: "available", source: "Zoho Books", freshness: "live", confidence: 98, auditStatus: "posted", explanation: "Payment net of pass-through.", parents: ["n5"], children: ["n8", "n9", "n10", "n11", "n12"] },
  { id: "n8", label: "GTM Commission", stage: "Commission", amount: 8200, pctOfOrigin: 8.2, classification: "reserved", source: "Compensation ledger", freshness: "6h", confidence: 92, auditStatus: "review", explanation: "10% of realized revenue.", parents: ["n7"], children: ["n14"] },
  { id: "n9", label: "Delivery Payroll", stage: "Payroll", amount: 22400, pctOfOrigin: 22.4, classification: "reserved", source: "Gusto", freshness: "12h", confidence: 94, auditStatus: "posted", explanation: "Loaded labor cost for delivery team.", parents: ["n7"], children: ["n14"] },
  { id: "n10", label: "Tech Allocation", stage: "Technology", amount: 3200, pctOfOrigin: 3.2, classification: "reserved", source: "Ramp", freshness: "1d", confidence: 86, auditStatus: "posted", explanation: "Allocated SaaS + infra.", parents: ["n7"], children: ["n14"] },
  { id: "n11", label: "Marketing Allocation", stage: "Marketing", amount: 2400, pctOfOrigin: 2.4, classification: "reserved", source: "Zoho CRM", freshness: "1d", confidence: 80, auditStatus: "posted", explanation: "Attributed acquisition cost.", parents: ["n7"], children: ["n14"] },
  { id: "n12", label: "Overhead", stage: "Overhead", amount: 6800, pctOfOrigin: 6.8, classification: "reserved", source: "Zoho Books", freshness: "1d", confidence: 88, auditStatus: "posted", explanation: "Allocated G&A.", parents: ["n7"], children: ["n14"] },
  { id: "n13", label: "Vendor Payment — Brightpath", stage: "Direct Cost", amount: 18000, pctOfOrigin: 18, classification: "distributed", source: "Bill.com", freshness: "live", confidence: 97, auditStatus: "posted", explanation: "Paid to upstream vendor.", parents: ["n6"], children: [] },
  { id: "n14", label: "Contribution Profit", stage: "Contribution Profit", amount: 39000, pctOfOrigin: 39, classification: "available", source: "Derived", freshness: "1h", confidence: 91, auditStatus: "review", explanation: "Realized revenue − delivery costs.", parents: ["n8", "n9", "n10", "n11", "n12"], children: ["n15", "n16", "n17"] },
  { id: "n15", label: "Tax Reserve", stage: "Tax Reserve", amount: 8580, pctOfOrigin: 8.58, classification: "restricted", source: "Policy engine", freshness: "1h", confidence: 90, auditStatus: "posted", explanation: "22% of contribution profit reserved for taxes.", parents: ["n14"], children: [], relatedOpportunity: "OPP-1048" },
  { id: "n16", label: "Profit-Sharing Pool", stage: "Profit Share", amount: 3900, pctOfOrigin: 3.9, classification: "reserved", source: "Policy engine", freshness: "1h", confidence: 88, auditStatus: "review", explanation: "10% of contribution profit to team pool.", parents: ["n14"], children: [] },
  { id: "n17", label: "Retained + Owner Path", stage: "Retained Earnings", amount: 26520, pctOfOrigin: 26.52, classification: "available", source: "Derived", freshness: "1h", confidence: 92, auditStatus: "review", explanation: "Remaining flows to retained earnings and owner distribution.", parents: ["n14"], children: ["n18"] },
  { id: "n18", label: "Owner Distribution", stage: "Owner Distribution", amount: 12000, pctOfOrigin: 12, classification: "distributed", source: "Bank", freshness: "1d", confidence: 90, auditStatus: "posted", explanation: "Scheduled quarterly owner draw.", parents: ["n17"], children: [] },
];

export const DNA_ROOTS = DNA_NODES.filter((n) => n.parents.length === 0).map((n) => n.id);

export function dnaChildren(id: string) {
  const node = DNA_NODES.find((n) => n.id === id);
  if (!node) return [];
  return node.children.map((cid) => DNA_NODES.find((n) => n.id === cid)!).filter(Boolean);
}

export const DNA_SUBJECTS = [
  { id: "DNA-CLIENT-ALD", label: "ALD Holdings — Q2 payment", type: "Client" },
  { id: "DNA-CLIENT-NORTHSTAR", label: "NorthStar Systems — annual", type: "Client" },
  { id: "DNA-CLIENT-BRIGHTPATH", label: "Brightpath Media — pass-through", type: "Client" },
  { id: "DNA-VENDOR-NOTION", label: "Notion — SaaS spend", type: "Vendor" },
  { id: "DNA-INVOICE-0501", label: "INV-2025-0501", type: "Invoice" },
];

export const ASK_LEDGEROS_DNA = [
  "Where did this payment go?",
  "Why is the profit lower than expected?",
  "What portion is restricted?",
  "Who was paid from this revenue?",
];
