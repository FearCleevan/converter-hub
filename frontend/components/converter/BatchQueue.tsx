"use client";

import type { QueueFile } from "@/types/converter.types";
import CategoryIcon from "@/components/converter/CategoryIcon";
import ProgressBar from "@/components/converter/ProgressBar";
import type { ConverterCategory } from "@/types/converter.types";

interface BatchQueueProps {
  items: QueueFile[];
  outputFormat: string;
  category: ConverterCategory;
  onClear: () => void;
  onClearItem: (id: string) => void;
  onRetry: (id: string) => void;
}

const STATUS_LABEL: Record<QueueFile["status"], string> = {
  idle: "Queued",
  uploading: "Uploading…",
  converting: "Converting…",
  done: "Done",
  error: "Error",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function BatchQueue({
  items,
  outputFormat,
  category,
  onClear,
  onClearItem,
  onRetry,
}: BatchQueueProps) {
  const doneItems = items.filter((i) => i.status === "done");
  const totalSize = doneItems.reduce((acc, i) => acc + (i.outputSize ?? 0), 0);

  if (items.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-10 text-center"
        style={{ border: "0.5px dashed #E2E2E6", borderRadius: "3px" }}
      >
        <div
          className="w-10 h-10 flex items-center justify-center text-muted mb-3"
          style={{ background: "#F5F5F7" }}
        >
          <CategoryIcon category={category} size={18} />
        </div>
        <p className="text-[13px] font-medium text-ink mb-1">Queue is empty</p>
        <p className="text-[12px] text-muted">Add files to start converting</p>
      </div>
    );
  }

  return (
    <div
      className="bg-white overflow-hidden"
      style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
    >
      {/* Header — 0px radius admin aesthetic */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: "0.5px solid #E2E2E6", background: "#F5F5F7" }}
      >
        <span className="text-[11px] font-medium text-muted uppercase tracking-[0.06em]">
          {items.length} file{items.length !== 1 ? "s" : ""} · {doneItems.length} done
        </span>
        <button
          onClick={onClear}
          className="text-[11px] text-muted hover:text-ink transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* File rows */}
      <div className="divide-y divide-border max-h-[460px] overflow-y-auto">
        {items.map((item) => (
          <FileRow
            key={item.id}
            item={item}
            outputFormat={outputFormat}
            category={category}
            onClearItem={onClearItem}
            onRetry={onRetry}
          />
        ))}
      </div>

      {/* Footer */}
      {doneItems.length > 0 && (
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderTop: "0.5px solid #E2E2E6", background: "#F5F5F7" }}
        >
          <span className="text-[11px] text-muted">
            {doneItems.length} of {items.length} ready · {formatBytes(totalSize)}
          </span>
          <button
            onClick={() => {
              doneItems.forEach((item) => {
                if (item.blobUrl && item.blobUrl !== "#mock") {
                  const a = document.createElement("a");
                  a.href = item.blobUrl;
                  a.download = item.outputFilename ?? "converted";
                  a.click();
                }
              });
            }}
            className="text-[11px] font-medium text-blue hover:text-blue-dark transition-colors"
          >
            Download all as .zip
          </button>
        </div>
      )}
    </div>
  );
}

function FileRow({
  item,
  outputFormat,
  category,
  onClearItem,
  onRetry,
}: {
  item: QueueFile;
  outputFormat: string;
  category: ConverterCategory;
  onClearItem: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const pct = Math.round(item.progress);
  const statusLabel = STATUS_LABEL[item.status];
  const statusColor =
    item.status === "done"
      ? "#22c55e"
      : item.status === "error"
      ? "#ef4444"
      : item.status === "idle"
      ? "#6B6E7A"
      : "#0066FF";

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Category icon */}
      <div
        className="w-8 h-8 flex items-center justify-center shrink-0 text-muted"
        style={{ background: "#F5F5F7" }}
      >
        <CategoryIcon category={category} size={14} />
      </div>

      {/* Info + progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className="text-[12px] font-medium text-ink truncate"
            title={item.file.name}
          >
            {item.file.name}
          </span>
          <span className="text-[10px] text-muted shrink-0">
            → .{outputFormat.toUpperCase()}
          </span>
        </div>

        <ProgressBar progress={item.progress} phase={item.status} />

        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted">
            {formatBytes(item.file.size)}
            {item.status === "uploading" || item.status === "converting"
              ? ` · ${pct}%`
              : ""}
          </span>
          <span className="text-[10px] font-medium" style={{ color: statusColor }}>
            {item.status === "error" ? (item.error ?? "Failed") : statusLabel}
          </span>
        </div>
      </div>

      {/* Action button */}
      <div className="shrink-0">
        {item.status === "done" && item.blobUrl && item.blobUrl !== "#mock" ? (
          <a
            href={item.blobUrl}
            download={item.outputFilename}
            className="w-7 h-7 flex items-center justify-center hover:bg-blue-dim transition-colors"
            style={{ border: "0.5px solid #E2E2E6" }}
            aria-label={`Download ${item.outputFilename}`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v7M3 6l3 3 3-3M2 11h8" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </a>
        ) : item.status === "done" ? (
          /* Mock mode — no real blob */
          <div
            className="w-7 h-7 flex items-center justify-center"
            style={{ border: "0.5px solid #E2E2E6" }}
            title="Mock mode — no real file"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v7M3 6l3 3 3-3M2 11h8" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </div>
        ) : item.status === "error" ? (
          <button
            onClick={() => onRetry(item.id)}
            className="px-2 h-7 text-[10px] font-medium text-blue hover:text-blue-dark transition-colors"
            style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
          >
            Retry
          </button>
        ) : item.status === "idle" ? (
          <button
            onClick={() => onClearItem(item.id)}
            className="w-7 h-7 flex items-center justify-center hover:bg-surface transition-colors text-muted hover:text-ink"
            style={{ border: "0.5px solid #E2E2E6" }}
            aria-label="Remove"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
            </svg>
          </button>
        ) : (
          /* uploading / converting — spinner */
          <div className="w-7 h-7 flex items-center justify-center">
            <svg className="animate-spin text-blue" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" className="opacity-80" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
