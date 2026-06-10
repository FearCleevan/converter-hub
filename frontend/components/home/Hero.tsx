import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import FormatWidget from "@/components/home/FormatWidget";

const FORMAT_PILLS = [
  "PDF", "JPG", "MP4", "MP3", "DOCX", "PNG",
  "WebP", "HEIC", "EPUB", "CSV", "SVG", "GIF",
];

export default function Hero() {
  return (
    <section className="bg-ink pt-14 pb-0">
      <PageWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-start">
          {/* Left column */}
          <div className="max-w-[540px]">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-4 h-[1.5px] bg-blue shrink-0" />
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/35">
                Self-hosted · Open source · Free forever
              </span>
            </div>

            {/* H1 */}
            <h1 className="font-display text-[56px] sm:text-[68px] leading-[0.95] tracking-[-1px] text-white mb-6">
              Convert<br />any file.<br />
              <span className="text-blue">No limits.</span>
            </h1>

            {/* Subtext */}
            <p className="text-[15px] text-white/50 leading-relaxed mb-8 max-w-[420px]">
              200+ formats across image, video, audio, document, code and more.
              Runs on your machine — no upload limits, no subscriptions, no tracking.
            </p>

            {/* Format pills */}
            <div className="flex flex-wrap gap-1.5">
              {FORMAT_PILLS.map((fmt) => (
                <span
                  key={fmt}
                  className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium text-white/60"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    borderRadius: "3px",
                  }}
                >
                  .{fmt}
                </span>
              ))}
              <Link
                href="/formats"
                className="inline-flex items-center px-2.5 py-1 text-[11px] font-medium text-blue/70 hover:text-blue transition-colors"
                style={{
                  background: "rgba(0,102,255,0.08)",
                  border: "0.5px solid rgba(0,102,255,0.2)",
                  borderRadius: "3px",
                }}
              >
                +190 more →
              </Link>
            </div>
          </div>

          {/* Right column — FormatWidget (hidden on mobile) */}
          <div className="hidden lg:flex items-start pt-2">
            <FormatWidget />
          </div>
        </div>
      </PageWrapper>

      {/* Bottom fade to DropzoneHero */}
      <div className="h-12 mt-12" style={{ background: "linear-gradient(to bottom, #0E0F11, #0E0F11)" }} />
    </section>
  );
}
