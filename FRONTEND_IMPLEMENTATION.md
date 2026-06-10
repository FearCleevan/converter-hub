# FRONTEND_IMPLEMENTATION.md
# ConvertHub — Universal Self-Hosted File Converter
# Frontend Implementation Plan (Next.js 14 + React + TypeScript + Tailwind CSS v3)
# Version 2.0 — Full Scope with Design System Lock

---

## Design System (Locked)

### Color Tokens
```
--ink:        #0E0F11   → header, footer, hero bg, dark surfaces
--ink-2:      #1C1D20   → hero sub-sections, dropzone bg
--blue:       #0066FF   → primary accent (interactive/active only)
--blue-dim:   #E8F0FF   → blue tint backgrounds
--blue-dark:  #003DB5   → blue hover state
--surface:    #F5F5F7   → page background
--border:     #E2E2E6   → all borders
--white:      #FFFFFF   → cards, elevated panels
--text:       #0E0F11   → primary text
--muted:      #6B6E7A   → secondary text, labels
```

### Typography
- Display / Hero H1: `Bebas Neue`, bold, letter-spacing: -0.8px
- All other headings: `Inter`, weight 500
- Body: `Inter`, weight 400, line-height 1.65
- Captions / labels: `Inter`, 11px, weight 500, letter-spacing 0.08em, uppercase

### Geometry
- Storefront border-radius: `3px` (not 0px — softer than brutal but sharper than CloudConvert)
- Admin/queue panel border-radius: `0px`
- No gradients. No glow. No glassmorphism. No neon. No rounded pill cards.
- All borders: `0.5px solid` using border token

