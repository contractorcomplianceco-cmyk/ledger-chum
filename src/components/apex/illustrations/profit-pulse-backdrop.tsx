import { useId } from "react";
import type { ApexIllustrationProps } from "./types";
import { a11yProps } from "./types";

export function ProfitPulseBackdrop({
  className,
  title = "Profit pulse backdrop",
  decorative = true,
  width,
  height,
}: ApexIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const hill = `apex-profit-bg-hill-${uid}`;
  const line = `apex-profit-bg-line-${uid}`;
  const titleId = `apex-profit-bg-title-${uid}`;
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
        <linearGradient id={hill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={line} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      {/* clouds */}
      <g opacity="0.4" fill="#ffffff">
        <ellipse cx="60" cy="40" rx="18" ry="6" />
        <ellipse cx="230" cy="30" rx="22" ry="7" />
      </g>
      {/* rolling hills */}
      <path d="M0,150 Q80,110 160,140 T320,120 L320,200 L0,200 Z" fill={`url(#${hill})`} />
      <path d="M0,170 Q100,140 200,160 T320,150 L320,200 L0,200 Z" fill="#8b5cf6" opacity="0.15" />
      {/* small trees */}
      <g opacity="0.55">
        <g transform="translate(50,140)">
          <polygon points="0,-12 6,0 -6,0" fill="#34d399" />
          <rect x="-1" y="0" width="2" height="4" fill="#78350f" />
        </g>
        <g transform="translate(240,132)">
          <polygon points="0,-10 5,0 -5,0" fill="#34d399" />
          <rect x="-1" y="0" width="2" height="3" fill="#78350f" />
        </g>
      </g>
      {/* upward chart path */}
      <polyline
        points="20,170 70,155 110,140 160,120 210,100 260,75 300,55"
        fill="none"
        stroke={`url(#${line})`}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* flag on hill */}
      <g transform="translate(300,55)">
        <line x1="0" y1="0" x2="0" y2="-14" stroke="#1e293b" strokeWidth="1.2" />
        <polygon points="0,-14 10,-10 0,-7" fill="#f43f5e" />
      </g>
    </svg>
  );
}
