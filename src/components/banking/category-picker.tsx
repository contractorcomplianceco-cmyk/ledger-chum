import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Lock } from "lucide-react";
import { CATEGORY_GROUPS } from "@/lib/mock/banking";
import { DemoNotice, DEMO_ACTION_MESSAGE } from "@/components/banking/demo-notice";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CategoryPicker({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const filter = (name: string, code: string) =>
    !query || `${code} ${name}`.toLowerCase().includes(query.toLowerCase());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Assign category</SheetTitle>
          <SheetDescription>Pick an account from the chart of accounts.</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search account name or code"
              className="pl-9"
            />
          </div>

          <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
            {CATEGORY_GROUPS.map((group) => {
              const visible = group.accounts.filter((a) => filter(a.name, a.code));
              if (visible.length === 0) return null;
              return (
                <div key={group.label}>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {visible.map((a) => (
                      <button
                        key={a.code}
                        type="button"
                        onClick={() => {
                          toast(`Assigned to ${a.code} ${a.name}`, {
                            description: DEMO_ACTION_MESSAGE,
                          });
                          onOpenChange(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left transition-colors hover:border-border hover:bg-muted",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        )}
                      >
                        <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">
                          {a.code}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{a.name}</span>
                          {"note" in a && a.note && (
                            <span className="block truncate text-[10px] text-muted-foreground">
                              {a.note}
                            </span>
                          )}
                        </span>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {a.type}
                        </Badge>
                        {"restricted" in a && a.restricted && (
                          <Lock className="h-3 w-3 shrink-0 text-warning" aria-label="Restricted" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <DemoNotice />
        </div>
      </SheetContent>
    </Sheet>
  );
}
