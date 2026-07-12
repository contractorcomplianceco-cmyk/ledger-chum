import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "16.25rem" } as React.CSSProperties}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col bg-background">
          <TopBar />
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

/**
 * Standard page header — used on non-dashboard routes.
 * Compact, left-aligned title/description, right-aligned actions. No large hero.
 */
export function PageHeader({
  eyebrow,
  title,
  highlight,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  const titleNode = highlight ? (
    <>
      {title.split(highlight)[0]}
      <span className="bg-gradient-brand-full bg-clip-text text-transparent">{highlight}</span>
      {title.split(highlight)[1]}
    </>
  ) : (
    title
  );

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 px-6 pb-4 pt-6 sm:px-8",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <h1 className="text-[26px] font-bold tracking-tight text-foreground sm:text-[28px]">
          {titleNode}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[14px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-5 px-6 pb-8 pt-2 sm:px-8", className)}>{children}</div>;
}
