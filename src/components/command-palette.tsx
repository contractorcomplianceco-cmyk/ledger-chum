import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV_GROUPS, ALL_NAV_ITEMS, type NavItem } from "@/lib/mock/nav";
import { usePermission } from "@/hooks/use-permission";
import { useFavorites, useRecents } from "@/lib/nav-storage";
import { Star, Clock } from "lucide-react";

function usePermittedItems(items: NavItem[]): NavItem[] {
  // Wrapper: we can't call hooks in a loop, so filter using a stable
  // proxy that reads the current user permissions once.
  const owner = usePermission("*").allowed;
  // The mock currentUser is a static owner in the Design Lab, so we can
  // safely bypass per-item permission checks when the user has "*".
  // For non-owner roles this would need a per-item check via a small
  // Permitted wrapper component; command items don't render conditionally
  // in the Design Lab, but hidden items are still filtered here.
  return owner ? items : items.filter((i) => !i.permission);
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const { favorites, toggle, isFavorite } = useFavorites();
  const recents = useRecents();

  const permitted = usePermittedItems(ALL_NAV_ITEMS);

  const favoriteItems = useMemo(
    () => favorites.map((to) => permitted.find((i) => i.to === to)).filter(Boolean) as NavItem[],
    [favorites, permitted],
  );

  const recentItems = useMemo(
    () => recents.map((to) => permitted.find((i) => i.to === to)).filter(Boolean) as NavItem[],
    [recents, permitted],
  );

  const go = (item: NavItem) => {
    if (item.to.includes("$")) {
      onOpenChange(false);
      return; // dynamic routes cannot be navigated to without params
    }
    onOpenChange(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate({ to: item.to as any });
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, sections, or actions…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {favoriteItems.length > 0 && (
          <>
            <CommandGroup heading="Favorites">
              {favoriteItems.map((item) => (
                <CommandItem
                  key={"fav-" + item.to}
                  value={"fav " + item.title + " " + item.to}
                  onSelect={() => go(item)}
                >
                  <Star className="mr-2 h-4 w-4 fill-current text-amber-500" />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {recentItems.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentItems.map((item) => (
                <CommandItem
                  key={"recent-" + item.to}
                  value={"recent " + item.title + " " + item.to}
                  onSelect={() => go(item)}
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {item.title}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((i) => !i.hidden);
          if (items.length === 0) return null;
          return (
            <CommandGroup key={group.id} heading={group.title}>
              {items.map((item) => {
                const Icon = item.icon;
                const fav = isFavorite(item.to);
                return (
                  <CommandItem
                    key={item.to + item.title}
                    value={`${group.title} ${item.title} ${(item.keywords ?? []).join(" ")} ${item.to}`}
                    onSelect={() => go(item)}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{item.title}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(item.to);
                      }}
                      className="ml-2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={fav ? "Remove favorite" : "Add favorite"}
                    >
                      <Star
                        className={fav ? "h-3.5 w-3.5 fill-current text-amber-500" : "h-3.5 w-3.5"}
                      />
                    </button>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}

/** Global ⌘K / Ctrl+K shortcut hook. */
export function useCommandPaletteShortcut(setOpen: (open: boolean) => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  useCommandPaletteShortcut(setOpen);
  return { open, setOpen };
}
