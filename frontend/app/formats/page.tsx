import PageWrapper from "@/components/layout/PageWrapper";
import SectionEyebrow from "@/components/ui/SectionEyebrow";

export const metadata = {
  title: "All Formats — ConvertHub",
  description: "Full A–Z directory of every supported file format.",
};

export default function FormatsPage() {
  return (
    <div className="bg-surface min-h-screen">
      <PageWrapper className="py-12">
        <SectionEyebrow label="Formats" className="mb-4" />
        <h1 className="text-[28px] font-medium text-ink mb-2">Format Directory</h1>
        <p className="text-[14px] text-muted">
          Phase 7 will build the full A–Z searchable format directory.
        </p>
      </PageWrapper>
    </div>
  );
}
