import { Compass } from "lucide-react";
import { useTour } from "./tour-provider";

/**
 * Persistent, tasteful launcher for the guided product tour.
 * Two variants: a labeled pill (default) and a compact icon button.
 */
export function TourLauncher({ variant = "pill" }: { variant?: "pill" | "icon" }) {
  const { startTour, ready } = useTour();
  if (!ready) return null;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={startTour}
        aria-label="Take the guided tour"
        title="Take the guided tour"
        className="grid h-9 w-9 place-items-center rounded-xl border border-brand/30 bg-brand/5 text-brand shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-brand/50 hover:bg-brand/10"
      >
        <Compass className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={startTour}
      aria-label="Take the guided tour"
      className="hidden h-10 items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-3 text-[13px] font-medium text-brand shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:border-brand/50 hover:bg-brand/10 sm:inline-flex"
    >
      <Compass className="h-4 w-4" />
      Take the tour
    </button>
  );
}
