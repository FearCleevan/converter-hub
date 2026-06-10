"use client";

import { useState, useRef } from "react";
import JSZip from "jszip";
import type { ConverterTool } from "@/types/converter.types";

type ArchiveEntry = {
  name: string;
  isDirectory: boolean;
  uncompressedSize?: number;
  compressedSize?: number;
};

type Status = "idle" | "loading" | "done" | "error";

function formatBytes(b: number | undefined) {
  if (b === undefined) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function fileExt(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toUpperCase() : "FILE";
}

export default function ArchiveInspect({ tool }: { tool: ConverterTool }) {
  const [status, setStatus] = useState<Status>("idle");
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [archiveName, setArchiveName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setStatus("loading");
    setError(null);
    setArchiveName(file.name);

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setStatus("error");
      setError(
        "Only ZIP archives are supported in the browser. TAR and 7Z support requires the backend (Phase 6)."
      );
      return;
    }

    try {
      const zip = await new JSZip().loadAsync(file);
      const result: ArchiveEntry[] = [];

      zip.forEach((relativePath, zipEntry) => {
        result.push({
          name: relativePath,
          isDirectory: zipEntry.dir,
          uncompressedSize: (zipEntry as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize,
          compressedSize: (zipEntry as unknown as { _data?: { compressedSize?: number } })._data?.compressedSize,
        });
      });

      result.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      setEntries(result);
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Failed to read archive. The file may be corrupted or password-protected.");
    }
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    processFile(fileList[0]);
  };

  const reset = () => {
    setStatus("idle");
    setEntries([]);
    setArchiveName(null);
    setError(null);
  };

  const fileCount = entries.filter((e) => !e.isDirectory).length;
  const folderCount = entries.filter((e) => e.isDirectory).length;

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
          accept=".zip,.tar,.gz,.7z"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Select archive file"
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
              <rect x="3" y="3" width="14" height="14" rx="0" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 3v14M7 7h6M7 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-medium text-ink mb-0.5">
              {isDragOver ? "Drop archive" : "Drop archive file"}
            </p>
            <p className="text-[12px] text-muted">
              ZIP (browser) · TAR / 7Z (Phase 6)
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
            className="inline-flex items-center px-3.5 h-[32px] text-[12px] font-medium text-ink hover:border-blue hover:text-blue transition-colors bg-white"
            style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
          >
            Browse
          </button>
        </div>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <div
          className="flex items-center justify-center gap-2 py-8 text-[12px] text-muted"
          style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px", background: "#fff" }}
        >
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
          Reading archive…
        </div>
      )}

      {/* Error */}
      {status === "error" && error && (
        <div
          className="px-4 py-3"
          style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px", background: "#fff" }}
        >
          <p className="text-[12px] text-red-500">{error}</p>
          <button
            onClick={reset}
            className="mt-2 text-[11px] text-muted hover:text-ink transition-colors"
          >
            Try another file
          </button>
        </div>
      )}

      {/* Results */}
      {status === "done" && entries.length > 0 && (
        <div style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px", background: "#fff" }}>
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: "0.5px solid #E2E2E6" }}
          >
            <div>
              <p className="text-[13px] font-medium text-ink">{archiveName}</p>
              <p className="text-[11px] text-muted">
                {fileCount} file{fileCount !== 1 ? "s" : ""}
                {folderCount > 0 ? ` · ${folderCount} folder${folderCount !== 1 ? "s" : ""}` : ""}
              </p>
            </div>
            <button
              onClick={reset}
              className="text-[11px] text-muted hover:text-ink transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="overflow-auto" style={{ maxHeight: "420px" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "0.5px solid #E2E2E6", background: "#F9F9FB" }}>
                  <th className="text-left px-4 py-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted w-full">
                    Name
                  </th>
                  <th className="text-left px-4 py-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted whitespace-nowrap">
                    Type
                  </th>
                  <th className="text-right px-4 py-2 text-[10px] font-medium uppercase tracking-[0.08em] text-muted whitespace-nowrap">
                    Size
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={i}
                    style={{ borderBottom: "0.5px solid #F0F0F2" }}
                    className="hover:bg-surface transition-colors"
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0" aria-hidden="true">
                          {entry.isDirectory ? (
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                              <path
                                d="M1 3h4l1.5 2H12v6H1V3z"
                                fill="#E8F0FF"
                                stroke="#003DB5"
                                strokeWidth="0.75"
                              />
                            </svg>
                          ) : (
                            <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
                              <path
                                d="M1 1h6l3 3v8H1V1z"
                                fill="#F5F5F7"
                                stroke="#6B6E7A"
                                strokeWidth="0.75"
                              />
                            </svg>
                          )}
                        </span>
                        <span
                          className="text-[12px] font-mono text-ink truncate"
                          style={{ maxWidth: "360px" }}
                        >
                          {entry.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-[11px] text-muted whitespace-nowrap">
                      {entry.isDirectory ? "folder" : fileExt(entry.name)}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-muted text-right whitespace-nowrap font-mono">
                      {entry.isDirectory ? "—" : formatBytes(entry.uncompressedSize)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
