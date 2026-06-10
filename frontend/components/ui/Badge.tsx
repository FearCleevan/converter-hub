import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "category" | "format" | "status";
  className?: string;
}

const variantStyles = {
  /** Category count badge — blue-dim bg, blue-dark text */
  category: "bg-blue-dim text-blue-dark",
  /** Format tag — dark pill, white text */
  format: "bg-ink text-white",
  /** Neutral status label */
  status: "bg-surface text-muted border border-border",
};

export default function Badge({ children, variant = "category", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center",
        "text-[11px] font-medium uppercase tracking-[0.06em]",
        "px-2 py-0.5 rounded-[3px]",
        variantStyles[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
