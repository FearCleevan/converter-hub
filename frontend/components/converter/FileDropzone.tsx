"use client";

import { useState, useRef } from "react";
import type { ConverterTool } from "@/types/converter.types";

interface FileDropzoneProps {
  tool: ConverterTool;
  onFilesAdded: (files: File[]) => void;
}

export default function FileDropzone({ tool, onFilesAdded }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isUrlTool = tool.inputMode === "url";
  const acceptAttr = tool.inputFormats
    .filter((f) => f !== "*" && f !== "url")
    .map((f) => `.${f}`)
    .join(",");

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFilesAdded(Array.from(files));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleUrlSubmit = () => {
    if (!urlValue.trim()) return;
    // Create a synthetic "file" entry for URL mode — ConverterShell handles the URL path
    const syntheticFile = new File([""], urlValue.trim(), { type: "text/uri-list" });
    onFilesAdded([syntheticFile]);
    setUrlValue("");
  };

  // URL-only tool: show URL input directly
  if (isUrlTool) {
    return (
      <div
        className="p-5"
        style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px", background: "#fff" }}
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mb-3">
          Paste URL
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            placeholder="https://youtube.com/watch?v=… or direct file URL"
            autoFocus
            className="flex-1 px-3 h-[38px] text-[13px] text-ink placeholder:text-muted outline-none focus:border-blue transition-colors bg-surface"
            style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!urlValue.trim()}
            className="px-4 h-[38px] bg-blue text-white text-[12px] font-medium hover:bg-blue-dark disabled:opacity-40 disabled:pointer-events-none transition-colors"
            style={{ borderRadius: "3px" }}
          >
            Convert
          </button>
        </div>
        <p className="text-[11px] text-muted mt-2">
          YouTube, Vimeo, Dailymotion, Twitter/X, and direct file links supported
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !urlMode && inputRef.current?.click()}
        className="relative transition-all duration-150 cursor-pointer"
        style={{
          border: isDragOver
            ? "1.5px solid #0066FF"
            : "1.5px dashed #D0D0D5",
          borderRadius: "3px",
          background: isDragOver ? "rgba(0,102,255,0.04)" : "#fff",
          padding: "40px 24px",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptAttr || undefined}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Select files to convert"
        />

        {!urlMode ? (
          <div className="flex flex-col items-center text-center gap-3">
            {/* Upload icon */}
            <div
              className="w-11 h-11 flex items-center justify-center"
              style={{
                background: isDragOver ? "rgba(0,102,255,0.12)" : "#F5F5F7",
                borderRadius: "0px",
              }}
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
                  d="M10 2v11M4 7l6-5 6 5M2 16h16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            </div>

            <div>
              <p className="text-[14px] font-medium text-ink mb-0.5">
                {isDragOver ? "Drop to convert" : "Drop files here"}
              </p>
              <p className="text-[12px] text-muted">
                or click to browse · multiple files supported
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center px-3.5 h-[32px] text-[12px] font-medium text-ink hover:border-blue hover:text-blue transition-colors bg-white"
                style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
              >
                Browse files
              </button>
              {tool.inputMode === "file-and-url" && (
                <button
                  onClick={() => setUrlMode(true)}
                  className="inline-flex items-center px-3.5 h-[32px] text-[12px] font-medium text-ink hover:border-blue hover:text-blue transition-colors bg-white"
                  style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
                >
                  Paste URL
                </button>
              )}
            </div>
          </div>
        ) : (
          /* URL paste mode (for file-and-url tools) */
          <div
            className="flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[12px] text-muted">Paste a direct file URL or video link</p>
            <div className="flex gap-2 w-full max-w-[480px]">
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                placeholder="https://…"
                autoFocus
                className="flex-1 px-3 h-[36px] text-[13px] text-ink placeholder:text-muted outline-none focus:border-blue bg-surface"
                style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
              />
              <button
                onClick={handleUrlSubmit}
                disabled={!urlValue.trim()}
                className="px-3.5 h-[36px] bg-blue text-white text-[12px] font-medium hover:bg-blue-dark disabled:opacity-40 transition-colors"
                style={{ borderRadius: "3px" }}
              >
                Add
              </button>
            </div>
            <button
              onClick={() => { setUrlMode(false); setUrlValue(""); }}
              className="text-[11px] text-muted hover:text-ink transition-colors"
            >
              ← Back to file upload
            </button>
          </div>
        )}
      </div>

      {/* Accepted formats */}
      {tool.inputFormats.length > 0 && tool.inputFormats[0] !== "*" && (
        <p className="text-[11px] text-muted">
          Accepts:{" "}
          {tool.inputFormats.map((f) => (
            <span
              key={f}
              className="inline-flex items-center px-1.5 py-px text-[10px] font-medium text-muted mr-1"
              style={{ background: "#F5F5F7", borderRadius: "3px" }}
            >
              .{f.toUpperCase()}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
