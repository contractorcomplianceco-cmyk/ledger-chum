// Financial Relationship Graph — demonstration nodes and edges.

export type GraphNodeType =
  | "client"
  | "contract"
  | "service"
  | "invoice"
  | "payment"
  | "expense"
  | "vendor"
  | "employee"
  | "commission"
  | "campaign"
  | "app"
  | "event"
  | "entity"
  | "owner"
  | "investor"
  | "decision";

export type GraphNode = {
  id: string;
  type: GraphNodeType;
  label: string;
  amount?: number;
  status?: string;
  risk?: "low" | "medium" | "high";
  owner?: string;
  x: number;
  y: number;
  relatedTimeline?: string;
  relatedDna?: string;
  relatedOpportunity?: string;
};

export type GraphEdge = {
  from: string;
  to: string;
  kind: "generates" | "pays" | "allocates" | "consumes" | "flows" | "governs" | "attributes";
  amount?: number;
};

// Positioned for a 800x520 canvas.
export const GRAPH_NODES: GraphNode[] = [
  {
    id: "campaign:q1",
    type: "campaign",
    label: "Q1 Finance Ops Campaign",
    x: 60,
    y: 60,
    amount: 24000,
  },
  {
    id: "client:ald",
    type: "client",
    label: "ALD Holdings",
    x: 220,
    y: 90,
    amount: 100000,
    risk: "low",
    relatedTimeline: "TL-CLIENT-ALD",
    relatedDna: "DNA-CLIENT-ALD",
  },
  {
    id: "client:northstar",
    type: "client",
    label: "NorthStar Systems",
    x: 220,
    y: 220,
    amount: 240000,
    risk: "medium",
    relatedTimeline: "TL-CLIENT-NORTHSTAR",
    relatedOpportunity: "OPP-1044",
  },
  {
    id: "client:kestrel",
    type: "client",
    label: "Kestrel Bio",
    x: 220,
    y: 340,
    amount: 84000,
    risk: "low",
    relatedOpportunity: "OPP-1051",
  },
  {
    id: "client:sequoia",
    type: "client",
    label: "Sequoia Labs",
    x: 220,
    y: 450,
    amount: 38400,
    risk: "high",
    relatedOpportunity: "OPP-1047",
  },
  {
    id: "contract:ald-msa",
    type: "contract",
    label: "MSA #2024-08",
    x: 380,
    y: 60,
    amount: 400000,
  },
  { id: "service:audit", type: "service", label: "Compliance Audit", x: 380, y: 130 },
  {
    id: "invoice:0501",
    type: "invoice",
    label: "INV-2025-0501",
    x: 520,
    y: 90,
    amount: 100000,
    status: "paid",
  },
  {
    id: "invoice:0311",
    type: "invoice",
    label: "INV-2025-0311",
    x: 520,
    y: 450,
    amount: 38400,
    status: "overdue",
    risk: "high",
  },
  { id: "payment:ald-05", type: "payment", label: "Payment 05/12", x: 660, y: 90, amount: 100000 },
  {
    id: "vendor:brightpath",
    type: "vendor",
    label: "Brightpath Media",
    x: 660,
    y: 200,
    amount: 18000,
  },
  {
    id: "vendor:notion",
    type: "vendor",
    label: "Notion Labs",
    x: 60,
    y: 250,
    amount: 4620,
    relatedOpportunity: "OPP-1043",
  },
  {
    id: "expense:travel-q1",
    type: "expense",
    label: "Q1 Conference Travel",
    x: 60,
    y: 340,
    amount: 2840,
    relatedOpportunity: "OPP-1052",
  },
  { id: "employee:kchen", type: "employee", label: "K. Chen", x: 660, y: 340, owner: "AR" },
  {
    id: "commission:c-0501",
    type: "commission",
    label: "Commission on INV-0501",
    x: 520,
    y: 260,
    amount: 8200,
  },
  { id: "app:harvest", type: "app", label: "Harvest", x: 60, y: 130 },
  { id: "app:stripe", type: "app", label: "Stripe", x: 660, y: 20 },
  { id: "entity:llc", type: "entity", label: "LedgerOS LLC", x: 380, y: 260, amount: 1248750 },
  { id: "owner:rose", type: "owner", label: "Rose Alvarez", x: 380, y: 380 },
  {
    id: "decision:reserve",
    type: "decision",
    label: "Tax reserve top-up",
    x: 380,
    y: 450,
    relatedOpportunity: "OPP-1048",
  },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { from: "campaign:q1", to: "client:ald", kind: "attributes" },
  { from: "client:ald", to: "contract:ald-msa", kind: "governs" },
  { from: "contract:ald-msa", to: "service:audit", kind: "governs" },
  { from: "service:audit", to: "invoice:0501", kind: "generates", amount: 100000 },
  { from: "invoice:0501", to: "payment:ald-05", kind: "generates", amount: 100000 },
  { from: "payment:ald-05", to: "vendor:brightpath", kind: "pays", amount: 18000 },
  { from: "payment:ald-05", to: "commission:c-0501", kind: "allocates", amount: 8200 },
  { from: "commission:c-0501", to: "employee:kchen", kind: "pays", amount: 8200 },
  { from: "app:harvest", to: "service:audit", kind: "flows" },
  { from: "app:stripe", to: "payment:ald-05", kind: "flows" },
  { from: "client:northstar", to: "entity:llc", kind: "generates", amount: 240000 },
  { from: "client:kestrel", to: "entity:llc", kind: "generates", amount: 84000 },
  { from: "client:sequoia", to: "invoice:0311", kind: "generates", amount: 38400 },
  { from: "vendor:notion", to: "entity:llc", kind: "consumes", amount: 4620 },
  { from: "expense:travel-q1", to: "client:northstar", kind: "consumes", amount: 2840 },
  { from: "entity:llc", to: "owner:rose", kind: "pays" },
  { from: "decision:reserve", to: "entity:llc", kind: "governs" },
];

export const GRAPH_NODE_TYPES: GraphNodeType[] = [
  "client",
  "contract",
  "service",
  "invoice",
  "payment",
  "expense",
  "vendor",
  "employee",
  "commission",
  "campaign",
  "app",
  "event",
  "entity",
  "owner",
  "investor",
  "decision",
];

export const NODE_TYPE_COLOR: Record<GraphNodeType, string> = {
  client: "#22d3ee",
  contract: "#a78bfa",
  service: "#60a5fa",
  invoice: "#38bdf8",
  payment: "#34d399",
  expense: "#fb923c",
  vendor: "#f472b6",
  employee: "#facc15",
  commission: "#fde047",
  campaign: "#c084fc",
  app: "#94a3b8",
  event: "#e879f9",
  entity: "#3b82f6",
  owner: "#f97316",
  investor: "#eab308",
  decision: "#f43f5e",
};

export const ASK_LEDGEROS_GRAPH = [
  "Who is connected to this transaction?",
  "Which clients are linked to this campaign?",
  "What records affect this investor distribution?",
  "Show related risks.",
];
