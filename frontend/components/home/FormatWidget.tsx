"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import CategoryIcon from "@/components/converter/CategoryIcon";
import type { ConverterCategory } from "@/types/converter.types";

const FORMAT_PAIRS = [
  { input: "PDF", inputCategory: "Document", output: "DOCX", outputCategory: "Document", href: "/document/pdf-to-word" },
  { input: "HEIC", inputCategory: "Image", output: "JPG", outputCategory: "Image", href: "/image/heic-to-jpg" },
  { input: "MP4", inputCategory: "Video", output: "MP3", outputCategory: "Audio", href: "/video/mp4-to-mp3" },
  { input: "PNG", inputCategory: "Image", output: "JPG", outputCategory: "Image", href: "/image/png-to-jpg" },
  { input: "EPUB", inputCategory: "eBook", output: "MOBI", outputCategory: "eBook", href: "/ebook/epub-to-mobi" },
  { input: "CSV", inputCategory: "Spreadsheet", output: "XLSX", outputCategory: "Spreadsheet", href: "/spreadsheet/csv-to-excel" },
];

const LABEL_TO_CATEGORY: Record<string, ConverterCategory> = {
  Document: "document",
  Image: "image",
  Video: "video",
  Audio: "audio",
  eBook: "ebook",
  Spreadsheet: "spreadsheet",
};

export default function FormatWidget() {
  const [activeIdx, setActiveIdx] = useState(0);
  const pair = FORMAT_PAIRS[activeIdx];

  return (
    <div
      className="bg-ink-2 w-full max-w-[360px]"
      style={{ border: "0.5px solid rgba(255,255,255,0.08)", borderRadius: "0px" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/30">
          Quick Convert
        </span>
        <div className="flex items-center gap-1">
          {FORMAT_PAIRS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-1.5 h-1.5 transition-colors ${
                i === activeIdx ? "bg-blue" : "bg-white/20 hover:bg-white/40"
              }`}
              style={{ borderRadius: "0px" }}
              aria-label={`Format pair ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Format boxes */}
      <div className="p-4 flex items-center gap-3">
        {/* Input */}
        <div
          className="flex-1 p-3 bg-white/5"
          style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}
        >
          <div className="w-5 h-5 flex items-center justify-center mb-1.5 text-white/50"><CategoryIcon category={LABEL_TO_CATEGORY[pair.inputCategory] ?? "document"} size={16} /></div>
          <div className="text-[13px] font-medium text-white">.{pair.input}</div>
          <div className="text-[11px] text-white/30 mt-0.5">{pair.inputCategory}</div>
        </div>

        {/* Arrow */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M4 10h12M12 6l4 4-4 4"
              stroke="#0066FF"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </div>

        {/* Output */}
        <div
          className="flex-1 p-3 bg-blue/10"
          style={{ border: "0.5px solid rgba(0,102,255,0.25)" }}
        >
          <div className="w-5 h-5 flex items-center justify-center mb-1.5 text-blue/60"><CategoryIcon category={LABEL_TO_CATEGORY[pair.outputCategory] ?? "document"} size={16} /></div>
          <div className="text-[13px] font-medium text-blue">.{pair.output}</div>
          <div className="text-[11px] text-blue/50 mt-0.5">{pair.outputCategory}</div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        <Link href={pair.href} className="block">
          <Button variant="primary" size="md" block>
            Select files to convert
          </Button>
        </Link>
      </div>

      {/* Cycle formats */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-[11px] text-white/25">Or choose another format</span>
        <button
          onClick={() => setActiveIdx((i) => (i + 1) % FORMAT_PAIRS.length)}
          className="text-[11px] text-blue/70 hover:text-blue transition-colors"
        >
          Switch ›
        </button>
      </div>
    </div>
  );
}
