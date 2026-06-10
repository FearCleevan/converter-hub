import { notFound } from "next/navigation";
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import SectionEyebrow from "@/components/ui/SectionEyebrow";
import ToolGrid from "@/components/converter/ToolGrid";
import CategoryIcon from "@/components/converter/CategoryIcon";
import { getCategoryBySlug, categories } from "@/lib/converters.config";

interface CategoryPageProps {
  params: { category: string };
}

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: CategoryPageProps) {
  const cat = getCategoryBySlug(params.category);
  if (!cat) return {};
  return {
    title: `${cat.label} Converter — ConvertHub`,
    description: cat.description,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const cat = getCategoryBySlug(params.category);
  if (!cat) notFound();

  const popularCount = cat.tools.filter((t) => t.popular).length;

  return (
    <div className="bg-surface min-h-screen">
      {/* Dark header strip */}
      <div className="bg-ink">
        <PageWrapper className="py-10">
          {/* Back link */}
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-[11px] text-white/35 hover:text-white/70 transition-colors mb-5"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
            </svg>
            All tools
          </Link>

          <div className="flex items-start gap-4">
            {/* Category icon */}
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0 text-blue mt-1"
              style={{ background: "rgba(0,102,255,0.12)", borderRadius: "0px" }}
            >
              <CategoryIcon category={cat.id} size={20} />
            </div>

            <div>
              <SectionEyebrow
                label={cat.label}
                className="mb-2 [&>div]:bg-blue [&>span]:text-white/40"
              />
              <h1 className="font-display text-[44px] leading-none tracking-[-0.5px] text-white mb-2">
                {cat.label} Converter
              </h1>
              <p className="text-[14px] text-white/45 max-w-[520px] leading-relaxed">
                {cat.description}
              </p>

              {/* Stats strip */}
              <div className="flex items-center gap-5 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[20px] font-display text-white leading-none">{cat.tools.length}</span>
                  <span className="text-[11px] uppercase tracking-[0.06em] text-white/30">Tools</span>
                </div>
                {popularCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[20px] font-display text-white leading-none">{popularCount}</span>
                    <span className="text-[11px] uppercase tracking-[0.06em] text-white/30">Popular</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* Tool grid */}
      <PageWrapper className="py-8">
        <ToolGrid tools={cat.tools} />
      </PageWrapper>
    </div>
  );
}
