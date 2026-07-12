import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, HelpCircle, LogOut, ChevronDown, Calendar, Plus, FlaskConical } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur-md sm:px-6">
      <SidebarTrigger className="shrink-0 md:hidden" />

      {/* Global search — center-right on desktop */}
      <div className="hidden min-w-0 flex-1 items-center lg:flex">
        <div className="relative w-full max-w-[360px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search anything…"
            className="h-10 rounded-xl border-border/70 bg-surface pl-9 pr-14 text-[13.5px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] focus-visible:border-brand/40 focus-visible:ring-2 focus-visible:ring-brand/15"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </div>
      </div>

      <Badge
        variant="outline"
        className="ml-auto hidden gap-1.5 rounded-full border-brand/30 bg-brand/5 px-2.5 py-1 text-[11px] font-medium text-brand xl:inline-flex"
      >
        <FlaskConical className="h-3 w-3" />
        LedgerOS UI Design Lab · Demonstration Data
      </Badge>

      <div className="flex items-center gap-2 lg:ml-2">
        {/* Date range selector */}
        <button
          type="button"
          className="hidden h-10 items-center gap-2 rounded-xl border border-border/70 bg-surface px-3 text-[13px] font-medium text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-border-strong sm:inline-flex"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          This Month
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-border/70 bg-surface text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-border-strong"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-brand-full px-1 text-[10px] font-semibold text-white shadow-[0_2px_8px_rgba(59,130,246,0.45)]">
            7
          </span>
        </button>

        {/* Help */}
        <button
          type="button"
          aria-label="Help"
          className="hidden h-10 w-10 place-items-center rounded-xl border border-border/70 bg-surface text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-border-strong sm:grid"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Logout */}
        <button
          type="button"
          aria-label="Sign out"
          className="hidden h-10 w-10 place-items-center rounded-xl border border-border/70 bg-surface text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-border-strong sm:grid"
        >
          <LogOut className="h-4 w-4" />
        </button>

        {/* Primary New button */}
        <Button className="h-10 gap-1.5 rounded-xl bg-gradient-brand-full pl-3 pr-2 text-[13.5px] font-semibold text-white shadow-[0_6px_18px_-6px_rgba(99,102,241,0.55)] hover:brightness-110">
          <Plus className="h-4 w-4" />
          New
          <ChevronDown className="ml-0.5 h-3.5 w-3.5 opacity-80" />
        </Button>
      </div>
    </header>
  );
}
