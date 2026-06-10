import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  /** Full-width button */
  block?: boolean;
  /** Show a loading spinner and disable interaction */
  loading?: boolean;
}

const variantStyles = {
  primary:
    "bg-blue text-white border-transparent hover:bg-blue-dark active:bg-blue-dark",
  ghost:
    "bg-transparent text-text border-border hover:border-blue hover:text-blue",
  danger:
    "bg-transparent text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400",
};

const sizeStyles = {
  sm: "h-[32px] px-3.5 text-[12px] font-medium gap-1.5",
  md: "h-[38px] px-4 text-[13px] font-medium gap-2",
  lg: "h-[44px] px-5 text-[14px] font-medium gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  block = false,
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center border",
        "rounded-[3px]",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-1",
        "disabled:opacity-40 disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        block ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin w-3.5 h-3.5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
