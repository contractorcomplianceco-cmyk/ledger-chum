import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_SECTIONS } from "@/lib/mock/nav";
import { Sparkles } from "lucide-react";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-brand shadow-glow">
            <span className="text-sm font-black tracking-tight text-brand-foreground">L</span>
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold text-sidebar-foreground">
                LedgerOS
              </div>
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/60">
                <Sparkles className="h-2.5 w-2.5" />
                RoseOS Intelligence
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-1.5 py-2">
        {NAV_SECTIONS.map((section) => (
          <SidebarGroup key={section.label}>
            {!collapsed && (
              <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = isActive(item.to);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-[inset_2px_0_0_0_var(--sidebar-primary)]"
                      >
                        <Link to={item.to} className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="truncate">{item.title}</span>
                              {item.badge && (
                                <span className="ml-auto rounded-full bg-sidebar-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-primary-foreground">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="rounded-lg bg-sidebar-accent/40 p-2.5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-brand" />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-xs font-medium text-sidebar-foreground">
                  Morgan Rose
                </div>
                <div className="truncate text-[10px] text-sidebar-foreground/60">
                  Accounting Lead
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto h-8 w-8 rounded-full bg-gradient-brand" />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
