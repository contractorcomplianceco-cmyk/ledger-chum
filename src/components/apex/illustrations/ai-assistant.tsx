import { useId } from "react";
import type { ApexIllustrationProps } from "./types";
import { a11yProps } from "./types";

export function AIAssistant({
  className,
  title = "AI assistant",
  decorative = true,
  reducedMotion = false,
  width,
  height,
}: ApexIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const body = `apex-ai-body-${uid}`;
  const glow = `apex-ai-glow-${uid}`;
  const visor = `apex-ai-visor-${uid}`;
  const titleId = `apex-ai-title-${uid}`;
  const a11y = a11yProps(decorative, title, titleId);

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
        <radialGradient id={glow} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id={visor} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {/* glow */}
      <circle cx="70" cy="70" r="60" fill={`url(#${glow})`}>
        {!reducedMotion && (
          <animate attributeName="r" values="58;64;58" dur="3.5s" repeatCount="indefinite" />
        )}
      </circle>
      {/* antenna */}
      <line x1="70" y1="30" x2="70" y2="18" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx="70" cy="16" r="3" fill="#22d3ee" />
      {/* head */}
      <rect
        x="38"
        y="34"
        width="64"
        height="56"
        rx="14"
        fill={`url(#${body})`}
        stroke="#94a3b8"
        strokeWidth="0.8"
      />
      {/* visor */}
      <rect x="46" y="50" width="48" height="22" rx="10" fill={`url(#${visor})`} />
      {/* eyes */}
      <circle cx="60" cy="61" r="3" fill="#ffffff" />
      <circle cx="80" cy="61" r="3" fill="#ffffff" />
      {/* smile */}
      <path
        d="M62,80 Q70,86 78,80"
        stroke="#94a3b8"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* body/collar */}
      <path
        d="M46,90 Q70,100 94,90 L96,110 Q70,116 44,110 Z"
        fill={`url(#${body})`}
        stroke="#94a3b8"
        strokeWidth="0.8"
      />
      <circle cx="70" cy="105" r="3" fill="#8b5cf6" />
      {/* side lights */}
      <circle cx="40" cy="62" r="2" fill="#22d3ee" />
      <circle cx="100" cy="62" r="2" fill="#22d3ee" />
    </svg>
  );
}
