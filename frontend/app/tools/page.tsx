import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import ToolGrid from "@/components/converter/ToolGrid";
import CategoryIcon from "@/components/converter/CategoryIcon";
import { allTools, categories } from "@/lib/converters.config";

export const metadata = {
  title: "All Tools — ConvertHub",
  description: `Browse all ${allTools.length}+ file conversion tools across ${categories.length} categories.`,
};

export default function ToolsPage() {
  return (
    <div className="bg-surface min-h-screen">
      {/* Dark header */}
      <div className="bg-ink">
        <PageWrapper className="py-10">
          <SectionEyebrow
            label="All Tools"
            className="mb-3 [&>div]:bg-blue [&>span]:text-white/40"
          />
          <h1 className="font-display text-[44px] leading-none tracking-[-0.5px] text-white mb-2">
            {allTools.length}+ Converters
          </h1>
          <p className="text-[14px] text-white/45 max-w-[480px]">
            Every file format covered. Search by name, or filter by format extension below.
          </p>
        </PageWrapper>
      </div>

      <PageWrapper className="py-8">
        {/* Category quick-links */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${cat.slug}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-[12px] font-medium text-muted hover:border-blue hover:text-blue transition-colors"
              style={{ border: "0.5px solid #E2E2E6", borderRadius: "3px" }}
            >
              <CategoryIcon category={cat.id} size={12} />
              {cat.label}
              <span
                className="text-[10px] font-medium px-1 py-px"
                style={{ background: "#E8F0FF", color: "#003DB5", borderRadius: "3px" }}
              >
                {cat.tools.length}
              </span>
            </Link>
          ))}
        </div>

        {/* Full grid with search + popular toggle */}
        <ToolGrid tools={allTools} showPopularToggle />
      </PageWrapper>
    </div>
  );
}