### Signature Elements
- Near-black (`#0E0F11`) header + hero + footer — light body between (inverted from CloudConvert's all-dark)
- Electric blue `#0066FF` strictly on interactive elements only
- Category count badges: `#E8F0FF` bg + `#003DB5` text
- Format tags in hero/footer: dark pill `#0E0F11` bg + white text
- Batch queue UI: uses `0px` border-radius (admin aesthetic)
- Section eyebrow: 16px blue horizontal rule + uppercase label

---

## App Structure

```
/app
  layout.tsx                    → Root layout: Navbar + Footer shell
  page.tsx                      → Homepage (hero + dropzone + features + stats)
  /tools
    page.tsx                    → All tools browser (grid with search + filter)
  /[category]
    page.tsx                    → Category page (e.g. /images, /documents)
  /[category]/[tool]
    page.tsx                    → Individual converter page
  /formats
    page.tsx                    → Full format directory (A–Z, searchable)

/components
  /layout
    Navbar.tsx
    Footer.tsx
    PageWrapper.tsx             → Max-width container + padding

  /home
    Hero.tsx                    → H1 + subtext + format pills + FormatWidget
    FormatWidget.tsx            → Input/output format selector (hero right panel)
    DropzoneHero.tsx            → Full-width dark dropzone (below hero)
    CategoryGrid.tsx            → 12 category chips with counts
    FormatTagCloud.tsx          → Dark pill format tags
    FeaturesGrid.tsx            → 4-cell editorial features grid (numbered)
    BatchShowcase.tsx           → Left text + right live batch queue mockup
    StatBar.tsx                 → Dark stat strip (200+ formats, ∞ daily, $0, etc.)

  /converter
    ConverterShell.tsx          → Master wrapper for every individual converter page
    FileDropzone.tsx            → Drag-and-drop, multi-file, click-to-browse
    UrlInput.tsx                → URL paste input (YouTube + direct file)
    BatchQueue.tsx              → File queue with per-file progress + download
    ConversionOptions.tsx       → Tool-specific options panel (quality, DPI, codec)
    ConversionResult.tsx        → Single file result download card
    ProgressBar.tsx             → Animated progress (upload + processing phases)
    StatusBadge.tsx             → done / converting / queued / error states

  /ui
    Button.tsx                  → primary (blue), ghost, danger, icon-only variants
    Badge.tsx                   → category count badge + format tag
    SectionEyebrow.tsx          → blue rule + uppercase label
    Spinner.tsx
    Toast.tsx                   → top-right success/error/info toast

/lib
  converters.config.ts          → Master config: all 200+ converters, categories, metadata
  api.ts                        → Axios client, file upload, URL convert, blob download
  mockConvert.ts                → Simulated conversion pipeline (Phases 1–4)
  utils.ts                      → File size format, extension detect, mime types
  history.ts                    → localStorage conversion history (last 20 records)

/types
  converter.types.ts

/public
  /fonts                        → Bebas Neue (display), Inter (body) — self-hosted
```

---

## Master Converter Config Schema

```typescript
// /lib/converters.config.ts

export type ConverterCategory =
  | 'image' | 'document' | 'video' | 'audio'
  | 'spreadsheet' | 'presentation' | 'ebook'
  | 'archive' | 'vector' | 'cad' | 'font'
  | 'code-data' | 'hash';

export type InputMode = 'file' | 'url' | 'text' | 'file-and-url';

export type ConverterOption = {
  key: string;
  label: string;
  type: 'select' | 'range' | 'number' | 'toggle';
  default: string | number | boolean;
  options?: string[];          // for select type
  min?: number; max?: number;  // for range/number
  unit?: string;               // e.g. 'px', 'kbps', 'dpi'
};

export type ConverterTool = {
  id: string;                  // e.g. 'pdf-to-word'
  name: string;                // e.g. 'PDF to Word'
  slug: string;                // URL segment: /document/pdf-to-word
  category: ConverterCategory;
  inputFormats: string[];      // accepted extensions
  outputFormat: string;
  inputMode: InputMode;
  endpoint: string;            // FastAPI route
  description: string;
  options?: ConverterOption[];
  popular?: boolean;           // featured on homepage
};
```

---

## All 200+ Converters — Full Registry

### Image (42 tools)
- HEIC→WebP, HEIC→JPG, HEIC→PNG
- WebP→PNG, WebP→JPG, WebP→GIF
- PNG→JPG, PNG→WebP, PNG→GIF, PNG→BMP, PNG→TIFF, PNG→ICO
- JPG→PNG, JPG→WebP, JPG→GIF, JPG→BMP, JPG→TIFF
- GIF→MP4, GIF→WebP, GIF→PNG
- BMP→PNG, BMP→JPG, TIFF→PDF, TIFF→JPG
- SVG→PNG, SVG→PDF, SVG→JPG
- ICO→PNG, ICO→JPG
- MP4→GIF (10s configurable)
- Image Resize, Image Compress, Image Crop (options-based)
- RAW→JPG (basic via Pillow)

### Document (26 tools)
- PDF→Word (DOCX), PDF→TXT, PDF→HTML, PDF→Images (ZIP)
- Word→PDF, Word→ODT, Word→TXT, Word→HTML
- ODT→PDF, ODT→DOCX
- PPTX→PDF, PPTX→Images (ZIP)
- HTML→PDF
- MD→PDF, MD→HTML, MD→DOCX
- TXT→PDF, RTF→PDF, RTF→DOCX
- PDF Merge (multiple PDFs → one)
- PDF Split (one PDF → multiple)
- PDF Compress
- Pages→PDF (macOS .pages via LibreOffice)
- EPUB→PDF

### Video (28 tools)
- MP4→MP3, MP4→WAV, MP4→GIF, MP4→WebM, MP4→AVI, MP4→MOV
- MOV→MP4, MOV→MP3
- AVI→MP4, AVI→MP3
- MKV→MP4, MKV→MP3
- WebM→MP4, WebM→MP3
- FLV→MP4, WMV→MP4
- URL→MP4 (yt-dlp), URL→MP3 (yt-dlp), URL→WebM
- Video Compress (quality select), Video Trim (start+end seconds), Video Resize

### Audio (21 tools)
- MP3→WAV, MP3→FLAC, MP3→OGG, MP3→AAC, MP3→M4A
- WAV→MP3, WAV→FLAC, WAV→OGG
- FLAC→MP3, FLAC→WAV, FLAC→OGG
- OGG→MP3, OGG→WAV
- AAC→MP3, AAC→WAV
- M4A→MP3, M4A→WAV
- WMA→MP3
- Audio Trim (start+end), Audio Merge (multiple → one), Audio Compress

### Spreadsheet (8 tools)
- CSV→Excel (XLSX), CSV→JSON, CSV→HTML table
- Excel→CSV, Excel→PDF, Excel→JSON
- ODS→XLSX, XLSX→ODS

### Presentation (11 tools)
- PPTX→PDF, PPTX→Images ZIP, PPTX→HTML
- PPT→PPTX, PPT→PDF
- ODP→PPTX, ODP→PDF
- KEY→PDF (LibreOffice)
- PDF→PPTX (basic)
- PPTX Compress, PPTX Merge

### eBook (22 tools)
- EPUB→MOBI, EPUB→PDF, EPUB→TXT, EPUB→HTML, EPUB→DOCX
- MOBI→EPUB, MOBI→PDF
- AZW3→EPUB, AZW3→MOBI
- FB2→EPUB, FB2→PDF
- LIT→EPUB, PRC→EPUB
- HTML→EPUB, DOCX→EPUB, TXT→EPUB, PDF→EPUB
- EPUB Metadata Editor, EPUB Split, EPUB Merge

### Archive (30 tools)
- ZIP→Extract, ZIP→TAR.GZ, ZIP→7Z
- RAR→Extract, RAR→ZIP
- 7Z→Extract, 7Z→ZIP
- TAR→Extract, TAR.GZ→Extract, TAR.BZ2→Extract
- Create ZIP (from multiple files), Create TAR.GZ, Create 7Z
- Archive Inspect (list contents without extracting)

### Vector (10 tools)
- SVG→PDF, SVG→PNG, SVG→EPS
- EPS→PDF, EPS→PNG, EPS→SVG
- AI→SVG, AI→PDF (via Inkscape CLI)
- PDF→SVG
- SVG Optimize (minify)

### CAD (9 tools)
- DXF→PNG, DXF→SVG, DXF→PDF
- DWG→DXF (open proxy via ezdxf)
- STL→OBJ (3D via numpy-stl)
- OBJ→STL
- DXF Inspect (geometry viewer)
- SVG→DXF

### Font (5 tools)
- TTF→OTF, TTF→WOFF, TTF→WOFF2
- OTF→TTF, OTF→WOFF
- WOFF→TTF

### Code & Data (14 tools)
- JSON Formatter / Minifier
- JSON→CSV, JSON→XML, JSON→YAML
- CSV→JSON, XML→JSON, YAML→JSON
- Base64 Encode (text + file), Base64 Decode
- SVG→Code viewer, Code→SVG renderer
- HTML Formatter, HTML→PDF

### Hash (checksums — browser-side, no backend)
- MD5, SHA-1, SHA-256, SHA-512 — file input, computed in browser via Web Crypto API

---

## Phase Breakdown

---

## Phase 1 — Project Bootstrap + Design System + Layout Shell

### Goals
- Initialize Next.js 14 App Router with TypeScript + Tailwind v3
- Self-host Bebas Neue + Inter via `next/font/local`
- Wire all design tokens into `tailwind.config.ts`
- Build Navbar (dark), Footer (dark), PageWrapper
- Stub all routes

### Tailwind Config Extension
```typescript
// tailwind.config.ts
extend: {
  colors: {
    ink: '#0E0F11',
    'ink-2': '#1C1D20',
    blue: { DEFAULT: '#0066FF', dim: '#E8F0FF', dark: '#003DB5' },
    surface: '#F5F5F7',
    border: '#E2E2E6',
    muted: '#6B6E7A',
  },
  fontFamily: {
    display: ['Bebas Neue', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
  },
  borderRadius: {
    DEFAULT: '3px',
    none: '0px',
  }
}
```

### Navbar Spec
- `bg-ink` full-width. Height: 52px. `0px` border-radius globally.
- Logo: blue `0px` square mark + "Convert**Hub**" wordmark (Hub in blue)
- Nav links: Tools, Docs, Formats — white/45% opacity, hover to full white
- Right: "Self-host" ghost button (white outline) + "Get Started" solid blue

### Footer Spec
- `bg-ink`, 5-column grid: Brand | Tools | More Tools | Docs | Project
- Bottom strip: "Open source. Free forever." left — "Built by Lazan" right

### Deliverables
- [ ] `next.config.ts`, `tailwind.config.ts`, `globals.css`
- [ ] Fonts loaded and applied
- [ ] `Navbar.tsx` — full spec above
- [ ] `Footer.tsx` — full spec above
- [ ] `PageWrapper.tsx`
- [ ] All route files stubbed (homepage, tools, category, converter, formats)
- [ ] `Button.tsx`, `Badge.tsx`, `SectionEyebrow.tsx`, `Spinner.tsx`
- [ ] `converters.config.ts` — master registry with all tools defined (no logic, just data)

---

## Phase 2 — Homepage (Static)

### Goals
Build the complete homepage with all sections. All data from `converters.config.ts`. No API calls.

### Section Order
1. `Hero` — dark bg, H1 ("Convert any file. No limits."), subtext, format pills, `FormatWidget` right
2. `DropzoneHero` — dark bg continuation, centered dropzone with Select Files + Paste URL
3. `CategoryGrid` — light bg, eyebrow, 2-col stats (200+ formats, 13 categories, ∞ daily), 12 category chips, dark format tag cloud
4. `FeaturesGrid` — white bg, 4-cell grid, numbered 01–04
5. `BatchShowcase` — light bg, left text + right queue panel mockup (static)
6. `StatBar` — dark strip: 200+ | 13 | ∞ | $0 | 100%
7. Footer

### Hero H1 Treatment
```tsx
<h1 className="font-display text-[52px] leading-[1.0] tracking-[-1px] text-white">
  Convert<br/>any file.<br/>
  <span className="text-blue">No limits.</span>
</h1>
```

### FormatWidget
- Dark card (`bg-ink-2`, `border border-white/10`, `rounded-none`)
- Two format boxes (input + output) with arrow divider
- Each box: icon + format name + category type
- "Select files" CTA button (blue) + chevron for format switch

### Deliverables
- [ ] Full homepage built, static data only
- [ ] All 6 sections rendered correctly
- [ ] `FormatWidget` showing PDF→DOCX default
- [ ] Category chips with counts from config
- [ ] Fully responsive — mobile collapses hero to single column, hides FormatWidget, stacks sections

---

## Phase 3 — Category Pages + Converter Tool Grid

### Goals
- `/[category]` page for all 13 categories
- Tool cards in a responsive grid
- Category header with eyebrow, title, count, short description
- Tools filterable by input/output format (client-side)

### Category Page Layout
```
[Navbar]
[Dark header strip — category name + count + description]
[Light body]
  [Search input + format filter row]
  [Tool grid — repeat(auto-fill, minmax(200px, 1fr))]
[Footer]
```

### Tool Card Spec
```tsx
// ConverterCard.tsx
<div className="bg-white border border-border rounded-[3px] p-4 hover:border-blue cursor-pointer transition-colors">
  <div className="flex items-center gap-2 mb-3">
    <div className="w-8 h-8 bg-blue-dim flex items-center justify-content-center rounded-none">
      <Icon size={16} className="text-blue-dark" />
    </div>
    <div>
      <div className="text-[13px] font-medium text-text">{tool.name}</div>
      <div className="text-[11px] text-muted">{tool.inputFormats.join(', ')} → .{tool.outputFormat}</div>
    </div>
  </div>
  <p className="text-[12px] text-muted leading-relaxed mb-3">{tool.description}</p>
  <div className="flex items-center justify-between">
    <span className="text-[11px] text-muted">{tool.inputMode === 'url' ? 'URL input' : 'File upload'}</span>
    <span className="text-[12px] font-medium text-blue">Convert →</span>
  </div>
</div>
```

### Deliverables
- [ ] All 13 category pages routing and rendering
- [ ] Search/filter client-side by format string
- [ ] Tool grid responsive (2 cols mobile, 3 tablet, 4 desktop)
- [ ] Back navigation to homepage
- [ ] Tool count in category header

---

## Phase 4 — Converter Pages: File Upload + Batch Queue (Mock Mode)

### Goals
Build every individual converter page. This is the core UX — file drop, options, queue, download. All powered by mock responses in this phase — no real API.

### Converter Page Layout
```
[Navbar]
[Breadcrumb: Category → Tool Name]
[Dark header: Tool name + description + input→output badge]
[Light body:]
  [Left 2/3: FileDropzone + ConversionOptions]
  [Right 1/3: BatchQueue panel]
[Footer]
```

### FileDropzone Spec (`FileDropzone.tsx`)
- Dashed border (`border-dashed border-2 border-border`), hover: `border-blue`
- Accepts multiple files — `multiple` attribute on hidden input
- Drag state: border turns solid blue, bg `bg-blue-dim/20`
- Shows accepted formats below the drop area
- "Browse files" button (ghost) + "Paste URL" button (ghost) side by side
- On file select → immediately adds to `BatchQueue`

### BatchQueue Spec (`BatchQueue.tsx`)
```
[Queue header: "X files · Y done" + "Clear all" button]
[File list — each row:]
  [File type icon]  [filename + size + "→ .{output}"]  [progress bar + %]  [Download / Queued]
[Footer: "X of Y ready · Z MB total" + "Download all as .zip" button]
```

Queue states per file:
- `idle` → grey bar, "Queued" label
- `uploading` → blue bar animating 0→50%, "Uploading..."
- `converting` → blue bar animating 50→99%, "Converting..."
- `done` → green bar 100%, "Done", individual download link appears
- `error` → red bar, error message, "Retry" button

### ConversionOptions Spec (`ConversionOptions.tsx`)
Rendered only when `tool.options` is non-empty. Collapsible panel.
```
[Options ▾]   ← toggle
  Quality:  [────────●──] 85   (range, 1–100)
  DPI:      [150 ▾]            (select: 72, 96, 150, 300)
  Page range: [1] to [end]     (number inputs)
```

### Mock Convert Function
```typescript
// /lib/mockConvert.ts
export async function mockConvert(
  file: File,
  outputFormat: string,
  onProgress: (phase: 'upload' | 'convert', pct: number) => void
): Promise<{ filename: string; size: number; blobUrl: string }> {
  // Simulate upload: 0→50% over 600ms
  for (let i = 0; i <= 10; i++) {
    await delay(60);
    onProgress('upload', i * 5);
  }
  // Simulate convert: 50→99% over 1200ms
  for (let i = 0; i <= 10; i++) {
    await delay(120);
    onProgress('convert', 50 + i * 4.9);
  }
  return {
    filename: file.name.replace(/\.[^.]+$/, '') + '.' + outputFormat,
    size: Math.round(file.size * 0.72),
    blobUrl: '#mock'
  };
}
```

### Deliverables
- [ ] `ConverterShell.tsx` — shared wrapper for all converter pages
- [ ] `FileDropzone.tsx` — multi-file, drag-and-drop, URL paste mode
- [ ] `BatchQueue.tsx` — full queue with all states
- [ ] `ConversionOptions.tsx` — collapsible, renders options from config
- [ ] `ConversionResult.tsx` — individual file download card
- [ ] `ProgressBar.tsx` — two-phase animated bar
- [ ] All 200+ converter pages routing via `[category]/[tool]` dynamic segment
- [ ] Mock flow fully working end-to-end

---

## Phase 5 — URL Converters + Text/Code Tools + Browser-Side Tools

### Goals
- URL-mode converters (YouTube URL → MP4/MP3): paste input, convert button, queue entry
- Text/code converters: textarea input + output (JSON Formatter, Base64, SVG↔Code)
- Markdown Previewer: split-pane live render (react-markdown, browser-only)
- Hash tools (MD5, SHA-256, etc.): file input, computed in browser via Web Crypto API — zero backend
- Archive Inspect: list zip/tar contents in browser via jszip

### URL Converter Page
```
[Paste URL input — full width, placeholder: "https://youtube.com/..."]
[Detected format badge] → [output format badge]
[Convert button]
[BatchQueue — same component, URL entries look slightly different]
```

### Markdown Previewer (browser-only, zero API)
- Split pane: left textarea | right `react-markdown` render
- Toolbar: Upload .md file | Export to PDF (triggers backend) | Copy HTML
- Real-time sync

### Hash Tools (browser-only)
```typescript
const hash = async (file: File, algorithm: 'SHA-256' | 'SHA-1' | 'MD5') => {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest(algorithm, buffer);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
};
```

### Deliverables
- [ ] `UrlInput.tsx` — URL paste with format detection
- [ ] `TextareaConverter.tsx` — side-by-side input/output
- [ ] `MarkdownPreview.tsx` — live split pane
- [ ] Hash tool pages (browser-only, no backend needed)
- [ ] Archive Inspect (jszip, browser-only)
- [ ] SVG Code viewer (textarea + SVG render preview)

---

## Phase 6 — Real API Integration (Replace Mocks)

### Goals
Replace all mock functions with real Axios calls to FastAPI backend.

### API Client (`/lib/api.ts`)
```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  timeout: 180_000,
});

export async function convertFile(
  endpoint: string,
  file: File,
  options: Record<string, string | number> = {},
  onProgress?: (phase: 'upload' | 'convert', pct: number) => void
): Promise<Blob> {
  const form = new FormData();
  form.append('file', file);
  Object.entries(options).forEach(([k, v]) => form.append(k, String(v)));

  const res = await client.post(endpoint, form, {
    responseType: 'blob',
    onUploadProgress: e => {
      if (onProgress && e.total)
        onProgress('upload', Math.round((e.loaded / e.total) * 50));
    },
  });

  onProgress?.('convert', 100);
  return res.data;
}

export async function convertUrl(
  endpoint: string,
  url: string,
  options: Record<string, string | number> = {}
): Promise<Blob> {
  const res = await client.post(endpoint, { url, ...options }, { responseType: 'blob' });
  return res.data;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
```

### Batch Download (zip)
```typescript
// Uses jszip on the client to bundle all done blobs
import JSZip from 'jszip';

export async function downloadBatchAsZip(items: { blob: Blob; filename: string }[]) {
  const zip = new JSZip();
  items.forEach(({ blob, filename }) => zip.file(filename, blob));
  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, 'converted_files.zip');
}
```

### Deliverables
- [ ] `api.ts` complete with file + URL + batch zip
- [ ] All mock calls replaced with real endpoints
- [ ] `.env.local` with `NEXT_PUBLIC_API_URL`
- [ ] Error states from real API shown in queue
- [ ] Conversion options passed as form fields

---

## Phase 7 — Polish, History, Responsive Finalization

### Goals
- Mobile responsive audit (all pages)
- Toast system (success / error / warning, top-right, auto-dismiss 4s)
- Conversion history in localStorage (last 20, metadata only)
- `/formats` directory page: A–Z searchable table of all formats
- SEO: `<title>`, `<meta description>` per converter page
- 404 and error pages
- Accessibility pass (tab order, ARIA labels, focus rings in blue)
- Performance: `next/image`, lazy imports for heavy components

### Conversion History Schema
```typescript
type ConversionRecord = {
  id: string;         // uuid
  toolId: string;     // e.g. 'pdf-to-word'
  toolName: string;
  inputFilename: string;
  outputFilename: string;
  timestamp: number;
  status: 'success' | 'error';
};
```

### Responsive Breakpoints
- Mobile (<640px): hero single-column, FormatWidget hidden, 2-col cat grid, 1-col tool grid
- Tablet (640–1024px): 2-col cat grid, 2-col tool grid, batch queue below dropzone
- Desktop (>1024px): full layout as designed

### Deliverables
- [ ] `Toast.tsx` + toast context provider
- [ ] History panel component + `history.ts` localStorage util
- [ ] `/formats` page with A–Z searchable table
- [ ] SEO metadata per page
- [ ] 404 page
- [ ] Full responsive pass on all pages
- [ ] Accessibility audit

---

## Phase Summary

| Phase | Focus | Mock/Real |
|---|---|---|
| 1 | Setup, design tokens, layout shell | — |
| 2 | Full homepage (static) | Static data |
| 3 | Category pages + tool grid | Static data |
| 4 | Converter pages, batch queue, options | Mock API |
| 5 | URL, text, browser-side tools | Mock + Browser |
| 6 | Real FastAPI wiring | Real API |
| 7 | Polish, history, SEO, a11y | — |

---

*Source of truth for all frontend execution. Execute one phase at a time. Stop and report after each phase. Await explicit "Yes, Proceed" before advancing.*
