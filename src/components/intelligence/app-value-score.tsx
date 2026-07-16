import { cn } from "@/lib/utils";

export function AppValueScore({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const tone =
    score >= 80
      ? "bg-success/10 text-success ring-success/20"
      : score >= 60
        ? "bg-info/10 text-info ring-info/20"
        : score >= 40
          ? "bg-warning/10 text-warning ring-warning/20"
          : "bg-destructive/10 text-destructive ring-destructive/20";
  const dims =
    size === "lg"
      ? "h-14 w-14 text-[18px]"
      : size === "sm"
        ? "h-9 w-9 text-[12px]"
        : "h-11 w-11 text-[14px]";
  return (
    <div
      className={cn(
        "grid place-items-center rounded-xl font-tabular font-bold ring-1 ring-inset",
        tone,
        dims,
      )}
      role="img"
      aria-label={`Build-to-value score ${score} of 100`}
    >
      {score}
    </div>
  );
}
