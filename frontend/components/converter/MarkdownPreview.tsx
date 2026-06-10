"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ConverterTool } from "@/types/converter.types";

const DEFAULT_CONTENT = `# Markdown Previewer

Type here and see it rendered **live** on the right.

## Formatting

**Bold**, *italic*, ~~strikethrough~~, \`inline code\`

## Lists

- Item one
- Item two
  - Nested item

1. First
2. Second

## Code Block

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet("ConvertHub"));
\`\`\`

## Table

| Format | Browser | Backend |
|--------|---------|---------|
| MD5    | ✓       | —       |
| SHA-256 | ✓      | —       |
| ZIP → MP4 | —   | ✓       |

> Blockquotes work too.
`;

export default function MarkdownPreview({ tool }: { tool: ConverterTool }) {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setContent(ev.target?.result as string ?? "");
    reader.readAsText(file);
    e.target.value = "";
  };

  const copyHtml = async () => {
    const html = outputRef.current?.innerHTML ?? "";
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadHtml = () => {
    const inner = outputRef.current?.innerHTML ?? "";
    const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Markdown Export</title>
<style>
body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; line-height: 1.65; color: #0E0F11; }
h1,h2,h3 { font-weight: 600; margin-top: 1.5em; }
code { background: #F5F5F7; padding: 2px 5px; border-radius: 3px; font-size: 0.875em; }
pre { background: #F5F5F7; padding: 16px; border-radius: 3px; overflow-x: auto; }
pre code { background: none; padding: 0; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #E2E2E6; padding: 8px 12px; text-align: left; }
th { background: #F5F5F7; font-weight: 600; }
blockquote { border-left: 3px solid #0066FF; margin: 0; padding-left: 16px; color: #6B6E7A; }
</style>
</head>
<body>
${inner}
</body>
</html>`;
    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px", background: "#fff" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            {tool.name}
          </span>
          <span
            className="text-[10px] px-1.5 py-px font-medium"
            style={{ background: "#E8F0FF", color: "#003DB5", borderRadius: "3px" }}
          >
            Browser-only
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label
            className="cursor-pointer inline-flex items-center px-2.5 h-[28px] text-[11px] font-medium text-muted hover:text-ink transition-colors"
            style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
          >
            Upload .md
            <input
              type="file"
              accept=".md,.markdown"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={copyHtml}
            className="inline-flex items-center px-2.5 h-[28px] text-[11px] font-medium text-muted hover:text-ink transition-colors"
            style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
          >
            {copied ? "Copied!" : "Copy HTML"}
          </button>
          <button
            onClick={downloadHtml}
            className="inline-flex items-center px-2.5 h-[28px] text-[11px] font-medium text-blue hover:text-blue-dark transition-colors"
            style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
          >
            Export .html
          </button>
        </div>
      </div>

      {/* Split pane */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2"
        style={{
          border: "0.5px solid #E2E2E6",
          borderRadius: "3px",
          background: "#fff",
          minHeight: "520px",
        }}
      >
        {/* Editor */}
        <div
          className="flex flex-col"
          style={{ borderRight: "0.5px solid #E2E2E6" }}
        >
          <div
            className="px-3 py-2"
            style={{ borderBottom: "0.5px solid #E2E2E6" }}
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
              Markdown
            </span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="flex-1 w-full resize-none text-[13px] font-mono text-ink outline-none p-4"
            style={{ minHeight: "460px", background: "transparent" }}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <div
            className="px-3 py-2"
            style={{ borderBottom: "0.5px solid #E2E2E6" }}
          >
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
              Preview
            </span>
          </div>
          <div
            ref={outputRef}
            className="flex-1 p-5 overflow-auto prose prose-sm max-w-none"
            style={{
              minHeight: "460px",
              "--tw-prose-body": "#0E0F11",
              "--tw-prose-headings": "#0E0F11",
              "--tw-prose-links": "#0066FF",
              "--tw-prose-code": "#0E0F11",
              "--tw-prose-pre-bg": "#F5F5F7",
              "--tw-prose-th-borders": "#E2E2E6",
              "--tw-prose-td-borders": "#E2E2E6",
            } as React.CSSProperties}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
