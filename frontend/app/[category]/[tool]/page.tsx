import { notFound } from "next/navigation";
import ConverterShell from "@/components/converter/ConverterShell";
import { getToolBySlug, getCategoryBySlug, allTools } from "@/lib/converters.config";

interface ToolPageProps {
  params: { category: string; tool: string };
}

export function generateStaticParams() {
  return allTools.map((t) => ({ category: t.category, tool: t.slug }));
}

export function generateMetadata({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.category, params.tool);
  if (!tool) return {};
  return {
    title: `${tool.name} — ConvertHub`,
    description: tool.description,
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.category, params.tool);
  const cat = getCategoryBySlug(params.category);
  if (!tool || !cat) notFound();

  return <ConverterShell tool={tool} categoryLabel={cat.label} />;
}
