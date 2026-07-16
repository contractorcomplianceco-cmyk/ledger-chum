import { useState, type ReactElement } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock,
  DollarSign,
  Flame,
  Handshake,
  HelpCircle,
  MessageSquareText,
  Sparkles,
  Target,
  Waves,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DemoNotice, DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfidenceChip, DemoBadge, FreshnessChip, TrendChip } from "@/components/apex/chips";
import { ExplainabilityDrawer } from "@/components/apex/explainability-drawer";
import {
  AIAssistant,
  CashLandscape,
  CashPulseBackdrop,
  CollectionsLandscape,
  FinancialHealthVisual,
  ProfitLandscape,
  ProfitPulseBackdrop,
  RunwayRocket,
} from "@/components/apex/illustrations";
import {
  APEX_ANOMALIES,
  APEX_ASK_PROMPTS,
  APEX_BRIEFING,
  APEX_CASH_PULSE,
  APEX_DECISION_STRIP,
  APEX_HOME_GREETING,
  APEX_HOME_KPIS,
  APEX_PRIORITIES,
  APEX_PROFIT_PULSE,
  APEX_QUICK_ACTIONS,
  APEX_RECOMMENDATIONS,
  APEX_REVENUE_DRIVERS,
  APEX_REVENUE_TREND,
  APEX_REVENUE_TREND_TOTAL,
  APEX_TIMELINE,
  type ExecutiveKpi,
} from "@/lib/mock/apex-home";

const currency0 = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function demoAction(label: string) {
  toast(label, { description: DEMO_ACTION_MESSAGE });
}

/* ------------------------------------------------------------------ */
/* Greeting + decision prompt                                          */
/* ------------------------------------------------------------------ */

function GreetingHeader() {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 px-6 pt-6 sm:px-8">
      <div className="min-w-0">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Executive Home · Project APEX
        </div>
        <h1 className="flex items-center gap-2 text-[26px] font-bold tracking-tight text-foreground sm:text-[30px]">
          <span aria-hidden className="text-[28px]">
            👋
          </span>
          <span>
            <span className="bg-gradient-brand-full bg-clip-text text-transparent">
              {APEX_HOME_GREETING.greeting}
            </span>
          </span>
        </h1>
        <p className="mt-1 max-w-2xl text-[14px] text-muted-foreground">
          {APEX_HOME_GREETING.supporting}
        </p>
      </div>
      <div className="hidden shrink-0 flex-col items-end gap-1 text-right text-[12px] text-muted-foreground sm:flex">
        <div className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {APEX_HOME_GREETING.date}
        </div>
        <div className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {APEX_HOME_GREETING.time}
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2 py-0.5 text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-info" />
          {APEX_HOME_GREETING.company}
        </div>
      </div>
    </header>
  );
}

