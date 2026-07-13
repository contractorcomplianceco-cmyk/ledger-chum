import { useCallback, useEffect, useState } from "react";

export type NavMode = "operational" | "executive";

const STORAGE_KEY = "ledgeros.nav-mode";
const EVENT = "ledgeros:nav-mode-change";

function readInitial(): NavMode {
  if (typeof window === "undefined") return "operational";
  // On /apex routes, default to executive mode for the Executive Home experience.
  if (window.location.pathname.startsWith("/apex")) return "executive";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "executive" ? "executive" : "operational";
  } catch {
    return "operational";
  }
}

export function useNavMode() {
  const [mode, setMode] = useState<NavMode>("operational");

  useEffect(() => {
    setMode(readInitial());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<NavMode>).detail;
      if (detail === "operational" || detail === "executive") setMode(detail);
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const set = useCallback((next: NavMode) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
    setMode(next);
  }, []);

  const toggle = useCallback(() => {
    set(mode === "executive" ? "operational" : "executive");
  }, [mode, set]);

  return { mode, set, toggle } as const;
}
