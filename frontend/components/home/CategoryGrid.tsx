import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import CategoryIcon from "@/components/converter/CategoryIcon";
import { categories, allTools } from "@/lib/converters.config";

const STATS = [
  { value: "200+", label: "Formats supported" },
  { value: "13", label: "Categories" },
  { value: "∞", label: "Daily conversions" },
  { value: "$0", label: "Forever" },
];

export default function CategoryGrid() {
  const totalTools = allTools.length;

  return (
    <section className="bg-surface py-16">
      <PageWrapper>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <SectionEyebrow label="Categories" className="mb-3" />
            <h2 className="text-[26px] sm:text-[30px] font-medium text-ink leading-tight">
              {totalTools}+ tools across {categories.length} categories
            </h2>
          </div>

          {/* Inline stat strip */}
          <div className="flex items-center gap-6 shrink-0">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[20px] font-display tracking-wide text-ink leading-none">{s.value}</div>
                <div className="text-[10px] text-muted uppercase tracking-[0.06em] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category chips grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mb-10">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="group flex items-center gap-2.5 px-3 py-2.5 bg-white hover:border-blue transition-colors"
              style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center shrink-0 text-muted group-hover:text-blue transition-colors"
              >
                <CategoryIcon category={cat.id} size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-medium text-ink truncate group-hover:text-blue transition-colors">
                  {cat.label}
                </div>
                <div
                  className="inline-flex items-center mt-0.5 px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ background: "#E8F0FF", color: "#003DB5", borderRadius: "3px" }}
                >
                  {cat.tools.length}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Format tag cloud */}
        <div
          className="p-5"
          style={{ background: "#F5F5F7", border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mb-3">
            Popular formats
          </p>
          <FormatTagCloud />
        </div>
      </PageWrapper>
    </section>
  );
}

function FormatTagCloud() {
  const FORMATS = [
    "PDF", "JPG", "PNG", "WebP", "HEIC", "SVG", "GIF", "TIFF", "BMP", "ICO",
    "MP4", "MOV", "AVI", "MKV", "WebM", "FLV", "WMV", "GIF",
    "MP3", "WAV", "FLAC", "OGG", "AAC", "M4A",
    "DOCX", "DOC", "ODT", "RTF", "TXT", "HTML", "MD",
    "XLSX", "XLS", "CSV", "ODS",
    "PPTX", "PPT", "ODP",
    "EPUB", "MOBI", "AZW3", "FB2",
    "ZIP", "RAR", "7Z", "TAR",
    "JSON", "XML", "YAML", "CSV",
  ];

  const seen = new Set<string>();
  const unique = FORMATS.filter((f) => !seen.has(f) && seen.add(f));

  return (
    <div className="flex flex-wrap gap-1.5">
      {unique.map((fmt) => (
        <span
          key={fmt}
          className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-white/80"
          style={{
            background: "#0E0F11",
            borderRadius: "3px",
          }}
        >
          .{fmt}
        </span>
      ))}
    </div>
  );
}
