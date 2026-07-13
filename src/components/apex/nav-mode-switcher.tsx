import { useNavMode } from "@/hooks/use-nav-mode";
import { Compass, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavModeSwitcher({ compact = false }: { compact?: boolean }) {
  const { mode, set } = useNavMode();

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => set(mode === "executive" ? "operational" : "executive")}
        aria-label={mode === "executive" ? "Switch to operational navigation" : "Switch to executive navigation"}
        title={mode === "executive" ? "Executive mode — click to switch to Operational" : "Operational mode — click to switch to Executive"}
        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-sidebar-foreground/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      >
        {mode === "executive" ? <Sparkles className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <div
      role="tablist"
      aria-label="Navigation mode"
      className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
    >
      <button
        role="tab"
        aria-selected={mode === "operational"}
        type="button"
        onClick={() => set("operational")}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11.5px] font-medium transition",
          mode === "operational"
            ? "bg-gradient-brand-cool text-white shadow-side-active"
            : "text-sidebar-foreground/70 hover:text-white",
        )}
      >
        <Compass className="h-3.5 w-3.5" />
        Operational
      </button>
      <button
        role="tab"
        aria-selected={mode === "executive"}
        type="button"
        onClick={() => set("executive")}
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11.5px] font-medium transition",
          mode === "executive"
            ? "bg-gradient-brand-cool text-white shadow-side-active"
            : "text-sidebar-foreground/70 hover:text-white",
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
        Executive
      </button>
    </div>
  );
}
