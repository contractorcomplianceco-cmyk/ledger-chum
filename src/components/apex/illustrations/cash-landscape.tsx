import { useId } from "react";
import type { ApexIllustrationProps } from "./types";
import { a11yProps } from "./types";

export function CashLandscape({
  className,
  title = "Cash landscape",
  decorative = true,
  reducedMotion = false,
  width,
  height,
}: ApexIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const sky = `apex-cash-sky-${uid}`;
  const water = `apex-cash-water-${uid}`;
  const coin = `apex-cash-coin-${uid}`;
  const titleId = `apex-cash-title-${uid}`;
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
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={water} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient id={coin} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="90" fill={`url(#${sky})`} opacity="0.6" />
      {/* distant vault architecture */}
      <g opacity="0.55" fill="#8b5cf6">
        <rect x="40" y="60" width="30" height="30" rx="2" />
        <polygon points="40,60 55,48 70,60" />
        <rect x="80" y="52" width="24" height="38" rx="2" fill="#6366f1" />
        <polygon points="80,52 92,42 104,52" fill="#6366f1" />
        <rect x="240" y="58" width="34" height="32" rx="2" />
        <polygon points="240,58 257,46 274,58" />
      </g>
      {/* water */}
      <path d="M0,95 Q80,88 160,95 T320,95 L320,140 L0,140 Z" fill={`url(#${water})`} />
      <path d="M0,105 Q80,98 160,105 T320,105" stroke="#7dd3fc" strokeWidth="1" fill="none" opacity="0.6" />
      {/* sailboat */}
      <g transform="translate(150,70)">
        <polygon points="10,0 10,28 -8,28" fill="#ffffff" />
        <polygon points="12,4 26,28 12,28" fill="#e0e7ff" />
        <path d="M-14,30 L34,30 L28,38 L-8,38 Z" fill="#1e293b" />
        <line x1="10" y1="0" x2="10" y2="30" stroke="#334155" strokeWidth="1" />
      </g>
      {/* coins */}
      <g>
        <circle cx="30" cy="118" r="7" fill={`url(#${coin})`} />
        <circle cx="30" cy="118" r="7" fill="none" stroke="#b45309" strokeWidth="0.5" opacity="0.4" />
        <circle cx="290" cy="122" r="6" fill={`url(#${coin})`} />
        <circle cx="270" cy="115" r="4" fill={`url(#${coin})`} opacity="0.8" />
      </g>
      {!reducedMotion && (
        <animateTransform
          xlinkHref={`#boat-${uid}`}
          attributeName="transform"
          type="translate"
          values="150,70; 150,68; 150,70"
          dur="6s"
          repeatCount="indefinite"
        />
      )}
    </svg>
  );
}
