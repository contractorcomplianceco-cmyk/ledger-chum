import { Sparkles, ShieldCheck, XCircle, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AIPersona } from "@/lib/mock/apex-ai-personas";
import { AI_GOVERNANCE, AI_RESPONSE_CONTRACT } from "@/lib/mock/apex-ai-personas";

export function AIPersonaCard({ persona, compact }: { persona: AIPersona; compact?: boolean }) {
  return (
    <Card className="overflow-hidden border-border/70 p-0">
      <div className={cn("bg-gradient-to-r p-3 text-white", persona.theme.gradient)}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div className="text-[13.5px] font-semibold">{persona.name}</div>
          <Badge variant="outline" className="ml-auto border-white/40 bg-white/10 text-[10px] text-white">
            Advisory only
          </Badge>
        </div>
        <div className="mt-1 text-[12px] text-white/85">{persona.tagline}</div>
      </div>
      <div className="space-y-2 p-3">
        <div className="text-[12px] text-muted-foreground">{persona.purpose}</div>
        <div className="text-[11px] text-muted-foreground">
          Intended roles: <span className="text-foreground">{persona.intendedRoles.join(", ")}</span>
        </div>
        {!compact && (
          <div className="mt-2">
            <Link
              to="/apex/ai-personas/$persona"
              params={{ persona: persona.slug }}
              className="text-[12px] font-medium text-primary hover:underline"
            >
              Open persona details →
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}

export function AIQuestionExamples({ questions }: { questions: string[] }) {
  return (
    <ul className="space-y-1.5 text-[12.5px] text-foreground">
      {questions.map((q) => (
        <li key={q} className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>"{q}"</span>
        </li>
      ))}
    </ul>
  );
}

export function AIGovernancePanel() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card className="border-emerald-500/30 bg-emerald-500/5 p-3">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" /> AI can
        </div>
        <ul className="mt-2 space-y-1 text-[12px] text-foreground">
          {AI_GOVERNANCE.can.map((c) => <li key={c}>• {c}</li>)}
        </ul>
      </Card>
      <Card className="border-rose-500/30 bg-rose-500/5 p-3">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-rose-700 dark:text-rose-400">
          <XCircle className="h-4 w-4" /> AI cannot
        </div>
        <ul className="mt-2 space-y-1 text-[12px] text-foreground">
          {AI_GOVERNANCE.cannot.map((c) => <li key={c}>• {c}</li>)}
        </ul>
      </Card>
      <Card className="border-border/70 p-3 md:col-span-2">
        <div className="flex items-center gap-2 text-[12px] font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" /> Every AI response must include
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {AI_RESPONSE_CONTRACT.map((r) => (
            <Badge key={r} variant="outline" className="text-[10.5px]">{r}</Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
