import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { currency } from "@/lib/mock/finance";

type Tone = "blue" | "cyan" | "violet" | "mint";

const toneGradient: Record<Tone, string> = {
  blue: "bg-gradient-brand-cool",
  cyan: "bg-gradient-brand-mint",
  violet: "bg-gradient-brand-vio",
  mint: "bg-gradient-brand-mint",
};

const toneStroke: Record<Tone, string> = {
  blue: "#3b82f6",
  cyan: "#22d3ee",
  violet: "#8b5cf6",
  mint: "#06b6d4",
};

export function KpiCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  tone = "blue",
  format = "currency",
  sparkline,
  compareLabel = "vs last month",
}: {
  label: string;
  value: number;
  delta: number;
  trend: "up" | "down";
  icon?: LucideIcon;
  tone?: Tone;
  format?: "currency" | "number" | "percent";
  sparkline?: number[];
  compareLabel?: string;
}) {
  const positive = trend === "up";
  const formatted =
    format === "currency"
      ? currency(value)
      : format === "percent"
        ? `${value.toFixed(2)}%`
        : value.toLocaleString();

  const data = (sparkline ?? []).map((v, i) => ({ i, v }));
  const gradId = `spark-${tone}-${label.replace(/\s+/g, "-")}`;

  return (
    <Card className="group relative overflow-hidden border border-border/70 bg-surface p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12.5px] font-semibold text-foreground/80">{label}</div>
          <div className="mt-2 font-tabular text-[28px] font-bold leading-none tracking-tight text-foreground">
            {formatted}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold",
                positive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
              )}
            >
              {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {Math.abs(delta).toFixed(1)}%
            </span>
            <span className="text-[11.5px] text-muted-foreground">{compareLabel}</span>
          </div>
        </div>
        {Icon && (
          <div
            className={cn(
              "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-[0_6px_16px_-6px_rgba(59,130,246,0.55)]",
              toneGradient[tone],
            )}
          >
            <Icon className="h-[19px] w-[19px]" />
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="pointer-events-none absolute bottom-2 right-3 h-11 w-32 opacity-90">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={toneStroke[tone]} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={toneStroke[tone]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={toneStroke[tone]}
                strokeWidth={1.75}
                fill={`url(#${gradId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
