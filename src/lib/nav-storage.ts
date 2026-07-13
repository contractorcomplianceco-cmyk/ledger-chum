import { useCallback, useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

const KEY_GROUPS = "ledgeros:nav:groups";
const KEY_FAVORITES = "ledgeros:nav:favorites";
const KEY_RECENTS = "ledgeros:nav:recents";
const MAX_RECENTS = 8;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Persisted open/closed state per nav group id. */
export function useGroupOpenState(defaults: Record<string, boolean>) {
  const [state, setState] = useState<Record<string, boolean>>(defaults);

  useEffect(() => {
    const stored = readJSON<Record<string, boolean>>(KEY_GROUPS, {});
    setState((prev) => ({ ...prev, ...stored }));
  }, []);

  const setOpen = useCallback((id: string, open: boolean) => {
    setState((prev) => {
      const next = { ...prev, [id]: open };
      writeJSON(KEY_GROUPS, next);
      return next;
    });
  }, []);

  return { state, setOpen };
}

/** Persisted favorite routes (list of `to` paths). */
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readJSON<string[]>(KEY_FAVORITES, []));
  }, []);

  const toggle = useCallback((to: string) => {
    setFavorites((prev) => {
      const next = prev.includes(to) ? prev.filter((t) => t !== to) : [...prev, to];
      writeJSON(KEY_FAVORITES, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((to: string) => favorites.includes(to), [favorites]);

  return { favorites, toggle, isFavorite };
}

/** Auto-tracked recent routes (list of pathnames). */
export function useRecents() {
  const [recents, setRecents] = useState<string[]>([]);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    setRecents(readJSON<string[]>(KEY_RECENTS, []));
  }, []);

  useEffect(() => {
    if (!pathname) return;
    setRecents((prev) => {
      const filtered = prev.filter((p) => p !== pathname);
      const next = [pathname, ...filtered].slice(0, MAX_RECENTS);
      writeJSON(KEY_RECENTS, next);
      return next;
    });
  }, [pathname]);

  return recents;
}
