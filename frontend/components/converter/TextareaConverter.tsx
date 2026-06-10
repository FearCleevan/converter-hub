"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ConverterTool } from "@/types/converter.types";
import ConversionOptions from "@/components/converter/ConversionOptions";

type TransformFn = (
  input: string,
  opts: Record<string, string | number | boolean>
) => string;

const BROWSER_TRANSFORMS: Record<string, TransformFn> = {
  "json-formatter": (input, opts) => {
    try {
      const parsed = JSON.parse(input);
      if (opts.minify) return JSON.stringify(parsed);
      return JSON.stringify(parsed, null, Number(opts.indent ?? 2));
    } catch (e) {
      throw new Error(`Invalid JSON: ${(e as Error).message}`);
    }
  },
  "base64-decode": (input) => {
    try {
      return decodeURIComponent(escape(atob(input.trim())));
    } catch {
      throw new Error("Invalid Base64 input");
    }
  },
  "html-formatter": (input) => {
    return input
      .replace(/>\s*</g, ">\n<")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  },
  "code-to-svg": (input) => input.trim(),
};

function buildDefaultOptions(tool: ConverterTool) {
  const d: Record<string, string | number | boolean> = {};
  tool.options?.forEach((o) => { d[o.key] = o.default; });
  return d;
}

export default function TextareaConverter({ tool }: { tool: ConverterTool }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [opts, setOpts] = useState(() => buildDefaultOptions(tool));
  const [copied, setCopied] = useState(false);
  const [showSvgPreview, setShowSvgPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSvgTool = tool.id === "code-to-svg";
  const hasBrowserTransform = tool.id in BROWSER_TRANSFORMS;

  const transform = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    const fn = BROWSER_TRANSFORMS[tool.id];
    if (!fn) {
      setOutput(
        `[Backend required — will process via API in Phase 6]\n\nInput received: ${input.length} character${input.length !== 1 ? "s" : ""}`
      );
      setError(null);
      return;
    }
    try {
      setOutput(fn(input, opts));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, opts, tool.id]);

  // Live transform for browser-side tools
  useEffect(() => {
    if (hasBrowserTransform) transform();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, opts, tool.id]);

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output.${tool.outputFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setInput(ev.target?.result as string ?? "");
    reader.readAsText(file);
    // reset so the same file can be re-uploaded
    e.target.value = "";
  };

  const hasOptions = (tool.options?.length ?? 0) > 0;

  const svgDataUrl = isSvgTool && output
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(output)}`
    : null;

  const placeholderMap: Record<string, string> = {
    "json-formatter": '{\n  "key": "value"\n}',
    "base64-decode": "SGVsbG8gV29ybGQ=",
    "html-formatter": "<html><body><p>Hello</p></body></html>",
    "code-to-svg": '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">\n  <circle cx="50" cy="50" r="40" fill="#0066FF"/>\n</svg>',
    "html-to-pdf": "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello</h1>\n</body>\n</html>",
  };

  return (
    <div className="space-y-4">
      {/* Options panel */}
      {hasOptions && (
        <ConversionOptions
          options={tool.options!}
          values={opts}
          onChange={(k, v) => setOpts((p) => ({ ...p, [k]: v }))}
        />
      )}

      {/* Editor */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px", background: "#fff" }}
      >
        {/* Input pane */}
        <div style={{ borderRight: "0.5px solid #E2E2E6" }}>
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: "0.5px solid #E2E2E6" }}
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
              Input · .{tool.inputFormats[0]}
            </span>
            <label className="cursor-pointer text-[11px] text-muted hover:text-ink transition-colors">
              Upload file
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={tool.inputFormats.filter(f => f !== "*").map((f) => `.${f}`).join(",")}
                onChange={handleFileUpload}
              />
            </label>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholderMap[tool.id] ?? `Paste your .${tool.inputFormats[0]} here…`}
            spellCheck={false}
            className="w-full resize-none text-[13px] font-mono text-ink placeholder:text-muted/50 outline-none p-4"
            style={{ minHeight: "320px", background: "transparent" }}
          />
        </div>

        {/* Output pane */}
        <div className="flex flex-col">
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: "0.5px solid #E2E2E6" }}
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
              Output · .{tool.outputFormat}
            </span>
            <div className="flex items-center gap-3">
              {isSvgTool && output && (
                <button
                  onClick={() => setShowSvgPreview((p) => !p)}
                  className="text-[11px] text-muted hover:text-ink transition-colors"
                >
                  {showSvgPreview ? "View code" : "Preview"}
                </button>
              )}
              {output && !error && (
                <>
                  <button
                    onClick={copyOutput}
                    className="text-[11px] text-muted hover:text-ink transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={downloadOutput}
                    className="text-[11px] font-medium text-blue hover:text-blue-dark transition-colors"
                  >
                    Download
                  </button>
                </>
              )}
            </div>
          </div>

          {isSvgTool && showSvgPreview && svgDataUrl ? (
            <div
              className="flex-1 flex items-center justify-center p-6"
              style={{ minHeight: "320px", background: "#F5F5F7" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={svgDataUrl}
                alt="SVG preview"
                className="max-w-full max-h-[280px] object-contain"
              />
            </div>
          ) : (
            <textarea
              value={error ? `Error: ${error}` : output}
              readOnly
              placeholder="Output will appear here…"
              spellCheck={false}
              className="flex-1 w-full resize-none text-[13px] font-mono outline-none p-4"
              style={{
                minHeight: "320px",
                background: "transparent",
                color: error ? "#ef4444" : "#0E0F11",
              }}
            />
          )}

          {/* Manual convert button for backend-bound tools */}
          {!hasBrowserTransform && (
            <div className="px-4 pb-4 pt-2">
              <button
                onClick={transform}
                disabled={!input.trim()}
                className="w-full h-[36px] bg-blue text-white text-[12px] font-medium hover:bg-blue-dark disabled:opacity-40 disabled:pointer-events-none transition-colors"
                style={{ borderRadius: "3px" }}
              >
                Convert
              </button>
            </div>
          )}
        </div>
      </div>

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
