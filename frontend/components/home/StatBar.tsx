import Image from "next/image";
import PageWrapper from "@/components/layout/PageWrapper";

const STATS = [
  { value: "200+", label: "Formats", useText: true },
  { value: "13", label: "Categories", useText: true },
  { value: null, label: "Daily conversions", useInfinity: true },
  { value: "$0", label: "Forever", useText: true },
  { value: "100%", label: "Self-hosted", useText: true },
];

export default function StatBar() {
  return (
    <section className="bg-ink py-10" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
      <PageWrapper>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-0">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center"
              style={
                i < STATS.length - 1
                  ? { borderRight: "0.5px solid rgba(255,255,255,0.08)" }
                  : undefined
              }
            >
              {stat.useInfinity ? (
                <div className="h-[38px] flex items-center justify-center">
                  <Image
                    src="/Icon/Infinity-Icon.svg"
                    alt="Infinity"
                    width={42}
                    height={22}
                    className="invert opacity-90"
                  />
                </div>
              ) : (
                <span className="font-display text-[38px] leading-none tracking-[-0.5px] text-white">
                  {stat.value}
                </span>
              )}
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/35 mt-1.5">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </PageWrapper>
    </section>
  );
}
