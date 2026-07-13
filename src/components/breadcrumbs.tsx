import { Fragment, useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { ALL_NAV_ITEMS, NAV_GROUPS } from "@/lib/mock/nav";
import { cn } from "@/lib/utils";

type Crumb = { title: string; to?: string };

/**
 * Derives breadcrumbs from the current pathname by walking segment-by-segment
 * and looking up matching nav entries (including hidden child-only routes).
 * Dynamic segments ($id) are shown as-is when no static label matches.
 */
function buildCrumbs(pathname: string): Crumb[] {
  if (pathname === "/") return [{ title: "Dashboard", to: "/" }];

  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ title: "Home", to: "/" }];

  let acc = "";
  for (let i = 0; i < parts.length; i++) {
    acc += "/" + parts[i];
    const isLast = i === parts.length - 1;

    // Prefer exact static match
    const exact = ALL_NAV_ITEMS.find((item) => item.to === acc);
    if (exact) {
      crumbs.push({ title: exact.title, to: isLast ? undefined : exact.to });
      continue;
    }

    // Try matching dynamic route templates like /invoices/$invoiceId
    const dynamic = ALL_NAV_ITEMS.find((item) => {
      const template = item.to.split("/");
      const current = acc.split("/");
      if (template.length !== current.length) return false;
      return template.every((seg, idx) => seg.startsWith("$") || seg === current[idx]);
    });
    if (dynamic) {
      crumbs.push({ title: dynamic.title, to: isLast ? undefined : acc });
      continue;
    }

    // Fallback: derive a readable label from group membership or segment
    const group = NAV_GROUPS.find((g) => g.items.some((it) => it.to === acc));
    crumbs.push({
      title: group?.title ?? decodeURIComponent(parts[i]).replace(/-/g, " "),
      to: isLast ? undefined : acc,
    });
  }
  return crumbs;
}

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex min-w-0 items-center gap-1 text-[12.5px] text-muted-foreground",
        className,
      )}
    >
      {crumbs.map((c, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <Fragment key={idx}>
            {idx > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />}
            {c.to && !isLast ? (
              <Link
                to={c.to}
                className="max-w-[160px] truncate rounded px-1 py-0.5 hover:bg-muted hover:text-foreground"
              >
                {idx === 0 ? <Home className="h-3.5 w-3.5" /> : c.title}
              </Link>
            ) : (
              <span
                aria-current={isLast ? "page" : undefined}
                className={cn(
                  "max-w-[220px] truncate px-1 py-0.5",
                  isLast && "font-semibold text-foreground",
                )}
              >
                {idx === 0 && !c.to ? <Home className="h-3.5 w-3.5" /> : c.title}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
