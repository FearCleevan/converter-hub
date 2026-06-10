import Link from "next/link";
import type { ConverterTool } from "@/types/converter.types";
import CategoryIcon from "@/components/converter/CategoryIcon";

interface ConverterCardProps {
  tool: ConverterTool;
}

export default function ConverterCard({ tool }: ConverterCardProps) {
  const href = `/${tool.category}/${tool.slug}`;
  const inputLabel =
    tool.inputFormats
      .slice(0, 3)
      .map((f) => `.${f.toUpperCase()}`)
      .join(", ") + (tool.inputFormats.length > 3 ? ` +${tool.inputFormats.length - 3}` : "");

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white p-4 border border-border hover:border-blue transition-colors rounded-[3px]"
    >
      {/* Header: icon + name/formats */}
      <div className="flex items-start gap-2.5 mb-3">
        <div
          className="w-8 h-8 flex items-center justify-center shrink-0 text-blue-dark group-hover:bg-blue group-hover:text-white transition-colors"
          style={{ background: "#E8F0FF", borderRadius: "0px" }}
        >
          <CategoryIcon category={tool.category} size={15} />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-ink group-hover:text-blue transition-colors leading-snug">
            {tool.name}
          </div>
          <div className="text-[11px] text-muted mt-0.5 truncate">
            {inputLabel} → .{tool.outputFormat.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[12px] text-muted leading-relaxed mb-3 flex-1">
        {tool.description}
      </p>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[11px] text-muted/70">
          {tool.inputMode === "url"
            ? "URL input"
            : tool.inputMode === "text"
            ? "Text input"
            : "File upload"}
        </span>
        <span className="text-[12px] font-medium text-blue group-hover:text-blue-dark transition-colors">
          Convert →
        </span>
      </div>
    </Link>
  );
}
