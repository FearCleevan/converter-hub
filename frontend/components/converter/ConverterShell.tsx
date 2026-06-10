"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import type { ConverterTool, QueueFile } from "@/types/converter.types";
import FileDropzone from "@/components/converter/FileDropzone";
import BatchQueue from "@/components/converter/BatchQueue";
import ConversionOptions from "@/components/converter/ConversionOptions";
import CategoryIcon from "@/components/converter/CategoryIcon";
import HashTool from "@/components/converter/HashTool";
import TextareaConverter from "@/components/converter/TextareaConverter";
import MarkdownPreview from "@/components/converter/MarkdownPreview";
import ArchiveInspect from "@/components/converter/ArchiveInspect";
import { mockConvert } from "@/lib/mockConvert";

interface ConverterShellProps {
  tool: ConverterTool;
  categoryLabel: string;
}

function buildDefaultOptions(tool: ConverterTool): Record<string, string | number | boolean> {
  const defaults: Record<string, string | number | boolean> = {};
  tool.options?.forEach((opt) => {
    defaults[opt.key] = opt.default;
  });
  return defaults;
}

function nanoid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function FileQueueShell({ tool }: ConverterShellProps) {
  const [queue, setQueue] = useState<QueueFile[]>([]);
  const [optionValues, setOptionValues] = useState(() => buildDefaultOptions(tool));
  const activeRef = useRef<Set<string>>(new Set());

  const updateItem = useCallback((id: string, patch: Partial<QueueFile>) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const startConversion = useCallback(
    async (item: QueueFile) => {
      activeRef.current.add(item.id);

      try {
        const result = await mockConvert(
          item.file,
          tool.outputFormat,
          (phase, pct) => {
            if (!activeRef.current.has(item.id)) return;
            updateItem(item.id, {
              status: phase === "upload" ? "uploading" : "converting",
              progress: pct,
            });
          }
        );

        if (!activeRef.current.has(item.id)) return;

        updateItem(item.id, {
          status: "done",
          progress: 100,
          outputFilename: result.filename,
          outputSize: result.size,
          blobUrl: result.blobUrl,
        });
      } catch {
        if (!activeRef.current.has(item.id)) return;
        updateItem(item.id, { status: "error", progress: 0, error: "Conversion failed" });
      } finally {
        activeRef.current.delete(item.id);
      }
    },
    [tool.outputFormat, updateItem]
  );

  const handleFilesAdded = useCallback(
    (files: File[]) => {
      const newItems: QueueFile[] = files.map((file) => ({
        id: nanoid(),
        file,
        status: "idle",
        progress: 0,
      }));
      setQueue((prev) => [...prev, ...newItems]);
      newItems.forEach((item) => startConversion(item));
    },
    [startConversion]
  );

  const handleRetry = useCallback(
    (id: string) => {
      setQueue((prev) => {
        const item = prev.find((i) => i.id === id);
        if (!item) return prev;
        const reset = { ...item, status: "idle" as const, progress: 0, error: undefined };
        startConversion(reset);
        return prev.map((i) => (i.id === id ? reset : i));
      });
    },
    [startConversion]
  );

  const handleClearItem = useCallback((id: string) => {
    activeRef.current.delete(id);
    setQueue((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    activeRef.current.clear();
    setQueue([]);
  }, []);

  const handleOptionChange = useCallback((key: string, value: string | number | boolean) => {
    setOptionValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const hasOptions = (tool.options?.length ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-4">
        <FileDropzone tool={tool} onFilesAdded={handleFilesAdded} />
        {hasOptions && (
          <ConversionOptions
            options={tool.options!}
            values={optionValues}
            onChange={handleOptionChange}
          />
        )}
        <div
          className="px-4 py-3"
          style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px", background: "#fff" }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mb-2">
            About {tool.name}
          </p>
          <p className="text-[12px] text-muted leading-relaxed">{tool.description}</p>
          {tool.inputMode === "url" && (
            <p className="text-[12px] text-muted mt-1">
              Powered by yt-dlp — supports YouTube, Vimeo, Twitter/X, and 1000+ sites.
            </p>
          )}
        </div>
      </div>

      <div className="lg:sticky lg:top-4 self-start">
        <BatchQueue
          items={queue}
          outputFormat={tool.outputFormat}
          category={tool.category}
          onClear={handleClearAll}
          onClearItem={handleClearItem}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
}

export default function ConverterShell({ tool, categoryLabel }: ConverterShellProps) {
  const isHashTool = tool.category === "hash";
  const isMarkdownPreview = tool.id === "markdown-preview";
  const isArchiveInspect = tool.id === "archive-inspect";
  const isTextMode = tool.inputMode === "text";

  const renderBody = () => {
    if (isHashTool) return <HashTool tool={tool} />;
    if (isMarkdownPreview) return <MarkdownPreview tool={tool} />;
    if (isArchiveInspect) return <ArchiveInspect tool={tool} />;
    if (isTextMode) return <TextareaConverter tool={tool} />;
    return <FileQueueShell tool={tool} categoryLabel={categoryLabel} />;
  };

  const showFormatBadges = !isHashTool && !isMarkdownPreview;

  return (
    <div className="bg-surface min-h-screen">
      {/* Dark header */}
      <div className="bg-ink">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav
            className="flex items-center gap-1.5 text-[12px] text-white/35 mb-5"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white/60 transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link
              href={`/${tool.category}`}
              className="hover:text-white/60 transition-colors capitalize"
            >
              {categoryLabel}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/55">{tool.name}</span>
          </nav>

          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0 text-blue mt-0.5"
              style={{ background: "rgba(0,102,255,0.12)" }}
            >
              <CategoryIcon category={tool.category} size={20} />
            </div>

            <div>
              <h1 className="font-display text-[40px] leading-none tracking-[-0.5px] text-white mb-1.5">
                {tool.name}
              </h1>
              <p className="text-[14px] text-white/45 max-w-[520px]">{tool.description}</p>

              {showFormatBadges && (
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className="inline-flex items-center px-2 py-1 text-[11px] font-mono text-white/70"
                    style={{ background: "rgba(255,255,255,0.08)", borderRadius: "0px" }}
                  >
                    .{tool.inputFormats[0].toUpperCase()}
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 8h12M10 4l4 4-4 4"
                      stroke="#0066FF"
                      strokeWidth="1.5"
                      strokeLinecap="square"
                    />
                  </svg>
                  <span
                    className="inline-flex items-center px-2 py-1 text-[11px] font-mono text-blue"
                    style={{ background: "rgba(0,102,255,0.15)", borderRadius: "0px" }}
                  >
                    .{tool.outputFormat.toUpperCase()}
                  </span>
                </div>
              )}

              {isHashTool && (
                <div className="mt-3">
                  <span
                    className="inline-flex items-center px-2 py-1 text-[11px] font-medium"
                    style={{
                      background: "rgba(0,102,255,0.15)",
                      color: "#99BBFF",
                      borderRadius: "0px",
                    }}
                  >
                    Browser-only · Zero upload
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main body */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderBody()}
      </div>
    </div>
  );
}
