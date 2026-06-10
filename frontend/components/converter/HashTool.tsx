"use client";

import { useState, useRef, useCallback } from "react";
import SparkMD5 from "spark-md5";
import type { ConverterTool } from "@/types/converter.types";

function nanoid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

type HashEntry = {
  id: string;
  filename: string;
  size: number;
  hash: string;
  status: "computing" | "done" | "error";
  error?: string;
};

async function computeHash(file: File, toolId: string): Promise<string> {
  const buffer = await file.arrayBuffer();

  if (toolId === "md5") {
    const spark = new SparkMD5.ArrayBuffer();
    spark.append(buffer);
    return spark.end();
  }

  const algoMap: Record<string, string> = {
    sha1: "SHA-1",
    sha256: "SHA-256",
    sha512: "SHA-512",
  };

  const digest = await crypto.subtle.digest(algoMap[toolId], buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HashTool({ tool }: { tool: ConverterTool }) {
  const [entries, setEntries] = useState<HashEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateEntry = useCallback((id: string, patch: Partial<HashEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const processFiles = useCallback(
    async (files: File[]) => {
      const newEntries: HashEntry[] = files.map((file) => ({
        id: nanoid(),
        filename: file.name,
        size: file.size,
        hash: "",
        status: "computing",
      }));
      setEntries((prev) => [...prev, ...newEntries]);

      for (let i = 0; i < newEntries.length; i++) {
        const entry = newEntries[i];
        try {
          const hash = await computeHash(files[i], tool.id);
          updateEntry(entry.id, { hash, status: "done" });
        } catch {
          updateEntry(entry.id, { status: "error", error: "Computation failed" });
        }
      }
    },
    [tool.id, updateEntry]
  );

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    processFiles(Array.from(fileList));
  };

  const copyHash = async (id: string, hash: string) => {
    await navigator.clipboard.writeText(hash);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className="relative cursor-pointer transition-all duration-150"
        style={{
          border: isDragOver ? "1.5px solid #0066FF" : "1.5px dashed #D0D0D5",
          borderRadius: "3px",
          background: isDragOver ? "rgba(0,102,255,0.04)" : "#fff",
          padding: "40px 24px",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Select files to hash"
        />
        <div className="flex flex-col items-center text-center gap-3">
          <div
            className="w-11 h-11 flex items-center justify-center"
            style={{ background: isDragOver ? "rgba(0,102,255,0.12)" : "#F5F5F7" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
              className={isDragOver ? "text-blue" : "text-muted"}
            >
              <path
                d="M3 5h2M3 10h2M3 15h2M7 5h10M7 10h10M7 15h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-medium text-ink mb-0.5">
              {isDragOver ? "Drop to hash" : "Drop any file"}
            </p>
            <p className="text-[12px] text-muted">
              Computed locally — file never leaves your browser
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            className="inline-flex items-center px-3.5 h-[32px] text-[12px] font-medium text-ink hover:border-blue hover:text-blue transition-colors bg-white"
            style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
          >
            Browse files
          </button>
        </div>
      </div>

      {/* Results */}
      {entries.length > 0 && (
        <div style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px", background: "#fff" }}>
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "0.5px solid #E2E2E6" }}
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
              {entries.length} file{entries.length !== 1 ? "s" : ""} · {tool.name}
            </p>
            <button
              onClick={() => setEntries([])}
              className="text-[11px] text-muted hover:text-ink transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: "#E2E2E6" }}>
            {entries.map((entry) => (
              <div key={entry.id} className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-[13px] font-medium text-ink truncate">{entry.filename}</p>
                    <p className="text-[11px] text-muted">{formatBytes(entry.size)}</p>
                  </div>
                  {entry.status === "computing" && (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted shrink-0">
                      <svg
                        className="animate-spin"
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle
                          cx="7"
                          cy="7"
                          r="5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeDasharray="20"
                          strokeDashoffset="10"
                        />
                      </svg>
                      Computing…
                    </div>
                  )}
                  {entry.status === "done" && (
                    <button
                      onClick={() => copyHash(entry.id, entry.hash)}
                      className="inline-flex items-center gap-1.5 px-2.5 h-[28px] text-[11px] font-medium transition-colors shrink-0"
                      style={{
                        border: "0.5px solid #E2E2E6",
                        borderRadius: "3px",
                        color: copied === entry.id ? "#0066FF" : "#6B6E7A",
                      }}
                    >
                      {copied === entry.id ? "Copied!" : "Copy"}
                    </button>
                  )}
                  {entry.status === "error" && (
                    <span className="text-[11px] text-red-500 shrink-0">{entry.error}</span>
                  )}
                </div>
                {entry.status === "done" && (
                  <code
                    className="block text-[12px] font-mono text-ink px-3 py-2 break-all"
                    style={{ background: "#F5F5F7", borderRadius: "3px" }}
                  >
                    {entry.hash}
                  </code>
                )}
                {entry.status === "computing" && (
                  <div
                    className="h-[34px] animate-pulse"
                    style={{ background: "#F5F5F7", borderRadius: "3px" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div
        className="px-4 py-3"
        style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px", background: "#fff" }}
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mb-1">
          About {tool.name}
        </p>
        <p className="text-[12px] text-muted leading-relaxed">{tool.description}</p>
      </div>
    </div>
  );
}
