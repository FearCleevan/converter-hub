import PageWrapper from "@/components/layout/PageWrapper";
import SectionEyebrow from "@/components/ui/SectionEyebrow";

const FEATURES = [
  {
    number: "01",
    title: "200+ formats. Every category.",
    body:
      "Image, video, audio, document, spreadsheet, presentation, eBook, archive, vector, CAD, font, code, and hash. If the file exists, ConvertHub converts it.",
  },
  {
    number: "02",
    title: "Zero rate limits. Zero file size caps.",
    body:
      "No 100MB walls. No daily quotas. No login required. Convert as many files as you want, as large as your disk allows. It's your server.",
  },
  {
    number: "03",
    title: "Self-hosted in one command.",
    body:
      "Clone the repo, run docker compose up. The frontend and backend start together. Works on Windows, macOS, and Linux. No cloud services. No API keys.",
  },
  {
    number: "04",
    title: "Batch queue. Download as ZIP.",
    body:
      "Drop 50 files at once. Watch each one convert in the queue. Download individually or bundle everything into a single ZIP. All in the browser.",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="bg-white py-16">
      <PageWrapper>
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <SectionEyebrow label="Why ConvertHub" className="mb-3" />
            <h2 className="text-[26px] sm:text-[30px] font-medium text-ink leading-tight max-w-[400px]">
              Built different from every other converter
            </h2>
          </div>
        </div>

        {/* 4-cell grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
          {FEATURES.map((feat) => (
            <div
              key={feat.number}
              className="bg-white p-7 flex flex-col gap-4"
            >
              {/* Number */}
              <span
                className="font-display text-[42px] leading-none tracking-[-0.5px]"
                style={{ color: "#E2E2E6" }}
              >
                {feat.number}
              </span>

              {/* Title */}
              <h3 className="text-[15px] font-medium text-ink leading-snug">
                {feat.title}
              </h3>

              {/* Body */}
              <p className="text-[13px] text-muted leading-relaxed">
                {feat.body}
              </p>
            </div>
          ))}
        </div>
      </PageWrapper>
    </section>
  );
}
