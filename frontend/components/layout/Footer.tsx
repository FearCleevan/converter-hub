import Link from "next/link";

const footerColumns = [
  {
    heading: "Image",
    links: [
      { label: "HEIC to JPG", href: "/image/heic-to-jpg" },
      { label: "PNG to JPG", href: "/image/png-to-jpg" },
      { label: "JPG to PNG", href: "/image/jpg-to-png" },
      { label: "SVG to PNG", href: "/image/svg-to-png" },
      { label: "Image Compress", href: "/image/image-compress" },
      { label: "All image tools →", href: "/image" },
    ],
  },
  {
    heading: "Document",
    links: [
      { label: "PDF to Word", href: "/document/pdf-to-word" },
      { label: "Word to PDF", href: "/document/word-to-pdf" },
      { label: "PDF Merge", href: "/document/pdf-merge" },
      { label: "PDF Compress", href: "/document/pdf-compress" },
      { label: "Markdown to PDF", href: "/document/md-to-pdf" },
      { label: "All document tools →", href: "/document" },
    ],
  },
  {
    heading: "Video & Audio",
    links: [
      { label: "MP4 to MP3", href: "/video/mp4-to-mp3" },
      { label: "URL to MP4", href: "/video/url-to-mp4" },
      { label: "URL to MP3", href: "/video/url-to-mp3" },
      { label: "MOV to MP4", href: "/video/mov-to-mp4" },
      { label: "WAV to MP3", href: "/audio/wav-to-mp3" },
      { label: "All video tools →", href: "/video" },
    ],
  },
  {
    heading: "More Tools",
    links: [
      { label: "CSV to Excel", href: "/spreadsheet/csv-to-excel" },
      { label: "EPUB to MOBI", href: "/ebook/epub-to-mobi" },
      { label: "ZIP Extract", href: "/archive/zip-extract" },
      { label: "JSON Formatter", href: "/code-data/json-formatter" },
      { label: "SHA-256 Hash", href: "/hash/sha256" },
      { label: "All tools →", href: "/tools" },
    ],
  },
  {
    heading: "Project",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "All Formats", href: "/formats" },
      { label: "Self-host Guide", href: "/docs/self-host" },
      { label: "GitHub", href: "https://github.com" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      {/* Main grid */}
      <div className="max-w-[1280px] mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6">
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white/30 mb-4">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="border-t"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-[12px] text-white/30">
            Open source. Free forever.
          </span>
          <span className="text-[12px] text-white/30">
            Built by Lazan
          </span>
        </div>
      </div>
    </footer>
  );
}
