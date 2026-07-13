import {
  Home,
  Wallet,
  TrendingUp,
  Users2,
  Building2,
  Sparkles,
  Target,
  Gauge,
  Dna,
  Bot,
  Network,
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";
import type { NavGroup } from "@/lib/mock/nav";

/**
 * Executive-mode navigation for Project APEX.
 * Only display grouping — no route paths are renamed or removed.
 * Some workspace links target the closest existing operational route
 * until dedicated /apex/* landing pages ship.
 */
export const APEX_EXECUTIVE_NAV_GROUPS: NavGroup[] = [
  {
    id: "executive-workspaces",
    title: "Executive Workspaces",
    icon: Sparkles,
    defaultOpen: true,
    items: [
      { title: "Home", to: "/apex", icon: Home, keywords: ["executive", "dashboard"] },
      { title: "Money", to: "/cash-availability", icon: Wallet, keywords: ["cash", "banking", "money"] },
      { title: "Growth", to: "/intelligence", icon: TrendingUp, keywords: ["revenue", "growth"] },
      { title: "People", to: "/compensation", icon: Users2, keywords: ["compensation", "people"] },
      { title: "Company", to: "/apex/company-health", icon: Building2, keywords: ["health", "company"] },
    ],
  },
  {
    id: "ai-intelligence",
    title: "AI Intelligence",
    icon: Sparkles,
    defaultOpen: true,
    items: [
      { title: "Ask LedgerOS", to: "/apex/briefing", icon: Sparkles, keywords: ["ask", "ai", "briefing"] },
      { title: "Opportunity Engine", to: "/apex/opportunities", icon: Target },
      { title: "Company Health", to: "/apex/company-health", icon: Gauge },
      { title: "Financial DNA", to: "/apex/financial-dna", icon: Dna },
      { title: "Digital Twin", to: "/apex/digital-twin", icon: Bot },
      { title: "Relationship Graph", to: "/apex/relationship-graph", icon: Network },
    ],
  },
  {
    id: "work-queues",
    title: "Work Queues",
    icon: CheckSquare,
    defaultOpen: true,
    items: [
      { title: "Approvals", to: "/automation/approvals", icon: ShieldCheck },
      { title: "Exceptions", to: "/automation/exceptions", icon: AlertTriangle },
      { title: "Tasks", to: "/automation/action-plans", icon: CheckSquare },
    ],
  },
];
