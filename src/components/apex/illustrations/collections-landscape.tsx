import { useId } from "react";
import type { ApexIllustrationProps } from "./types";
import { a11yProps } from "./types";

export function CollectionsLandscape({
  className,
  title = "Collections landscape",
  decorative = true,
  width,
  height,
}: ApexIllustrationProps) {
  const uid = useId().replace(/:/g, "");
  const river = `apex-coll-river-${uid}`;
  const hill = `apex-coll-hill-${uid}`;
  const doc = `apex-coll-doc-${uid}`;
  const titleId = `apex-coll-title-${uid}`;
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
        <linearGradient id={river} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="60%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id={hill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id={doc} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      {/* hills */}
      <path
        d="M0,90 Q80,50 160,80 T320,70 L320,140 L0,140 Z"
        fill={`url(#${hill})`}
        opacity="0.7"
      />
      <path d="M0,105 Q100,80 200,95 T320,90 L320,140 L0,140 Z" fill="#059669" opacity="0.45" />
      {/* river */}
      <path
        d="M-10,120 Q80,100 160,115 T330,105"
        stroke={`url(#${river})`}
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      {/* small bridge */}
      <g transform="translate(200,108)">
        <path d="M-14,0 Q0,-8 14,0" fill="none" stroke="#78350f" strokeWidth="2" />
        <line x1="-14" y1="0" x2="-14" y2="6" stroke="#78350f" strokeWidth="1.5" />
        <line x1="14" y1="0" x2="14" y2="6" stroke="#78350f" strokeWidth="1.5" />
      </g>
      {/* floating documents */}
      <g>
        <g transform="translate(60,102) rotate(-8)">
          <rect
            x="-8"
            y="-6"
            width="16"
            height="12"
            rx="1.5"
            fill={`url(#${doc})`}
            stroke="#0891b2"
            strokeWidth="0.6"
          />
          <line x1="-5" y1="-3" x2="5" y2="-3" stroke="#0891b2" strokeWidth="0.6" />
          <line x1="-5" y1="0" x2="3" y2="0" stroke="#0891b2" strokeWidth="0.6" />
        </g>
        <g transform="translate(130,116) rotate(6)">
          <rect
            x="-8"
            y="-6"
            width="16"
            height="12"
            rx="1.5"
            fill={`url(#${doc})`}
            stroke="#059669"
            strokeWidth="0.6"
          />
          <circle cx="0" cy="0" r="2" fill="#34d399" />
        </g>
        <g transform="translate(260,102) rotate(-4)">
          <rect
            x="-8"
            y="-6"
            width="16"
            height="12"
            rx="1.5"
            fill={`url(#${doc})`}
            stroke="#0891b2"
            strokeWidth="0.6"
          />
          <line x1="-5" y1="-3" x2="5" y2="-3" stroke="#0891b2" strokeWidth="0.6" />
        </g>
      </g>
    </svg>
  );
}
