interface SectionEyebrowProps {
  label: string;
  className?: string;
}

export default function SectionEyebrow({ label, className = "" }: SectionEyebrowProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 16px blue horizontal rule */}
      <div className="w-4 h-[1.5px] bg-blue shrink-0" aria-hidden="true" />
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        {label}
      </span>
    </div>
  );
}
