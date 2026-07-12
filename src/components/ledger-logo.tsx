import officialLogo from "@/assets/ledgeros-logo-official.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * LedgerOS brand mark — the official uploaded logo is the ONLY brand asset.
 * The name "LedgerOS · RoseOS Intelligence" is baked into the artwork; never
 * render additional wordmark text alongside it.
 *
 * - `variant="lockup"` full logo (emblem + wordmark) for expanded sidebar / headers.
 * - `variant="emblem"` cropped emblem area for the collapsed sidebar rail.
 * - `variant="splash"` full logo at large size for auth/splash surfaces.
 *
 * The source PNG has a white background, so on dark surfaces we use
 * `mix-blend-mode: screen` to knock the white out while preserving the
 * cyan → violet gradient.
 */
export function LedgerLogo({
  variant = "lockup",
  className,
  onDark = false,
}: {
  variant?: "lockup" | "emblem" | "splash";
  className?: string;
  /** Set true when placing on a dark surface (e.g. the navy sidebar). */
  onDark?: boolean;
}) {
  const blendStyle = onDark ? { mixBlendMode: "screen" as const } : undefined;

  if (variant === "splash") {
    return (
      <img
        src={officialLogo.url}
        alt="LedgerOS — RoseOS Intelligence"
        className={cn("h-auto w-full max-w-[520px] object-contain", className)}
        style={blendStyle}
      />
    );
  }

  if (variant === "emblem") {
    // Crop to the emblem (left ~40% of the artwork).
    return (
      <span
        className={cn("relative block h-14 w-14 overflow-hidden", className)}
        aria-label="LedgerOS"
      >
        <img
          src={officialLogo.url}
          alt=""
          aria-hidden
          className="absolute left-0 top-1/2 h-[220%] w-auto max-w-none -translate-y-1/2 object-contain"
          style={{ ...blendStyle, transform: "translate(-8%, -50%)" }}
        />
      </span>
    );
  }

  // lockup — full logo image, no accompanying text.
  return (
    <img
      src={officialLogo.url}
      alt="LedgerOS — RoseOS Intelligence"
      className={cn("h-16 w-auto object-contain", className)}
      style={blendStyle}
    />
  );
}
