export interface ApexIllustrationProps {
  className?: string;
  title?: string;
  decorative?: boolean;
  reducedMotion?: boolean;
  variant?: "default" | "soft" | "compact";
  width?: number | string;
  height?: number | string;
}

export function a11yProps(decorative: boolean, title?: string, titleId?: string) {
  if (decorative) {
    return { "aria-hidden": true as const, focusable: "false" as const, role: undefined };
  }
  return {
    role: "img" as const,
    "aria-labelledby": title ? titleId : undefined,
    focusable: "false" as const,
  };
}
