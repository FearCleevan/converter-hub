"use client";

import { useState, useMemo } from "react";
import type { ConverterTool } from "@/types/converter.types";
import ConverterCard from "@/components/converter/ConverterCard";

interface ToolGridProps {
  tools: ConverterTool[];
  /** Show "popular first" toggle (used on /tools page) */
  showPopularToggle?: boolean;
}

export default function ToolGrid({ tools, showPopularToggle = false }: ToolGridProps) {
  const [query, setQuery] = useState("");
  const [filterFormat, setFilterFormat] = useState("");
  const [popularOnly, setPopularOnly] = useState(false);

  const filtered = useMemo(() => {
    let result = tools;

    if (popularOnly) {
      result = result.filter((t) => t.popular);
    }

    if (filterFormat) {
      const fmt = filterFormat.toLowerCase().replace(/^\./, "");
      result = result.filter(
        (t) =>
          t.inputFormats.some((f) => f.toLowerCase().includes(fmt)) ||
          t.outputFormat.toLowerCase().includes(fmt)
      );
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.inputFormats.some((f) => f.toLowerCase().includes(q)) ||
          t.outputFormat.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tools, query, filterFormat, popularOnly]);

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools or formats…"
            className="w-full pl-9 pr-3 h-[38px] text-[13px] bg-white text-ink placeholder:text-muted outline-none focus:border-blue transition-colors"
            style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
          />
        </div>

        {/* Format filter */}
        <input
          type="text"
          value={filterFormat}
          onChange={(e) => setFilterFormat(e.target.value)}
          placeholder="Filter by format (e.g. pdf)"
          className="sm:w-[200px] px-3 h-[38px] text-[13px] bg-white text-ink placeholder:text-muted outline-none focus:border-blue transition-colors"
          style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
        />

        {/* Popular toggle */}
        {showPopularToggle && (
          <button
            onClick={() => setPopularOnly((p) => !p)}
            className={`px-4 h-[38px] text-[12px] font-medium transition-colors whitespace-nowrap ${
              popularOnly
                ? "bg-blue text-white border-transparent"
                : "bg-white text-muted hover:border-blue hover:text-blue"
            }`}
            style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
          >
            Popular only
          </button>
        )}
      </div>

      {/* Result count */}
      {(query || filterFormat || popularOnly) && (
        <p className="text-[12px] text-muted mb-4">
          {filtered.length} tool{filtered.length !== 1 ? "s" : ""}
          {query && ` matching "${query}"`}
          {filterFormat && ` · format: .${filterFormat.replace(/^\./, "").toUpperCase()}`}
          {filtered.length < tools.length && (
            <button
              onClick={() => { setQuery(""); setFilterFormat(""); setPopularOnly(false); }}
              className="ml-2 text-blue hover:text-blue-dark transition-colors"
            >
              Clear
            </button>
          )}
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((tool) => (
            <ConverterCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          style={{ border: "0.5px dashed #E2E2E6", borderRadius: "3px" }}
        >
          <p className="text-[14px] font-medium text-ink mb-1">No tools found</p>
          <p className="text-[13px] text-muted mb-4">
            Try a different search or format name
          </p>
          <button
            onClick={() => { setQuery(""); setFilterFormat(""); setPopularOnly(false); }}
            className="text-[12px] text-blue hover:text-blue-dark transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
