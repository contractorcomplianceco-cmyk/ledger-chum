import { useId } from "react";
import type { ApexIllustrationProps } from "./types";
import { a11yProps } from "./types";

export function RunwayRocket({
  className,
  title = "Runway rocket",
  decorative = true,
  reducedMotion = false,
  width,
  height,
}: ApexIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const body = `apex-rocket-body-${uid}`;
  const flame = `apex-rocket-flame-${uid}`;
  const window = `apex-rocket-win-${uid}`;
  const path = `apex-rocket-path-${uid}`;
  const titleId = `apex-rocket-title-${uid}`;
  const a11y = a11yProps(decorative, title, titleId);

  return (
    <svg
      viewBox="0 0 140 160"
      width={width}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      {...a11y}
    >
      {!decorative && <title id={titleId}>{title}</title>}
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id={window} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id={flame} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={path} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* progress path */}
      <path
        d="M10,150 Q40,130 70,90"
        stroke={`url(#${path})`}
        strokeWidth="2"
        fill="none"
        strokeDasharray="3 3"
      />
      <g transform="translate(70,80)">
        {/* fins */}
        <polygon points="-18,20 -8,10 -8,32" fill="#8b5cf6" />
        <polygon points="18,20 8,10 8,32" fill="#8b5cf6" />
        {/* body */}
        <path
          d="M-10,-38 Q0,-52 10,-38 L10,20 L-10,20 Z"
          fill={`url(#${body})`}
          stroke="#94a3b8"
          strokeWidth="0.6"
        />
        {/* window */}
        <circle cx="0" cy="-16" r="6" fill={`url(#${window})`} stroke="#ffffff" strokeWidth="1.5" />
        {/* stripe */}
        <rect x="-10" y="8" width="20" height="4" fill="#3b82f6" />
        {/* flame */}
        <g>
          <path d="M-7,20 Q0,44 7,20 Z" fill={`url(#${flame})`}>
            {!reducedMotion && (
              <animate
                attributeName="opacity"
                values="1;0.75;1"
                dur="0.8s"
                repeatCount="indefinite"
              />
            )}
          </path>
          <path d="M-3,20 Q0,32 3,20 Z" fill="#fef08a" />
        </g>
      </g>
    </svg>
  );
}
