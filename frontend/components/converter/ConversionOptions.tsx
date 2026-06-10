"use client";

import { useState } from "react";
import type { ConverterOption } from "@/types/converter.types";

interface ConversionOptionsProps {
  options: ConverterOption[];
  values: Record<string, string | number | boolean>;
  onChange: (key: string, value: string | number | boolean) => void;
}

export default function ConversionOptions({ options, values, onChange }: ConversionOptionsProps) {
  const [open, setOpen] = useState(false);

  if (!options.length) return null;

  return (
    <div style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-border/30 transition-colors text-left"
        aria-expanded={open}
      >
        <span className="text-[12px] font-medium text-ink">Options</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </button>

      {/* Options body */}
      {open && (
        <div
          className="px-4 py-4 space-y-4 bg-white"
          style={{ borderTop: "0.5px solid #E2E2E6" }}
        >
          {options.map((opt) => (
            <div key={opt.key} className="flex items-center justify-between gap-4">
              <label
                htmlFor={`opt-${opt.key}`}
                className="text-[12px] font-medium text-ink shrink-0"
              >
                {opt.label}
                {opt.unit && (
                  <span className="text-muted font-normal ml-1">({opt.unit})</span>
                )}
              </label>

              {opt.type === "range" && (
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <input
                    id={`opt-${opt.key}`}
                    type="range"
                    min={opt.min ?? 0}
                    max={opt.max ?? 100}
                    value={Number(values[opt.key] ?? opt.default)}
                    onChange={(e) => onChange(opt.key, Number(e.target.value))}
                    className="w-28 accent-blue"
                  />
                  <span className="text-[12px] text-muted w-7 text-right tabular-nums">
                    {values[opt.key] ?? opt.default}
                  </span>
                </div>
              )}

              {opt.type === "select" && (
                <select
                  id={`opt-${opt.key}`}
                  value={String(values[opt.key] ?? opt.default)}
                  onChange={(e) => onChange(opt.key, e.target.value)}
                  className="text-[12px] text-ink bg-white px-2 h-[30px] outline-none focus:border-blue transition-colors"
                  style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
                >
                  {opt.options?.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              )}

              {opt.type === "number" && (
                <input
                  id={`opt-${opt.key}`}
                  type="number"
                  min={opt.min}
                  max={opt.max}
                  value={Number(values[opt.key] ?? opt.default)}
                  onChange={(e) => onChange(opt.key, Number(e.target.value))}
                  className="text-[12px] text-ink bg-white px-2 h-[30px] w-20 outline-none focus:border-blue transition-colors text-right"
                  style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
                />
              )}

              {opt.type === "toggle" && (
                <button
                  id={`opt-${opt.key}`}
                  role="switch"
                  aria-checked={Boolean(values[opt.key] ?? opt.default)}
                  onClick={() => onChange(opt.key, !Boolean(values[opt.key] ?? opt.default))}
                  className={`relative inline-flex h-5 w-9 items-center transition-colors ${
                    Boolean(values[opt.key] ?? opt.default) ? "bg-blue" : "bg-border"
                  }`}
                  style={{ borderRadius: "10px" }}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 bg-white transition-transform"
                    style={{
                      borderRadius: "50%",
                      transform: Boolean(values[opt.key] ?? opt.default)
                        ? "translateX(20px)"
                        : "translateX(3px)",
                    }}
                  />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
