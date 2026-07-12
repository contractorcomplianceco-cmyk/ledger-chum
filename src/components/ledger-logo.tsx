import emblemAsset from "@/assets/ledgeros-emblem.png.asset.json";
import fullLogoAsset from "@/assets/ledgeros-logo-full.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * LedgerOS brand mark.
 * - `variant="lockup"` renders the emblem + wordmark stacked "RoseOS Intelligence".
 *   Used in the expanded sidebar header.
 * - `variant="emblem"` renders emblem only. Used in the collapsed sidebar and favicons.
 * - `variant="splash"` renders the full uploaded reference logo, for auth/splash surfaces.
 */
export function LedgerLogo({
  variant = "lockup",
  className,
  emblemSize = 36,
}: {
  variant?: "lockup" | "emblem" | "splash";
  className?: string;
  emblemSize?: number;
}) {
  if (variant === "splash") {
    return (
      <img
        src={fullLogoAsset.url}
        alt="LedgerOS · RoseOS Intelligence"
        className={cn("h-auto w-full max-w-[420px]", className)}
      />
    );
  }

  const emblem = (
    <img
      src={emblemAsset.url}
      alt=""
      aria-hidden
      width={emblemSize}
      height={emblemSize}
      style={{ width: emblemSize, height: emblemSize }}
      className="drop-shadow-[0_0_18px_rgba(96,165,250,0.35)]"
      loading="eager"
    />
  );

  if (variant === "emblem") {
    return <span className={cn("inline-flex", className)}>{emblem}</span>;
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {emblem}
      <div className="min-w-0 leading-none">
        <div className="flex items-baseline gap-[1px] font-display text-[19px] font-semibold tracking-tight">
          <span className="text-white">Ledger</span>
          <span className="bg-gradient-brand-full bg-clip-text text-transparent">OS</span>
        </div>
        <div className="mt-1 h-px w-full bg-gradient-to-r from-cyan-400/60 via-violet-400/60 to-transparent" />
        <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.24em] text-cyan-300/80">
          RoseOS Intelligence
        </div>
      </div>
    </div>
  );
}
