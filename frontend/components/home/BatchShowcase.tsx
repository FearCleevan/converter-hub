import PageWrapper from "@/components/layout/PageWrapper";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import CategoryIcon from "@/components/converter/CategoryIcon";
import type { ConverterCategory } from "@/types/converter.types";

const MOCK_FILES = [
  {
    name: "presentation-final.pptx",
    size: "4.2 MB",
    output: "pdf",
    status: "done" as const,
    progress: 100,
  },
  {
    name: "vacation-photo.heic",
    size: "3.8 MB",
    output: "jpg",
    status: "converting" as const,
    progress: 67,
  },
  {
    name: "podcast-episode-12.wav",
    size: "142 MB",
    output: "mp3",
    status: "uploading" as const,
    progress: 32,
  },
  {
    name: "annual-report.docx",
    size: "1.1 MB",
    output: "pdf",
    status: "idle" as const,
    progress: 0,
  },
];

const STATUS_COLORS = {
  done: { bar: "#22c55e", label: "Done" },
  converting: { bar: "#0066FF", label: "Converting..." },
  uploading: { bar: "#0066FF", label: "Uploading..." },
  idle: { bar: "#E2E2E6", label: "Queued" },
};

const EXT_TO_CATEGORY: Record<string, ConverterCategory> = {
  pptx: "presentation",
  heic: "image",
  wav: "audio",
  docx: "document",
};

export default function BatchShowcase() {
  return (
    <section className="bg-surface py-16">
      <PageWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — text */}
          <div>
            <SectionEyebrow label="Batch Mode" className="mb-4" />
            <h2 className="text-[26px] sm:text-[32px] font-medium text-ink leading-tight mb-4">
              Convert 50 files<br />at the same time
            </h2>
            <p className="text-[14px] text-muted leading-relaxed mb-6 max-w-[400px]">
              Drop an entire folder. Every file is queued, processed, and tracked
              individually. One click to download everything as a ZIP when done.
            </p>

            <ul className="space-y-3">
              {[
                "Per-file progress tracking",
                "Retry individual failed files",
                "Download all as a single ZIP",
                "Zero page reloads — all in browser",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[13px] text-muted">
                  <div className="w-4 h-4 flex items-center justify-center bg-blue-dim shrink-0" style={{ borderRadius: "3px" }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#003DB5" strokeWidth="1.5" strokeLinecap="square" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — static batch queue mockup */}
          <div
            className="bg-white overflow-hidden"
            style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
          >
            {/* Queue header — 0px radius (admin aesthetic) */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{
                borderBottom: "0.5px solid #E2E2E6",
                background: "#F5F5F7",
              }}
            >
              <span className="text-[11px] font-medium text-muted uppercase tracking-[0.06em]">
                4 files · 1 done
              </span>
              <button className="text-[11px] text-muted hover:text-text transition-colors">
                Clear all
              </button>
            </div>

            {/* File rows */}
            <div className="divide-y" style={{ borderColor: "#E2E2E6" }}>
              {MOCK_FILES.map((f) => {
                const ext = f.name.split(".").pop() ?? "";
                const status = STATUS_COLORS[f.status];
                return (
                  <div key={f.name} className="flex items-center gap-3 px-4 py-3">
                    {/* Icon */}
                    <div
                      className="w-10 h-10 flex items-center justify-center shrink-0 text-muted"
                    >
                      <CategoryIcon
                        category={EXT_TO_CATEGORY[ext] ?? "document"}
                        size={14}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[12px] font-medium text-ink truncate">{f.name}</span>
                        <span className="text-[10px] text-muted shrink-0">→ .{f.output.toUpperCase()}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="relative h-1 bg-surface overflow-hidden" style={{ borderRadius: "0px" }}>
                        <div
                          className="absolute inset-y-0 left-0 transition-all duration-500"
                          style={{ width: `${f.progress}%`, background: status.bar }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-muted">{f.size}</span>
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: f.status === "done" ? "#22c55e" : f.status === "idle" ? "#6B6E7A" : "#0066FF" }}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Download button (done only) */}
                    {f.status === "done" && (
                      <button
                        className="shrink-0 w-7 h-7 flex items-center justify-center hover:bg-blue-dim transition-colors"
                        style={{ border: "0.5px solid #E2E2E6" }}
                        aria-label="Download"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M6 1v7M3 6l3 3 3-3M2 11h8" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="square" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Queue footer */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{
                borderTop: "0.5px solid #E2E2E6",
                background: "#F5F5F7",
              }}
            >
              <span className="text-[11px] text-muted">1 of 4 ready · 4.2 MB total</span>
              <button
                className="text-[11px] font-medium text-blue hover:text-blue-dark transition-colors"
              >
                Download all as .zip
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>
    </section>
  );
}
