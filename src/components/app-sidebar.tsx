import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NAV_GROUPS, type NavGroup, type NavItem } from "@/lib/mock/nav";
import { LedgerLogo } from "@/components/ledger-logo";
import { useCurrentUser } from "@/hooks/use-permission";
import { useFavorites, useGroupOpenState, useRecents } from "@/lib/nav-storage";
import {
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Star,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

function hasPermission(held: string[], permission?: string) {
  if (!permission) return true;
  if (held.includes("*")) return true;
  if (held.includes(permission)) return true;
  const [group] = permission.split(".");
  return held.includes(`${group}.*`);
}

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const user = useCurrentUser();
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();
  const recents = useRecents();

  const groupDefaults = useMemo(() => {
    const d: Record<string, boolean> = {};
    for (const g of NAV_GROUPS) d[g.id] = g.defaultOpen ?? false;
    return d;
  }, []);
  const { state: groupOpen, setOpen: setGroupOpen } = useGroupOpenState(groupDefaults);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

  // Filter items + whole groups by permission
  const visibleGroups: NavGroup[] = useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((i) => !i.hidden && hasPermission(user.permissions, i.permission)),
    }))
      .filter((g) => hasPermission(user.permissions, g.permission))
      .filter((g) => g.items.length > 0);
  }, [user.permissions]);

  const allItems = useMemo(() => visibleGroups.flatMap((g) => g.items), [visibleGroups]);
  const favoriteItems = favorites
    .map((to) => allItems.find((i) => i.to === to))
    .filter(Boolean) as NavItem[];
  const recentItems = recents
    .filter((p) => p !== pathname)
    .map((to) => allItems.find((i) => i.to === to))
    .filter(Boolean)
    .slice(0, 4) as NavItem[];

  // Auto-open the group containing the active route
  const activeGroupId = useMemo(
    () => visibleGroups.find((g) => g.items.some((i) => isActive(i.to)))?.id,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleGroups, pathname],
  );

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 [&>[data-sidebar=sidebar]]:bg-gradient-sidebar [&>[data-sidebar=sidebar]]:text-sidebar-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(700px 240px at 10% 0%, rgba(59,130,246,0.16), transparent 60%), radial-gradient(500px 200px at 90% 100%, rgba(139,92,246,0.10), transparent 60%)",
        }}
      />

      <SidebarHeader className="relative z-10 px-2 py-1">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="flex min-w-0 items-center">
            {collapsed ? <LedgerLogo variant="emblem" onDark /> : <LedgerLogo variant="lockup" onDark />}
          </Link>
          {!collapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-sidebar-foreground/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="mx-auto mt-1.5 grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-sidebar-foreground/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </SidebarHeader>

      <SidebarContent className="relative z-10 px-2 py-2">
        {/* Favorites */}
        {!collapsed && favoriteItems.length > 0 && (
          <div className="mb-3">
            <SectionLabel>Favorites</SectionLabel>
            <SidebarMenu className="gap-0.5">
              {favoriteItems.map((item) => (
                <NavRow
                  key={"fav-" + item.to}
                  item={item}
                  active={isActive(item.to)}
                  collapsed={collapsed}
                  favorite
                  onToggleFavorite={() => toggleFavorite(item.to)}
                  isFavorite={isFavorite(item.to)}
                />
              ))}
            </SidebarMenu>
          </div>
        )}

        {/* Recents */}
        {!collapsed && recentItems.length > 0 && (
          <div className="mb-3">
            <SectionLabel icon={<Clock className="h-3 w-3" />}>Recent</SectionLabel>
            <SidebarMenu className="gap-0.5">
              {recentItems.map((item) => (
                <NavRow
                  key={"recent-" + item.to}
                  item={item}
                  active={isActive(item.to)}
                  collapsed={collapsed}
                  compact
                  onToggleFavorite={() => toggleFavorite(item.to)}
                  isFavorite={isFavorite(item.to)}
                />
              ))}
            </SidebarMenu>
          </div>
        )}

        {/* Groups */}
        {visibleGroups.map((group) => {
          const isOpen = collapsed
            ? true
            : (groupOpen[group.id] ?? group.defaultOpen ?? false) || group.id === activeGroupId;
          const GroupIcon = group.icon;
          return (
            <div key={group.id} className={cn("mb-1", !collapsed && "mb-2")}>
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => setGroupOpen(group.id, !isOpen)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/50 transition hover:text-white/90"
                  aria-expanded={isOpen}
                >
                  {GroupIcon && <GroupIcon className="h-3 w-3" />}
                  <span className="flex-1 text-left">{group.title}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      !isOpen && "-rotate-90",
                    )}
                  />
                </button>
              )}
              {isOpen && (
                <SidebarMenu className="gap-0.5">
                  {group.items.map((item) => (
                    <NavRow
                      key={item.to + item.title}
                      item={item}
                      active={isActive(item.to)}
                      collapsed={collapsed}
                      onToggleFavorite={() => toggleFavorite(item.to)}
                      isFavorite={isFavorite(item.to)}
                    />
                  ))}
                </SidebarMenu>
              )}
            </div>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="relative z-10 gap-2 px-2 pb-3 pt-2">
        {collapsed ? (
          <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-gradient-brand-full text-[11px] font-semibold text-white">
            RT
          </div>
        ) : (
          <>
            <button
              type="button"
              className="group flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-2 pr-2.5 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand-full text-[11px] font-semibold text-white">
                RT
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[13px] font-semibold text-white">Rose Taylor</div>
                <div className="truncate text-[11px] text-sidebar-foreground/60">Owner</div>
              </div>
              <ChevronRight className="h-4 w-4 text-sidebar-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-white" />
            </button>

            <button
              type="button"
              className="group flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-gradient-brand-cool text-[10px] font-bold text-white">
                C
              </div>
              <div className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-sidebar-foreground">
                CCA Compliance Authority
              </div>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50 transition group-hover:text-white" />
            </button>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40">
      {icon}
      <span>{children}</span>
    </div>
  );
}

function NavRow({
  item,
  active,
  collapsed,
  compact,
  favorite,
  isFavorite,
  onToggleFavorite,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  compact?: boolean;
  favorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const Icon = item.icon;
  const [hover, setHover] = useState(false);
  return (
    <SidebarMenuItem onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={item.title}
        className={cn(
          "group relative h-10 gap-2.5 rounded-lg px-3 text-[13.5px] font-medium",
          "text-sidebar-foreground/85 hover:bg-white/[0.06] hover:text-white",
          "data-[active=true]:bg-gradient-sidebar-active data-[active=true]:text-white data-[active=true]:shadow-side-active",
          "data-[active=true]:hover:bg-gradient-sidebar-active",
          compact && "h-9 text-[13px]",
        )}
      >
        <Link to={item.to} className="flex items-center gap-2.5">
          <Icon
            className={cn(
              "h-[17px] w-[17px] shrink-0 transition-colors",
              active ? "text-white" : "text-sidebar-foreground/70 group-hover:text-white",
            )}
          />
          {!collapsed && (
            <>
              <span className="truncate">{item.title}</span>
              <span className="ml-auto flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={cn(
                      "grid h-[18px] min-w-[18px] place-items-center rounded-full px-1.5 text-[10.5px] font-semibold text-white",
                      item.badgeTone === "violet"
                        ? "bg-violet-500"
                        : item.badgeTone === "warning"
                          ? "bg-amber-500"
                          : "bg-gradient-brand-cool",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {onToggleFavorite && (hover || isFavorite) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite();
                    }}
                    aria-label={isFavorite ? "Remove favorite" : "Add favorite"}
                    className="rounded p-0.5 text-sidebar-foreground/60 hover:bg-white/10 hover:text-white"
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        (isFavorite || favorite) && "fill-current text-amber-400",
                      )}
                    />
                  </button>
                )}
              </span>
            </>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
