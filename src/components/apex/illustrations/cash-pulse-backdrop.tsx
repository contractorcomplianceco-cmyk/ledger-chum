import { useId } from "react";
import type { ApexIllustrationProps } from "./types";
import { a11yProps } from "./types";

export function CashPulseBackdrop({
  className,
  title = "Cash pulse backdrop",
  decorative = true,
  width,
  height,
}: ApexIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const arc = `apex-cash-bg-arc-${uid}`;
  const coin = `apex-cash-bg-coin-${uid}`;
  const titleId = `apex-cash-bg-title-${uid}`;
  const a11y = a11yProps(decorative, title, titleId);

  return (
    <svg
      viewBox="0 0 320 200"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      {...a11y}
    >
      {!decorative && <title id={titleId}>{title}</title>}
      <defs>
        <linearGradient id={arc} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id={coin} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <g opacity="0.45">
        <circle cx="40" cy="180" r="120" fill="none" stroke={`url(#${arc})`} strokeWidth="1.2" />
        <circle
          cx="40"
          cy="180"
          r="80"
          fill="none"
          stroke="#22d3ee"
          strokeOpacity="0.2"
          strokeWidth="1"
        />
        <circle
          cx="280"
          cy="30"
          r="90"
          fill="none"
          stroke="#8b5cf6"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
      </g>
      {/* coins */}
      <g opacity="0.85">
        <circle cx="270" cy="150" r="10" fill={`url(#${coin})`} />
        <circle cx="290" cy="170" r="6" fill={`url(#${coin})`} />
        <circle cx="30" cy="40" r="7" fill={`url(#${coin})`} />
      </g>
      {/* icon glyphs */}
      <g opacity="0.28" fill="none" stroke="#f97316" strokeWidth="1.5">
        <rect x="230" y="60" width="20" height="14" rx="2" />
        <line x1="230" y1="66" x2="250" y2="66" />
      </g>
      <g opacity="0.28" fill="none" stroke="#3b82f6" strokeWidth="1.5">
        <circle cx="100" cy="150" r="8" />
        <line x1="100" y1="146" x2="100" y2="154" />
        <line x1="96" y1="150" x2="104" y2="150" />
      </g>
    </svg>
  );
}
