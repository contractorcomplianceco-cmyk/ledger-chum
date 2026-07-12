import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, Search, HelpCircle, FlaskConical } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-3 backdrop-blur-md sm:px-5">
      <SidebarTrigger className="shrink-0" />
      <Separator orientation="vertical" className="h-6" />

      <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search accounts, invoices, journals…"
            className="h-9 pl-9 pr-14 bg-muted/50 border-transparent focus-visible:bg-background"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Badge
          variant="outline"
          className="hidden gap-1.5 border-warning/40 bg-warning/10 text-warning-foreground sm:inline-flex"
        >
          <FlaskConical className="h-3 w-3 text-warning" />
          <span className="text-warning">UI Design Lab · Demonstration Data</span>
        </Badge>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand shadow-glow" />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2 pr-1">
          <div className="hidden text-right leading-tight sm:block">
            <div className="text-xs font-medium">Morgan Rose</div>
            <div className="text-[10px] text-muted-foreground">Accounting Lead</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-brand shadow-elegant" />
        </div>
      </div>
    </header>
  );
}
