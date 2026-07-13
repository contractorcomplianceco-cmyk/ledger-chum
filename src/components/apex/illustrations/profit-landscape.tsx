import { useId } from "react";
import type { ApexIllustrationProps } from "./types";
import { a11yProps } from "./types";

export function ProfitLandscape({
  className,
  title = "Profit landscape",
  decorative = true,
  width,
  height,
}: ApexIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const mtn = `apex-profit-mtn-${uid}`;
  const path = `apex-profit-path-${uid}`;
  const coin = `apex-profit-coin-${uid}`;
  const titleId = `apex-profit-title-${uid}`;
  const a11y = a11yProps(decorative, title, titleId);

  return (
    <svg
      viewBox="0 0 320 140"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      {...a11y}
    >
      {!decorative && <title id={titleId}>{title}</title>}
      <defs>
        <linearGradient id={mtn} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id={path} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id={coin} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* back mountain */}
      <polygon points="0,130 90,50 180,130" fill="#a78bfa" opacity="0.55" />
      {/* main mountain */}
      <polygon points="70,130 200,20 320,130" fill={`url(#${mtn})`} />
      {/* upward path */}
      <path
        d="M20,128 Q90,110 160,80 T280,30"
        stroke={`url(#${path})`}
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="4 3"
      />
      {/* flag at top */}
      <g transform="translate(200,20)">
        <line x1="0" y1="0" x2="0" y2="-18" stroke="#1e293b" strokeWidth="1.5" />
        <polygon points="0,-18 14,-14 0,-10" fill="#f43f5e" />
      </g>
      {/* stacked coins */}
      <g transform="translate(50,110)">
        <ellipse cx="0" cy="12" rx="12" ry="3.5" fill={`url(#${coin})`} />
        <ellipse cx="0" cy="7" rx="12" ry="3.5" fill={`url(#${coin})`} />
        <ellipse cx="0" cy="2" rx="12" ry="3.5" fill={`url(#${coin})`} />
        <ellipse cx="0" cy="2" rx="12" ry="3.5" fill="none" stroke="#b45309" strokeWidth="0.4" opacity="0.4" />
      </g>
      {/* soft ground */}
      <path d="M0,130 L320,130 L320,140 L0,140 Z" fill="#ede9fe" />
    </svg>
  );
}
