interface ProgressBarProps {
  progress: number;
  phase: "idle" | "uploading" | "converting" | "done" | "error";
}

const PHASE_COLOR: Record<ProgressBarProps["phase"], string> = {
  idle: "#E2E2E6",
  uploading: "#0066FF",
  converting: "#0066FF",
  done: "#22c55e",
  error: "#ef4444",
};

export default function ProgressBar({ progress, phase }: ProgressBarProps) {
  const isAnimating = phase === "uploading" || phase === "converting";

  return (
    <div
      className="relative h-[3px] bg-surface overflow-hidden w-full"
      style={{ borderRadius: "0px" }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute inset-y-0 left-0 transition-all"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          background: PHASE_COLOR[phase],
          transition: isAnimating ? "width 120ms linear" : "width 200ms ease",
        }}
      />
    </div>
  );
}
