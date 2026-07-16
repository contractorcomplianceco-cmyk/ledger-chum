import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";
import { TOUR_STEPS, TOUR_SEEN_KEY, type TourStep } from "./tour-steps";

interface TourContextValue {
  /** Start the guided tour from the beginning. */
  startTour: () => void;
  /** True once the client has mounted (safe to render client-only UI). */
  ready: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within <TourProvider>");
  return ctx;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Poll for an element until it exists or the timeout elapses. */
function waitForElement(selector: string, timeout = 1500): Promise<Element | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }
    const start = performance.now();
    const tick = () => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        return;
      }
      if (performance.now() - start >= timeout) {
        resolve(null);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const driverRef = useRef<Driver | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    setReady(true);
  }, []);

  const cleanup = useCallback(() => {
    driverRef.current?.destroy();
    driverRef.current = null;
  }, []);

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(TOUR_SEEN_KEY, "1");
    } catch {
      /* storage may be unavailable (private mode) — non-fatal */
    }
  }, []);

  /** Navigate to the step's route (if needed) and wait for its target. */
  const prepareStep = useCallback(
    async (step: TourStep) => {
      if (step.route && pathnameRef.current !== step.route) {
        await navigate({ to: step.route });
      }
      if (step.selector) {
        await waitForElement(step.selector);
      } else {
        // Give a centered step a frame so layout settles.
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      }
    },
    [navigate],
  );

  const startTour = useCallback(() => {
    if (typeof window === "undefined") return;
    cleanup();

    const animate = !prefersReducedMotion();
    const lastIndex = TOUR_STEPS.length - 1;

    const steps = TOUR_STEPS.map((step) => ({
      element: step.selector,
      popover: {
        title: step.title,
        description: step.description,
        ...(step.side ? { side: step.side } : {}),
        align: step.align ?? "start",
      },
    }));

    const d = driver({
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      animate,
      overlayColor: "#0b1220",
      overlayOpacity: 0.72,
      stagePadding: 8,
      stageRadius: 12,
      allowClose: true,
      disableActiveInteraction: true,
      popoverClass: "ledgeros-tour",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Finish",
      steps,
      onNextClick: async () => {
        const idx = d.getActiveIndex() ?? 0;
        if (idx >= lastIndex) {
          d.destroy();
          return;
        }
        await prepareStep(TOUR_STEPS[idx + 1]);
        d.moveNext();
      },
      onPrevClick: async () => {
        const idx = d.getActiveIndex() ?? 0;
        if (idx <= 0) return;
        await prepareStep(TOUR_STEPS[idx - 1]);
        d.movePrevious();
      },
      onCloseClick: () => {
        markSeen();
        d.destroy();
      },
      onDestroyed: () => {
        markSeen();
        driverRef.current = null;
      },
    });

    driverRef.current = d;

    // Prepare the first step (navigate + wait) before driving.
    void prepareStep(TOUR_STEPS[0]).then(() => {
      d.drive(0);
    });
  }, [cleanup, markSeen, prepareStep]);

  // Auto-start once per browser on first demo visit.
  useEffect(() => {
    if (!ready) return;
    let seen = "1";
    try {
      seen = window.localStorage.getItem(TOUR_SEEN_KEY) ?? "";
    } catch {
      seen = "1";
    }
    if (seen) return;
    const t = window.setTimeout(() => startTour(), 900);
    return () => window.clearTimeout(t);
  }, [ready, startTour]);

  useEffect(() => cleanup, [cleanup]);

  const value = useMemo<TourContextValue>(() => ({ startTour, ready }), [startTour, ready]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
