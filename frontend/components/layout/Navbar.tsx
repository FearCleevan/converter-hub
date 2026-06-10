import Link from "next/link";
import Button from "@/components/ui/Button";

export default function Navbar() {
  return (
    <header className="w-full bg-ink" style={{ height: "52px" }}>
      <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {/* Blue square logomark */}
          <div
            className="bg-blue flex items-center justify-center shrink-0"
            style={{ width: "28px", height: "28px", borderRadius: "0px" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 3h4v4H3V3zm6 0h4v4H9V3zm0 6h4v4H9V9zm-6 0h4v4H3V9z"
                fill="white"
              />
            </svg>
          </div>

          {/* Wordmark */}
          <span className="text-white font-body text-[15px] font-medium leading-none tracking-[-0.01em]">
            Convert<span className="text-blue font-semibold">Hub</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/tools"
            className="text-[13px] font-medium text-white/50 hover:text-white transition-colors"
          >
            Tools
          </Link>
          <Link
            href="/formats"
            className="text-[13px] font-medium text-white/50 hover:text-white transition-colors"
          >
            Formats
          </Link>
          <Link
            href="/docs"
            className="text-[13px] font-medium text-white/50 hover:text-white transition-colors"
          >
            Docs
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex border-white/25 text-white hover:border-white/60">
            Self-host
          </Button>
          <Button variant="primary" size="sm">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
