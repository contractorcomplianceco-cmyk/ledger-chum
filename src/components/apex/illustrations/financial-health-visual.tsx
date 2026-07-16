import { useId } from "react";
import type { ApexIllustrationProps } from "./types";
import { a11yProps } from "./types";

export function FinancialHealthVisual({
  className,
  title = "Financial health",
  decorative = true,
  width,
  height,
}: ApexIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const arc = `apex-health-arc-${uid}`;
  const shield = `apex-health-shield-${uid}`;
  const titleId = `apex-health-title-${uid}`;
  const a11y = a11yProps(decorative, title, titleId);

  // Gauge: 270deg arc
  const r = 52;
  const cx = 70;
  const cy = 72;
  const start = -225;
  const sweep = 270;
  const toXY = (deg: number) => [
    cx + r * Math.cos((deg * Math.PI) / 180),
    cy + r * Math.sin((deg * Math.PI) / 180),
  ];
  const [sx, sy] = toXY(start);
  const [ex, ey] = toXY(start + sweep);
  const bgPath = `M${sx},${sy} A${r},${r} 0 1 1 ${ex},${ey}`;

  // Progress ~72% of the arc (decorative)
  const progDeg = start + sweep * 0.72;
  const [px, py] = toXY(progDeg);
  const progPath = `M${sx},${sy} A${r},${r} 0 1 1 ${px},${py}`;

  return (
    <svg
      viewBox="0 0 140 140"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      {...a11y}
    >
      {!decorative && <title id={titleId}>{title}</title>}
      <defs>
        <linearGradient id={arc} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="60%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id={shield} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      {/* subtle chart backdrop */}
      <g opacity="0.18">
        <polyline
          points="20,110 40,100 60,105 80,88 100,92 120,74"
          fill="none"
          stroke="#0d9488"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
      {/* gauge track */}
      <path d={bgPath} fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
      {/* gauge progress */}
      <path
        d={progPath}
        fill="none"
        stroke={`url(#${arc})`}
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* shield/check */}
      <g transform="translate(70,72)">
        <path
          d="M0,-18 L14,-12 L14,4 Q14,14 0,20 Q-14,14 -14,4 L-14,-12 Z"
          fill={`url(#${shield})`}
        />
        <path
          d="M-6,0 L-1,5 L7,-4"
          stroke="#ffffff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
