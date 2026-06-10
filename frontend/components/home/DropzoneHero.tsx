"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";

export default function DropzoneHero() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    router.push("/tools");
  };

  return (
    <section className="bg-ink pb-16">
      <PageWrapper>
        {/* Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !urlMode && inputRef.current?.click()}
          className="relative cursor-pointer transition-all duration-200"
          style={{
            border: isDragOver
              ? "1.5px solid #0066FF"
              : "1.5px dashed rgba(255,255,255,0.15)",
            borderRadius: "3px",
            background: isDragOver
              ? "rgba(0,102,255,0.06)"
              : "rgba(255,255,255,0.025)",
            padding: "52px 24px",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={() => router.push("/tools")}
            aria-label="Select files to convert"
          />

          {!urlMode ? (
            <div className="flex flex-col items-center text-center gap-4">
              {/* Upload icon */}
              <div
                className="w-12 h-12 flex items-center justify-center"
                style={{
                  background: "rgba(0,102,255,0.12)",
                  border: "0.5px solid rgba(0,102,255,0.2)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <path
                    d="M11 3v12M5 9l6-6 6 6M3 18h16"
                    stroke="#0066FF"
                    strokeWidth="1.5"
                    strokeLinecap="square"
                  />
                </svg>
              </div>

              <div>
                <p className="text-[15px] font-medium text-white/80 mb-1">
                  {isDragOver ? "Drop files to convert" : "Drop files here"}
                </p>
                <p className="text-[13px] text-white/35">
                  or click to browse · any format · any size
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="inline-flex items-center px-4 h-[34px] text-[12px] font-medium text-white/70 hover:text-white transition-colors"
                  style={{
                    border: "0.5px solid rgba(255,255,255,0.2)",
                    borderRadius: "3px",
                  }}
                >
                  Browse files
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUrlMode(true);
                  }}
                  className="inline-flex items-center px-4 h-[34px] text-[12px] font-medium text-white/70 hover:text-white transition-colors"
                  style={{
                    border: "0.5px solid rgba(255,255,255,0.2)",
                    borderRadius: "3px",
                  }}
                >
                  Paste URL
                </button>
              </div>
            </div>
          ) : (
            /* URL input mode */
            <div
              className="flex flex-col items-center gap-4 max-w-[560px] mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[13px] text-white/40">
                YouTube, Vimeo, or direct file URL
              </p>
              <div className="w-full flex gap-2">
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  autoFocus
                  className="flex-1 bg-white/5 text-white text-[13px] px-3 h-[38px] placeholder:text-white/25 outline-none"
                  style={{
                    border: "0.5px solid rgba(255,255,255,0.15)",
                    borderRadius: "3px",
                  }}
                />
                <button
                  onClick={() => urlValue && router.push("/video/url-to-mp4")}
                  className="px-4 h-[38px] bg-blue text-white text-[12px] font-medium hover:bg-blue-dark transition-colors"
                  style={{ borderRadius: "3px" }}
                >
                  Convert
                </button>
              </div>
              <button
                onClick={() => { setUrlMode(false); setUrlValue(""); }}
                className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
              >
                ← Back to file upload
              </button>
            </div>
          )}
        </div>

        {/* Supported formats hint */}
        <p className="text-center text-[11px] text-white/20 mt-3">
          Supports 200+ formats · JPG, PNG, PDF, MP4, MP3, DOCX, EPUB, ZIP and more
        </p>
      </PageWrapper>
    </section>
  );
}