function DecisionPromptStrip() {
  return (
    <div className="mx-6 mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 sm:mx-8">
      <Target className="h-4 w-4 text-info" aria-hidden />
      <span className="text-[13px] font-semibold text-foreground">
        {APEX_HOME_GREETING.decisionPrompt}
      </span>
      <div className="mx-2 hidden h-4 w-px bg-border sm:block" />
      <div className="flex flex-wrap items-center gap-1.5">
        {APEX_DECISION_STRIP.map((s) => (
          <Link
            key={s.key}
            to={s.route as "/apex"}
            className="group inline-flex items-center gap-1 rounded-full border border-border/70 bg-background px-2 py-0.5 text-[11.5px] transition hover:border-info/60 hover:bg-info/5"
          >
            <span className="font-semibold tabular-nums text-foreground">{s.value}</span>
            <span className="text-muted-foreground">{s.label}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/70 transition group-hover:text-info" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KPI Cards                                                           */
/* ------------------------------------------------------------------ */

const KPI_VISUAL: Record<
  ExecutiveKpi["id"],
  {
    tint: string;
    accent: string;
    illustration: (props: {
      className?: string;
      decorative?: boolean;
      reducedMotion?: boolean;
    }) => ReactElement;
  }
> = {
  cash: {
    tint: "bg-tint-cash",
    accent: "text-info",
    illustration: (p) => <CashLandscape {...p} />,
  },
  profit: {
    tint: "bg-tint-profit",
    accent: "text-violet-600",
    illustration: (p) => <ProfitLandscape {...p} />,
  },
  collections: {
    tint: "bg-tint-growth",
    accent: "text-emerald-600",
    illustration: (p) => <CollectionsLandscape {...p} />,
  },
  runway: {
    tint: "bg-tint-attention",
    accent: "text-orange-600",
    illustration: (p) => <RunwayRocket {...p} />,
  },
  health: {
    tint: "bg-tint-growth",
    accent: "text-teal-600",
    illustration: (p) => <FinancialHealthVisual {...p} />,
  },
};

function KpiCard({ kpi }: { kpi: ExecutiveKpi }) {
  const v = KPI_VISUAL[kpi.id];
  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden border-border/70 p-4 transition hover:shadow-md",
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", v.tint)} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {kpi.label}
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <div className="text-[24px] font-bold tabular-nums leading-none text-foreground">
              {kpi.value}
            </div>
            <TrendChip
              delta={kpi.trendDelta}
              suffix={kpi.trendSuffix ?? "%"}
              invertColors={kpi.invertTrend}
            />
          </div>
          <div className="mt-1 text-[11.5px] text-muted-foreground">{kpi.supporting}</div>
        </div>
      </div>

      <div aria-hidden className={cn("relative -mx-4 mt-3 h-24 overflow-hidden", v.tint)}>
        <v.illustration className="absolute inset-0 h-full w-full" decorative />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          <ConfidenceChip value={kpi.confidence} />
          <FreshnessChip label={kpi.freshness} />
        </div>
        <Link
          to={kpi.route as "/apex"}
          className={cn("inline-flex items-center gap-0.5 text-[11.5px] font-semibold", v.accent)}
        >
          Details
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}

function KpiRow() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {APEX_HOME_KPIS.map((k) => (
        <KpiCard key={k.id} kpi={k} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cash Pulse card                                                     */
/* ------------------------------------------------------------------ */

function CashPulseCard() {
  const [open, setOpen] = useState(false);
  const p = APEX_CASH_PULSE;
  return (
    <Card className="relative overflow-hidden border-border/70 p-4">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
        <CashPulseBackdrop className="h-full w-full" decorative />
      </div>
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Cash Pulse
            </div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              What money is actually available to spend?
            </div>
          </div>
          <DemoBadge />
        </div>

        <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:items-center">
          <div className="relative mx-auto aspect-square w-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={p.slices}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="92%"
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {p.slices.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => currency0(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                True available
              </div>
              <div className="text-[22px] font-bold tabular-nums text-foreground">
                {currency0(p.trueAvailable)}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <ul className="grid grid-cols-2 gap-1.5 text-[11.5px]">
              {p.slices.map((s) => (
                <li key={s.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="truncate text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-mono tabular-nums text-foreground">
                    {currency0(s.value)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-2 py-1 text-[11.5px]">
              <span className="font-semibold text-destructive">Risk · </span>
              {p.risk}
            </div>
            <div className="rounded-md bg-accent/60 px-2 py-1 text-[11.5px]">
              <span className="font-semibold">Action · </span>
              {p.action}
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <div className="text-[11.5px] text-muted-foreground">
            Total cash position{" "}
            <span className="font-semibold text-foreground">{currency0(p.totalCash)}</span> · 30d
            forecast{" "}
            <span className="font-semibold text-foreground">{currency0(p.forecast30d)}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <ConfidenceChip value={p.confidence} />
            <FreshnessChip label={p.freshness} />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11.5px]"
              onClick={() => setOpen(true)}
            >
              Explain <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
            <Button asChild size="sm" variant="secondary" className="h-7 px-2 text-[11.5px]">
              <Link to="/cash-availability">View cash</Link>
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            "Why is available cash lower?",
            "What money is restricted?",
            "What can we safely spend today?",
          ].map((q) => (
            <AskChip key={q} q={q} />
          ))}
        </div>
      </div>

      <ExplainabilityDrawer
        open={open}
        onOpenChange={setOpen}
        payload={{
          title: "Cash Pulse — True available cash",
          question: "What money is actually available to spend?",
          answer: `True available cash of ${currency0(p.trueAvailable)} is total bank cash minus restricted reserves, committed disbursements, and reserved commissions.`,
          period: "As of today · 7-day and 30-day forward",
          entity: APEX_HOME_GREETING.company,
          confidence: p.confidence,
          freshness: p.freshness,
          calculation: [
            "Aggregate bank cash across all operating and reserve accounts",
            "Subtract restricted pass-through reserves",
            "Subtract committed disbursements within next 7 days",
            "Subtract reserved commission accruals",
            "Result = true available cash",
          ],
          evidence: [
            { label: "Operating account feeds", ref: "acct/operating" },
            { label: "Reserve ledger", ref: "reserve/current" },
            { label: "Scheduled bill run", ref: "billrun/next7" },
          ],
          assumptions: [
            "Reserves treated as non-spendable",
            "Payroll accrual through pay cycle already committed",
          ],
          action: p.action,
          approval: "Owner or Controller — reallocations over $50K",
        }}
      />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Profit Pulse card                                                   */
/* ------------------------------------------------------------------ */

function ProfitPulseCard() {
  const [open, setOpen] = useState(false);
  const p = APEX_PROFIT_PULSE;
  return (
    <Card className="relative overflow-hidden border-border/70 p-4">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
        <ProfitPulseBackdrop className="h-full w-full" decorative />
      </div>
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Profit Pulse
            </div>
            <div className="mt-0.5 text-[12px] text-muted-foreground">
              Did we make money — and why did profit change?
            </div>
          </div>
          <DemoBadge />
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <div className="text-[24px] font-bold tabular-nums text-foreground">
            {currency0(p.operating)}
          </div>
          <div className="text-[11.5px] text-muted-foreground">Operating · MTD</div>
          <TrendChip delta={p.trendDelta} />
          <div className="ml-auto text-[11.5px] text-muted-foreground">
            Margin <span className="font-semibold text-foreground">{p.margin}%</span>
          </div>
        </div>

        <div className="mt-2 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={p.series} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="profit-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="m"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(v: number) => currency0(v)} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#profit-area)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-1 grid grid-cols-3 gap-2 text-[11px]">
          <MiniStat label="Gross" value={currency0(p.gross)} />
          <MiniStat label="Net" value={currency0(p.net)} />
          <MiniStat label="Contribution" value={currency0(p.contribution)} />
        </div>

        <div className="mt-2 space-y-1 text-[11.5px]">
          <div>
            <span className="text-muted-foreground">Drivers · </span>
            <span className="text-foreground">{p.drivers.join(", ")}</span>
          </div>
          <div className="text-destructive">
            <span className="font-semibold">Pressure · </span>
            {p.pressure}
          </div>
          <div className="rounded-md bg-accent/60 px-2 py-1">
            <span className="font-semibold">Action · </span>
            {p.action}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <div className="flex flex-wrap gap-1.5">
            <ConfidenceChip value={p.confidence} />
            <FreshnessChip label={p.freshness} />
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11.5px]"
              onClick={() => setOpen(true)}
            >
              Explain <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
            <Button asChild size="sm" variant="secondary" className="h-7 px-2 text-[11.5px]">
              <Link to="/apex/financial-dna">View profitability</Link>
            </Button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            "Why did profit change?",
            "What lowered margin?",
            "Which clients contributed most?",
          ].map((q) => (
            <AskChip key={q} q={q} />
          ))}
        </div>
      </div>

      <ExplainabilityDrawer
        open={open}
        onOpenChange={setOpen}
        payload={{
          title: "Profit Pulse — Operating profit",
          question: "Why did operating profit change?",
          answer: `Operating profit is ${currency0(p.operating)} MTD, up ${p.trendDelta}% vs prior month.`,
          period: "Month to date · vs prior month same-day",
          entity: APEX_HOME_GREETING.company,
          confidence: p.confidence,
          freshness: p.freshness,
          calculation: [
            "Recognized revenue MTD",
            "Less direct costs",
            "Less overhead allocation",
            "= Operating profit",
          ],
          evidence: [
            { label: "Renewals batch", ref: "batch/renewals" },
            { label: "Campaign 18 attribution", ref: "campaign/18" },
          ],
          assumptions: ["Overhead allocated by revenue share", "Deferred revenue on straight-line"],
          action: p.action,
          approval: "Owner + Controller sign-off on pricing changes.",
        }}
      />
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/70 px-2 py-1">
      <div className="text-[9.5px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[12px] font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AI Recommendations                                                  */
/* ------------------------------------------------------------------ */

const REC_CATEGORY: Record<string, { icon: typeof Sparkles; tone: string }> = {
  Marketing: { icon: Flame, tone: "text-orange-600 bg-orange-50" },
  Cost: { icon: DollarSign, tone: "text-emerald-600 bg-emerald-50" },
  Vendor: { icon: Handshake, tone: "text-violet-600 bg-violet-50" },
  Revenue: { icon: Sparkles, tone: "text-info bg-info/10" },
};

function RecommendationsCard() {
  return (
    <Card className="flex flex-col overflow-hidden border-border/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            AI Recommendations
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            Ranked by financial impact · advisory only.
          </div>
        </div>
        <DemoBadge />
      </div>
      <ul className="mt-3 divide-y divide-border/60">
        {APEX_RECOMMENDATIONS.map((r) => {
          const c = REC_CATEGORY[r.category] ?? REC_CATEGORY.Revenue;
          const Icon = c.icon;
          return (
            <li key={r.id} className="flex flex-wrap items-start gap-3 py-2.5">
              <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg", c.tone)}>
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-foreground">{r.title}</span>
                  <span className="text-[10.5px] uppercase tracking-wide text-muted-foreground">
                    {r.category}
                  </span>
                </div>
                <div className="mt-0.5 text-[12px] text-muted-foreground">{r.impact}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10.5px] text-muted-foreground">
                  <ConfidenceChip value={r.confidence} />
                  <span className="inline-flex items-center gap-0.5">
                    <ClipboardCheck className="h-3 w-3" /> {r.evidence} pieces of evidence
                  </span>
                  <span>· Approval: {r.approval}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 px-2 text-[11.5px]"
                onClick={() => demoAction(r.action)}
              >
                {r.action}
              </Button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* AI Briefing (dark)                                                  */
/* ------------------------------------------------------------------ */

function AIBriefingCard() {
  const INSIGHT_ICON: Record<string, typeof Sparkles> = {
    trend: ArrowUpRight,
    cash: Waves,
    check: Check,
    spark: Sparkles,
    alert: AlertTriangle,
  };
  return (
    <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-info/25 blur-3xl"
      />
      <div className="relative flex items-start gap-3">
        <div className="h-12 w-12 shrink-0">
          <AIAssistant className="h-full w-full" decorative />
        </div>
        <div className="min-w-0">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/60">
            {APEX_BRIEFING.title}
          </div>
          <div className="text-[12.5px] font-semibold">{APEX_BRIEFING.subtitle}</div>
        </div>
        <DemoBadge className="ml-auto" />
      </div>
      <p className="relative mt-3 text-[12.5px] leading-relaxed text-white/85">
        {APEX_BRIEFING.greeting}
      </p>
      <ul className="relative mt-2 space-y-1.5">
        {APEX_BRIEFING.insights.map((i, idx) => {
          const Icon = INSIGHT_ICON[i.icon] ?? Sparkles;
          return (
            <li
              key={idx}
              className="flex items-start gap-2 text-[12px] leading-relaxed text-white/85"
            >
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" aria-hidden />
              <span>{i.text}</span>
            </li>
          );
        })}
      </ul>
      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
        <div className="flex flex-wrap gap-1.5">
          <ConfidenceChip value={APEX_BRIEFING.confidence} />
          <FreshnessChip label={APEX_BRIEFING.freshness} className="bg-white/10 text-white/80" />
        </div>
        <Button asChild size="sm" variant="secondary" className="h-7 px-2 text-[11.5px]">
          <Link to="/apex/briefing">View Full Briefing</Link>
        </Button>
      </div>
      <p className="relative mt-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10.5px] text-white/70">
        Demonstration insight — based on mock financial data.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Today's Priorities                                                  */
/* ------------------------------------------------------------------ */

function severityTone(s: "High" | "Medium" | "Low") {
  if (s === "High") return "border-l-destructive bg-destructive/5";
  if (s === "Medium") return "border-l-orange-500 bg-orange-50";
  return "border-l-info bg-info/5";
}

function severityLabel(s: "High" | "Medium" | "Low") {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide",
        s === "High" && "bg-destructive/15 text-destructive",
        s === "Medium" && "bg-orange-100 text-orange-700",
        s === "Low" && "bg-info/15 text-info",
      )}
    >
      <span aria-hidden className="h-1 w-1 rounded-full bg-current" />
      {s}
    </span>
  );
}

function PriorityList() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  return (
    <Card className="flex flex-col overflow-hidden border-border/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Today's Priorities
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            {APEX_PRIORITIES.length} items ·{" "}
            {APEX_PRIORITIES.filter((p) => p.severity === "High").length} high severity
          </div>
        </div>
        <DemoBadge />
      </div>
      <ul className="mt-3 space-y-1.5">
        {APEX_PRIORITIES.map((p) => (
          <li
            key={p.id}
            className={cn(
              "flex flex-wrap items-start gap-2 rounded-md border-l-2 px-2 py-1.5",
              severityTone(p.severity),
            )}
          >
            <Checkbox
              className="mt-1"
              checked={!!done[p.id]}
              onCheckedChange={(v) => {
                setDone((d) => ({ ...d, [p.id]: !!v }));
                if (v) demoAction(`Marked "${p.title}" complete`);
              }}
              aria-label={`Mark ${p.title} complete`}
            />
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "text-[12.5px] font-semibold text-foreground",
                  done[p.id] && "line-through opacity-60",
                )}
              >
                {p.title}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                {severityLabel(p.severity)}
                <span className="inline-flex items-center gap-0.5">
                  <Clock className="h-3 w-3" /> {p.due}
                </span>
                <span>· {p.owner}</span>
                {p.impact && <span>· {p.impact}</span>}
              </div>
            </div>
            <Link
              to={p.route as "/apex"}
              className="text-[11px] font-semibold text-info hover:underline"
            >
              Open
            </Link>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-3 self-start text-[11.5px] font-semibold text-info hover:underline"
        onClick={() => demoAction("Viewing all priorities")}
      >
        View all priorities →
      </button>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Quick Actions                                                       */
/* ------------------------------------------------------------------ */

function QuickActionGrid() {
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Quick Actions
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">Demonstration shortcuts.</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {APEX_QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.id}
              to={a.route as "/apex"}
              className="group flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2 transition hover:border-info/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                  a.tint,
                )}
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 text-[12px] font-semibold text-foreground group-hover:text-info">
                {a.label}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Revenue Trend                                                       */
/* ------------------------------------------------------------------ */

function RevenueTrendCard() {
  const data = APEX_REVENUE_TREND;
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Revenue Trend · 12 months
          </div>
          <div className="mt-0.5 text-[13px] font-semibold text-foreground">
            {APEX_REVENUE_TREND_TOTAL}
          </div>
        </div>
        <DemoBadge />
      </div>
      <div className="mt-3 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
            barCategoryGap="24%"
          >
            <defs>
              <linearGradient id="rev-bar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="60%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="rev-bar-hl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="60%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="m"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v: number) => `$${(v / 1).toFixed(0)}K`}
              cursor={{ fill: "hsl(var(--accent)/0.3)" }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.m} fill={d.highlight ? "url(#rev-bar-hl)" : "url(#rev-bar)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Text summary: Revenue increased steadily from $780K in Aug to $1.46M in Jul, with the
        current month (highlighted) representing an 18.6% year-over-year lift.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Revenue Drivers                                                     */
/* ------------------------------------------------------------------ */

function RevenueDriversCard() {
  const total = APEX_REVENUE_DRIVERS.reduce((a, b) => a + b.value, 0);
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Top Revenue Drivers
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            MTD contribution by source.
          </div>
        </div>
        <DemoBadge />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)] sm:items-center">
        <div className="relative mx-auto aspect-square w-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={APEX_REVENUE_DRIVERS}
                dataKey="value"
                innerRadius={42}
                outerRadius={62}
                paddingAngle={2}
                stroke="none"
              >
                {APEX_REVENUE_DRIVERS.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => currency0(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-[9.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              Total
            </div>
            <div className="text-[14px] font-bold tabular-nums text-foreground">
              {currency0(total)}
            </div>
          </div>
        </div>
        <ul className="space-y-1 text-[11.5px]">
          {APEX_REVENUE_DRIVERS.map((d) => (
            <li key={d.name} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
              <span className="truncate text-muted-foreground">{d.name}</span>
              <span className="ml-auto font-mono tabular-nums text-foreground">
                {currency0(d.value)}
              </span>
              <TrendChip delta={d.delta} />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          Renewals and enterprise clients are the largest contributors this month.
        </p>
        <Link
          to="/apex/financial-dna"
          className="text-[11.5px] font-semibold text-info hover:underline"
        >
          Explain →
        </Link>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Expense Anomalies                                                   */
/* ------------------------------------------------------------------ */

function ExpenseAnomaliesCard() {
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Expense Anomalies
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            {APEX_ANOMALIES.length} flagged vs baseline.
          </div>
        </div>
        <DemoBadge />
      </div>
      <ul className="mt-3 space-y-2">
        {APEX_ANOMALIES.map((a) => (
          <li key={a.id} className="rounded-md border border-border/60 bg-background/60 p-2">
            <div className="flex flex-wrap items-center gap-2">
              <CircleAlert
                className={cn(
                  "h-3.5 w-3.5",
                  a.severity === "High" ? "text-destructive" : "text-orange-500",
                )}
                aria-hidden
              />
              <span className="text-[12.5px] font-semibold text-foreground">{a.vendor}</span>
              <span className="text-[10.5px] uppercase tracking-wide text-muted-foreground">
                {a.category}
              </span>
              <span className="ml-auto font-mono text-[12px] tabular-nums text-foreground">
                {a.amount}
              </span>
              <span
                className={cn(
                  "font-mono text-[11px] font-semibold",
                  a.severity === "High" ? "text-destructive" : "text-orange-600",
                )}
              >
                {a.variance}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {a.period} · {a.explanation}
            </div>
            <div className="mt-1 flex items-center gap-2">
              {severityLabel(a.severity)}
              <button
                type="button"
                onClick={() => demoAction(`Reviewing ${a.vendor}`)}
                className="ml-auto text-[11px] font-semibold text-info hover:underline"
              >
                Review
              </button>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-2 text-[11.5px] font-semibold text-info hover:underline"
        onClick={() => demoAction("Viewing all anomalies")}
      >
        View all anomalies →
      </button>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Financial Timeline                                                  */
/* ------------------------------------------------------------------ */

const TIMELINE_TONE: Record<string, string> = {
  cash: "from-blue-500 to-cyan-500",
  profit: "from-violet-500 to-fuchsia-500",
  growth: "from-emerald-500 to-teal-500",
  attention: "from-orange-500 to-amber-500",
  neutral: "from-slate-500 to-slate-600",
};

function FinancialTimeline() {
  const [selected, setSelected] = useState<string>(APEX_TIMELINE[1]?.id ?? "");
  return (
    <Card className="border-border/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Financial Timeline · Next 30 days
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            Scheduled inflows, outflows, and executive milestones.
          </div>
        </div>
        <DemoBadge />
      </div>

      <div
        role="list"
        aria-label="Financial timeline"
        className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:snap-none"
      >
        {APEX_TIMELINE.map((e) => {
          const active = e.id === selected;
          const Icon = e.icon;
          return (
            <button
              key={e.id}
              type="button"
              role="listitem"
              onClick={() => setSelected(e.id)}
              className={cn(
                "group relative flex w-[220px] shrink-0 snap-start flex-col rounded-xl border bg-background p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-violet-500 shadow-[0_0_0_3px_hsl(262_83%_58%/0.15)]"
                  : "border-border/60 hover:border-info/50 hover:shadow-sm",
              )}
              aria-current={active}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                    TIMELINE_TONE[e.tone],
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] font-semibold text-foreground">
                    {e.title}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">{e.supporting}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3 w-3" /> {e.date}
                </span>
                {e.amount && (
                  <span className="font-mono font-semibold text-foreground">{e.amount}</span>
                )}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide",
                    e.status === "Completed" && "bg-success/15 text-success",
                    e.status === "Scheduled" && "bg-info/15 text-info",
                    e.status === "Pending" && "bg-muted text-muted-foreground",
                  )}
                >
                  {e.status}
                </span>
                <Link
                  to={e.route as "/apex"}
                  onClick={(ev) => ev.stopPropagation()}
                  className="text-[10.5px] font-semibold text-info hover:underline"
                >
                  Open
                </Link>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Text summary: {APEX_TIMELINE.length} upcoming events across cash, profit, growth, and
        compliance categories. Selected event shown with violet outline.
      </p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Ask LedgerOS chips                                                  */
/* ------------------------------------------------------------------ */

function AskChip({ q }: { q: string }) {
  return (
    <button
      type="button"
      onClick={() => demoAction(`Ask LedgerOS · ${q}`)}
      className="inline-flex items-center gap-1 rounded-full border border-info/30 bg-info/5 px-2 py-0.5 text-[10.5px] font-medium text-info transition hover:bg-info/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <MessageSquareText className="h-3 w-3" aria-hidden />
      {q}
    </button>
  );
}

function ContextualAskBar() {
  return (
    <Card className="border-border/70 bg-gradient-to-r from-info/5 via-transparent to-violet-500/5 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-foreground">
          <Sparkles className="h-3.5 w-3.5 text-info" aria-hidden /> Ask LedgerOS
        </span>
        {APEX_ASK_PROMPTS.map((q) => (
          <AskChip key={q} q={q} />
        ))}
        <HelpCircle className="ml-auto h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications strip (small)                                         */
/* ------------------------------------------------------------------ */

function NotificationsPill() {
  return (
    <div className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-card px-2 py-0.5 text-[11px] text-muted-foreground md:inline-flex">
      <Bell className="h-3 w-3" /> 3 new alerts
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root export                                                         */
/* ------------------------------------------------------------------ */

export function ExecutiveHome() {
  return (
    <AppShell>
      <GreetingHeader />

      <div className="px-6 pb-8 pt-4 sm:px-8">
        <div className="mb-4">
          <DemoNotice message="LedgerOS UI Design Lab · Demonstration Data · No live financial data, AI inference, or approvals." />
        </div>

        {/* B — KPI row */}
        <KpiRow />

        {/* C + D — Main grid + right rail */}
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,270px)]">
          <div className="min-w-0 space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <CashPulseCard />
              <ProfitPulseCard />
            </div>
            <RecommendationsCard />
            <ContextualAskBar />
          </div>
          <aside className="space-y-4">
            <AIBriefingCard />
            <PriorityList />
            <QuickActionGrid />
          </aside>
        </div>

        {/* E — Revenue + anomaly row */}
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RevenueTrendCard />
          </div>
          <RevenueDriversCard />
          <div className="xl:col-span-3">
            <ExpenseAnomaliesCard />
          </div>
        </div>

        {/* F — Financial Timeline */}
        <div className="mt-5">
          <FinancialTimeline />
        </div>

        {/* G — persistent demo notice footer */}
        <div className="mt-6">
          <DemoNotice
            variant="inline"
            message="LedgerOS UI Design Lab · Demonstration Data · No accounting or financial record was modified."
          />
        </div>
      </div>
    </AppShell>
  );
}
