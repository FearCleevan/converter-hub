# BACKEND_IMPLEMENTATION.md
# ConvertHub — Universal Self-Hosted File Converter
# Backend Implementation Plan (Python 3.11 + FastAPI)
# Version 2.0 — Full 13-Category Scope

---

## Overview

A self-hosted FastAPI backend handling 200+ file conversions across 13 format categories. Zero paid services. Zero rate limits. Every library is open-source. Runs on your own machine or any VPS.

---

## Tech Stack

### Runtime
- Python 3.11+
- FastAPI (async REST API)
- Uvicorn (ASGI server)
- python-multipart (file upload)
- aiofiles (async file I/O)
- python-dotenv (env config)
- APScheduler (temp cleanup cron)

### Per-Category Libraries

| Category | Library | Notes |
|---|---|---|
| Image | `Pillow`, `pillow-heif`, `cairosvg` | HEIC support via pillow-heif |
| Video | `ffmpeg` (subprocess), `yt-dlp` | System deps |
| Audio | `ffmpeg` (subprocess) | Same binary as video |
| Document | `pdf2docx`, `LibreOffice headless`, `WeasyPrint`, `Markdown`, `PyMuPDF` | LibreOffice for .docx/.pptx→PDF |
| Spreadsheet | `openpyxl`, `pandas` | CSV↔Excel, JSON, HTML |
| Presentation | `LibreOffice headless`, `python-pptx` | PPTX inspect + merge |
| eBook | `calibre` CLI (`ebook-convert`) | Most comprehensive ebook tool |
| Archive | `patool`, `py7zr`, `zipfile` stdlib | Extract + create ZIP/7Z/TAR |
| Vector | `cairosvg`, `Inkscape` CLI | EPS/AI→SVG via Inkscape |
| CAD | `ezdxf`, `numpy-stl` | DXF read/write, STL↔OBJ |
| Font | `fonttools` | TTF↔OTF↔WOFF↔WOFF2 |
| Code & Data | `json`, `csv`, `pyyaml`, `xmltodict` stdlib+light | JSON↔CSV↔XML↔YAML |
| Hash | N/A — computed browser-side via Web Crypto API | No backend endpoint needed |

### System Dependencies (install separately)
```bash
# Ubuntu/Debian
apt-get install -y ffmpeg libreoffice libcairo2-dev libpango1.0-dev \
                   poppler-utils inkscape calibre

# pip install yt-dlp   (CLI tool, Python package)
```

---

## Project Structure

```
/backend
  main.py                         → App entry, CORS, router registration, health
  requirements.txt
  .env

  /routers
    image.py                      → /api/image/*
    video.py                      → /api/video/*
    audio.py                      → /api/audio/*
    document.py                   → /api/document/*
    spreadsheet.py                → /api/spreadsheet/*
    presentation.py               → /api/presentation/*
    ebook.py                      → /api/ebook/*
    archive.py                    → /api/archive/*
    vector.py                     → /api/vector/*
    cad.py                        → /api/cad/*
    font.py                       → /api/font/*
    code_data.py                  → /api/code/*

  /services
    image_service.py
    ffmpeg_service.py
    ytdlp_service.py
    document_service.py
    spreadsheet_service.py
    presentation_service.py
    ebook_service.py
    archive_service.py
    vector_service.py
    cad_service.py
    font_service.py
    code_service.py

  /utils
    file_utils.py                 → Temp paths, UUID naming, cleanup, size validation
    response_utils.py             → FileResponse + BackgroundTask cleanup
    errors.py                     → HTTP error helpers
    platform_utils.py             → LibreOffice/Inkscape path detection (Win/Mac/Linux)
    zip_utils.py                  → Bundle multiple output files into a ZIP

  /temp                           → Auto-cleaned working directory (gitignored)
```

---

## Core Utilities (shared across all phases)

### Temp File Management (`/utils/file_utils.py`)
```python
import uuid, os
from pathlib import Path
from fastapi import HTTPException, UploadFile

TEMP_DIR = Path(os.getenv("TEMP_DIR", "temp"))
TEMP_DIR.mkdir(exist_ok=True)
MAX_MB = int(os.getenv("MAX_FILE_SIZE_MB", 500))

def temp_path(ext: str) -> Path:
    return TEMP_DIR / f"{uuid.uuid4().hex}.{ext}"

async def save_upload(file: UploadFile, ext: str) -> Path:
    content = await file.read()
    mb = len(content) / 1_048_576
    if mb > MAX_MB:
        raise HTTPException(413, f"File too large ({mb:.1f} MB). Max: {MAX_MB} MB.")
    path = temp_path(ext)
    path.write_bytes(content)
    return path

async def cleanup(*paths: Path):
    for p in paths:
        try: p.unlink()
        except: pass
```

### Response Helper (`/utils/response_utils.py`)
```python
from fastapi import BackgroundTask
from fastapi.responses import FileResponse
from pathlib import Path

def file_response(path: Path, media_type: str, filename: str, *cleanup_paths: Path):
    return FileResponse(
        path,
        media_type=media_type,
        filename=filename,
        background=BackgroundTask(cleanup, path, *cleanup_paths)
    )
```

### ZIP Bundle (`/utils/zip_utils.py`)
```python
import zipfile
from pathlib import Path

def bundle_to_zip(files: list[tuple[Path, str]], output_path: Path):
    """files = list of (path, filename_in_zip)"""
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for path, name in files:
            zf.write(path, name)
```

### Endpoint Pattern (used across ALL routers)
```python
@router.post("/heic-to-webp")
async def heic_to_webp(file: UploadFile = File(...)):
    input_path = await save_upload(file, "heic")
    output_path = temp_path("webp")
    try:
        image_service.convert(input_path, output_path, "webp")
    except Exception as e:
        await cleanup(input_path, output_path)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(output_path, "image/webp", f"{stem}.webp", input_path)
```

---

## Phase 1 — Project Setup + Core Utilities

### Goals
- Python venv, all dependencies installed
- FastAPI app with CORS
- All utility modules built and tested
- `/health` endpoint

### main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import image, video, audio, document, spreadsheet
from routers import presentation, ebook, archive, vector, cad, font, code_data

app = FastAPI(title="ConvertHub API", version="2.0.0")

app.add_middleware(CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["*"], allow_headers=["*"])

for router, prefix in [
    (image.router, "/api/image"),
    (video.router, "/api/video"),
    (audio.router, "/api/audio"),
    (document.router, "/api/document"),
    (spreadsheet.router, "/api/spreadsheet"),
    (presentation.router, "/api/presentation"),
    (ebook.router, "/api/ebook"),
    (archive.router, "/api/archive"),
    (vector.router, "/api/vector"),
    (cad.router, "/api/cad"),
    (font.router, "/api/font"),
    (code_data.router, "/api/code"),
]:
    app.include_router(router, prefix=prefix)

@app.get("/health")
def health(): return {"status": "ok", "version": "2.0.0"}
```

### Global Exception Handler
```python
@app.exception_handler(Exception)
async def catch_all(request, exc):
    logger.error(f"Unhandled: {exc}", exc_info=True)
    return JSONResponse(500, {"error": "Conversion failed", "detail": str(exc)})
```

### Deliverables
- [ ] venv + `requirements.txt` (all pinned)
- [ ] `main.py` with CORS + all routers registered
- [ ] All utility modules (`file_utils`, `response_utils`, `errors`, `platform_utils`, `zip_utils`)
- [ ] `GET /health` returns 200
- [ ] Server runs: `uvicorn main:app --reload --port 8000`

---

## Phase 2 — Image Conversions (42 endpoints)

### Service (`/services/image_service.py`)
```python
from PIL import Image
import pillow_heif, cairosvg

pillow_heif.register_heif_opener()

FORMAT_MEDIA = {
    "webp": "image/webp", "png": "image/png",
    "jpg": "image/jpeg", "gif": "image/gif",
    "bmp": "image/bmp", "tiff": "image/tiff",
    "ico": "image/x-icon",
}

def convert(input_path, output_path, fmt, quality=85):
    with Image.open(input_path) as img:
        if fmt.lower() in ("jpg","jpeg") and img.mode in ("RGBA","P","LA"):
            img = img.convert("RGB")
        if fmt.lower() == "gif":
            img.save(output_path, format="GIF", save_all=False)
        else:
            img.save(output_path, format=fmt.upper(), quality=quality)

def svg_to_raster(svg_path, output_path, fmt, scale=2.0, dpi=150):
    if fmt == "png":
        cairosvg.svg2png(url=str(svg_path), write_to=str(output_path), scale=scale)
    elif fmt == "pdf":
        cairosvg.svg2pdf(url=str(svg_path), write_to=str(output_path))

def resize(input_path, output_path, width, height, maintain_ratio=True, quality=85):
    with Image.open(input_path) as img:
        img.thumbnail((width, height), Image.LANCZOS) if maintain_ratio \
            else img.resize((width, height), Image.LANCZOS)
        img.save(output_path, quality=quality)

def compress(input_path, output_path, quality=60):
    with Image.open(input_path) as img:
        img.save(output_path, quality=quality, optimize=True)
```

### Options Supported
- `quality` (1–100, default 85) — JPEG/WebP output
- `scale` (1.0–4.0) — SVG→PNG scale factor
- `width`, `height`, `maintain_ratio` — Resize tool
- `dpi` (72/96/150/300) — raster output DPI

### All 42 Endpoints
```
POST /api/image/heic-to-webp
POST /api/image/heic-to-jpg
POST /api/image/heic-to-png
POST /api/image/webp-to-png
POST /api/image/webp-to-jpg
POST /api/image/webp-to-gif
POST /api/image/png-to-jpg
POST /api/image/png-to-webp
POST /api/image/png-to-gif
POST /api/image/png-to-bmp
POST /api/image/png-to-tiff
POST /api/image/png-to-ico
POST /api/image/jpg-to-png
POST /api/image/jpg-to-webp
POST /api/image/jpg-to-gif
POST /api/image/jpg-to-bmp
POST /api/image/jpg-to-tiff
POST /api/image/gif-to-mp4
POST /api/image/gif-to-webp
POST /api/image/gif-to-png
POST /api/image/bmp-to-png
POST /api/image/bmp-to-jpg
POST /api/image/tiff-to-jpg
POST /api/image/tiff-to-pdf
POST /api/image/svg-to-png
POST /api/image/svg-to-pdf
POST /api/image/svg-to-jpg
POST /api/image/ico-to-png
POST /api/image/ico-to-jpg
POST /api/image/mp4-to-gif   → calls ffmpeg_service
POST /api/image/resize        → body: width, height, maintain_ratio
POST /api/image/compress      → body: quality
```

### Deliverables
- [ ] `/routers/image.py` — all 32 endpoints (others handled in video router)
- [ ] `/services/image_service.py` — full implementation
- [ ] HEIC opener registered globally
- [ ] RGBA→RGB guard for JPG output
- [ ] All endpoints manually tested

---

## Phase 3 — Video, Audio, URL Download (49 endpoints)

### FFmpeg Service (`/services/ffmpeg_service.py`)
```python
import subprocess
from pathlib import Path

def run(args, timeout=300):
    r = subprocess.run(["ffmpeg","-y",*args], capture_output=True, text=True, timeout=timeout)
    if r.returncode != 0:
        raise RuntimeError(r.stderr[-500:])

# Video
def mp4_to_mp3(inp, out, bitrate="192k"):
    run(["-i",str(inp),"-vn","-ab",bitrate,"-ar","44100",str(out)])

def mp4_to_wav(inp, out):
    run(["-i",str(inp),"-vn","-acodec","pcm_s16le",str(out)])

def mp4_to_webm(inp, out, crf=33):
    run(["-i",str(inp),"-c:v","libvpx-vp9","-crf",str(crf),"-b:v","0","-c:a","libopus",str(out)])

def mp4_to_gif(inp, out, start=0, duration=10, fps=12, scale=480):
    palette = temp_path("png")
    run(["-ss",str(start),"-t",str(duration),"-i",str(inp),
         "-vf",f"fps={fps},scale={scale}:-1:flags=lanczos,palettegen",str(palette)])
    run(["-ss",str(start),"-t",str(duration),"-i",str(inp),"-i",str(palette),
         "-filter_complex",f"fps={fps},scale={scale}:-1:flags=lanczos[x];[x][1:v]paletteuse",
         "-loop","0",str(out)])
    palette.unlink()

def video_compress(inp, out, crf=28):
    run(["-i",str(inp),"-c:v","libx264","-crf",str(crf),"-preset","medium","-c:a","copy",str(out)])

def video_trim(inp, out, start, end):
    run(["-ss",str(start),"-to",str(end),"-i",str(inp),"-c","copy",str(out)])

def video_resize(inp, out, width, height):
    run(["-i",str(inp),"-vf",f"scale={width}:{height}","-c:a","copy",str(out)])

# Audio
def any_to_mp3(inp, out, bitrate="192k"):
    run(["-i",str(inp),"-ab",bitrate,"-ar","44100",str(out)])

def any_to_wav(inp, out):
    run(["-i",str(inp),"-acodec","pcm_s16le",str(out)])

def any_to_flac(inp, out):
    run(["-i",str(inp),"-c:a","flac",str(out)])

def any_to_ogg(inp, out, quality=5):
    run(["-i",str(inp),"-c:a","libvorbis","-q:a",str(quality),str(out)])

def any_to_aac(inp, out, bitrate="192k"):
    run(["-i",str(inp),"-c:a","aac","-b:a",bitrate,str(out)])

def audio_trim(inp, out, start, end):
    run(["-ss",str(start),"-to",str(end),"-i",str(inp),"-c","copy",str(out)])
```

### yt-dlp Service (`/services/ytdlp_service.py`)
```python
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

executor = ThreadPoolExecutor(max_workers=4)

def _dl_mp4(url, path):
    subprocess.run(["yt-dlp","-f","bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4","-o",str(path),url],
                   check=True, timeout=600)

def _dl_mp3(url, path):
    subprocess.run(["yt-dlp","-x","--audio-format","mp3","--audio-quality","0","-o",str(path),url],
                   check=True, timeout=600)

def _dl_webm(url, path):
    subprocess.run(["yt-dlp","-f","bestvideo[ext=webm]+bestaudio[ext=webm]/webm","-o",str(path),url],
                   check=True, timeout=600)

async def download_mp4(url, path): await asyncio.get_event_loop().run_in_executor(executor, _dl_mp4, url, path)
async def download_mp3(url, path): await asyncio.get_event_loop().run_in_executor(executor, _dl_mp3, url, path)
async def download_webm(url, path): await asyncio.get_event_loop().run_in_executor(executor, _dl_webm, url, path)
```

### Endpoints
```
POST /api/video/mp4-to-mp3         body: bitrate (optional)
POST /api/video/mp4-to-wav
POST /api/video/mp4-to-gif         body: start, duration, fps, scale
POST /api/video/mp4-to-webm
POST /api/video/mp4-to-avi
POST /api/video/mp4-to-mov
POST /api/video/mov-to-mp4
POST /api/video/mov-to-mp3
POST /api/video/avi-to-mp4
POST /api/video/avi-to-mp3
POST /api/video/mkv-to-mp4
POST /api/video/mkv-to-mp3
POST /api/video/webm-to-mp4
POST /api/video/webm-to-mp3
POST /api/video/flv-to-mp4
POST /api/video/wmv-to-mp4
POST /api/video/compress           body: crf (18-51)
POST /api/video/trim               body: start_sec, end_sec
POST /api/video/resize             body: width, height
POST /api/video/url-to-mp4         body: url (JSON)
POST /api/video/url-to-mp3         body: url (JSON)
POST /api/video/url-to-webm        body: url (JSON)
POST /api/audio/mp3-to-wav
POST /api/audio/mp3-to-flac
POST /api/audio/mp3-to-ogg
POST /api/audio/mp3-to-aac
POST /api/audio/mp3-to-m4a
POST /api/audio/wav-to-mp3
POST /api/audio/wav-to-flac
POST /api/audio/wav-to-ogg
POST /api/audio/flac-to-mp3
POST /api/audio/flac-to-wav
POST /api/audio/flac-to-ogg
POST /api/audio/ogg-to-mp3
POST /api/audio/ogg-to-wav
POST /api/audio/aac-to-mp3
POST /api/audio/aac-to-wav
POST /api/audio/m4a-to-mp3
POST /api/audio/m4a-to-wav
POST /api/audio/wma-to-mp3
POST /api/audio/trim               body: start_sec, end_sec
POST /api/audio/compress           body: bitrate
```

### Deliverables
- [ ] `/routers/video.py` + `/routers/audio.py`
- [ ] `/services/ffmpeg_service.py` — all wrappers
- [ ] `/services/ytdlp_service.py` — async executor
- [ ] GIF palette generation (two-pass, quality output)
- [ ] All endpoints tested with real files + real URLs

---

## Phase 4 — Document, Spreadsheet, Presentation (45 endpoints)

### Document Service (`/services/document_service.py`)
```python
from pdf2docx import Converter as PDFToDocx
from markdown import markdown
from weasyprint import HTML
import subprocess
from pathlib import Path
import fitz  # PyMuPDF

def pdf_to_word(inp, out):
    cv = PDFToDocx(str(inp))
    cv.convert(str(out)); cv.close()

def office_to_pdf(inp, output_dir) -> Path:
    libreoffice = get_libreoffice_path()
    subprocess.run([libreoffice,"--headless","--convert-to","pdf","--outdir",str(output_dir),str(inp)],
                   check=True, timeout=120)
    return output_dir / (inp.stem + ".pdf")

def html_to_pdf(html_str, out):
    HTML(string=html_str).write_pdf(str(out))

def md_to_pdf(md_text, out):
    body = markdown(md_text, extensions=["tables","fenced_code","toc","nl2br"])
    css = "body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:2rem;line-height:1.6}"
    html_to_pdf(f"<style>{css}</style><body>{body}</body>", out)

def pdf_to_images_zip(inp, output_zip, dpi=150):
    doc = fitz.open(str(inp))
    img_paths = []
    for i, page in enumerate(doc):
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat)
        p = temp_path("png"); pix.save(str(p)); img_paths.append((p, f"page_{i+1}.png"))
    bundle_to_zip(img_paths, output_zip)
    for p, _ in img_paths: p.unlink()

def pdf_merge(input_paths, out):
    doc = fitz.open()
    for p in input_paths:
        src = fitz.open(str(p)); doc.insert_pdf(src); src.close()
    doc.save(str(out)); doc.close()

def pdf_split(inp, output_zip, page_ranges=None):
    doc = fitz.open(str(inp))
    parts = []; 
    for i, page in enumerate(doc):
        out_p = temp_path("pdf"); out_doc = fitz.open()
        out_doc.insert_pdf(doc, from_page=i, to_page=i)
        out_doc.save(str(out_p)); out_doc.close()
        parts.append((out_p, f"page_{i+1}.pdf"))
    bundle_to_zip(parts, output_zip)
    for p, _ in parts: p.unlink()
```

### Endpoints
```
POST /api/document/pdf-to-word
POST /api/document/pdf-to-txt
POST /api/document/pdf-to-html
POST /api/document/pdf-to-images
POST /api/document/pdf-merge           body: multiple files
POST /api/document/pdf-split
POST /api/document/pdf-compress
POST /api/document/word-to-pdf
POST /api/document/word-to-odt
POST /api/document/word-to-txt
POST /api/document/word-to-html
POST /api/document/odt-to-pdf
POST /api/document/odt-to-docx
POST /api/document/html-to-pdf         body: html string or file
POST /api/document/md-to-pdf           body: markdown text or .md file
POST /api/document/md-to-html
POST /api/document/md-to-docx
POST /api/document/txt-to-pdf
POST /api/document/rtf-to-pdf
POST /api/document/rtf-to-docx
POST /api/document/epub-to-pdf         → ebook router handles
POST /api/spreadsheet/csv-to-excel
POST /api/spreadsheet/csv-to-json
POST /api/spreadsheet/csv-to-html
POST /api/spreadsheet/excel-to-csv
POST /api/spreadsheet/excel-to-pdf
POST /api/spreadsheet/excel-to-json
POST /api/spreadsheet/ods-to-xlsx
POST /api/spreadsheet/xlsx-to-ods
POST /api/presentation/pptx-to-pdf
POST /api/presentation/pptx-to-images
POST /api/presentation/pptx-to-html
POST /api/presentation/ppt-to-pptx
POST /api/presentation/ppt-to-pdf
POST /api/presentation/odp-to-pptx
POST /api/presentation/odp-to-pdf
POST /api/presentation/pdf-to-pptx    (basic — via LibreOffice)
POST /api/presentation/compress
POST /api/presentation/merge           body: multiple .pptx files
```

### Deliverables
- [ ] All three routers + services
- [ ] LibreOffice path detection (Win/Mac/Linux)
- [ ] PyMuPDF for PDF operations (faster than pypdf)
- [ ] PDF merge + split with ZIP output
- [ ] MD→PDF with styled HTML intermediate
- [ ] All tested with real documents

---

## Phase 5 — eBook, Archive, Vector, CAD, Font, Code (80+ endpoints)

### eBook Service (`calibre CLI`)
```python
def ebook_convert(inp, out, output_fmt, **kwargs):
    args = ["ebook-convert", str(inp), str(out)]
    if "title" in kwargs: args += ["--title", kwargs["title"]]
    subprocess.run(args, check=True, timeout=120)
```
Calibre's `ebook-convert` handles EPUB↔MOBI↔AZW3↔FB2↔PDF↔TXT and 20+ more.

### Archive Service (`patool` + `py7zr`)
```python
import patoollib, py7zr, zipfile

def extract(inp, output_dir):
    patoollib.extract_archive(str(inp), outdir=str(output_dir))

def create_zip(file_paths, out):
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
        for p in file_paths: zf.write(p, Path(p).name)

def create_7z(file_paths, out):
    with py7zr.SevenZipFile(out, 'w') as zf:
        for p in file_paths: zf.write(p, Path(p).name)

def inspect_zip(inp) -> list[dict]:
    with zipfile.ZipFile(inp, 'r') as zf:
        return [{"name": i.filename, "size": i.file_size,
                 "compressed": i.compress_size} for i in zf.infolist()]
```

### Vector Service (`cairosvg` + `Inkscape CLI`)
```python
def svg_to_eps(inp, out):
    subprocess.run([get_inkscape(), "--export-eps", str(out), str(inp)], check=True)

def eps_to_svg(inp, out):
    subprocess.run([get_inkscape(), "--export-plain-svg", str(out), str(inp)], check=True)

def svg_optimize(inp, out):
    # svgoptim / scour (pip install scour)
    subprocess.run(["scour", "-i", str(inp), "-o", str(out), "--enable-viewboxing",
                    "--strip-xml-prolog", "--remove-metadata"], check=True)
```

### CAD Service (`ezdxf`)
```python
import ezdxf
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
import matplotlib.pyplot as plt

def dxf_to_png(inp, out, dpi=150):
    doc = ezdxf.readfile(str(inp))
    msp = doc.modelspace()
    fig = plt.figure(); ax = fig.add_axes([0,0,1,1])
    ctx = RenderContext(doc)
    Frontend(ctx, MatplotlibBackend(ax)).draw_layout(msp)
    fig.savefig(str(out), dpi=dpi); plt.close(fig)

def dxf_to_svg(inp, out):
    doc = ezdxf.readfile(str(inp))
    msp = doc.modelspace()
    fig = plt.figure(); ax = fig.add_axes([0,0,1,1])
    ctx = RenderContext(doc)
    Frontend(ctx, MatplotlibBackend(ax)).draw_layout(msp)
    fig.savefig(str(out), format='svg'); plt.close(fig)
```

### Font Service (`fonttools`)
```python
from fontTools.ttLib import TTFont

def convert_font(inp, out, output_fmt):
    font = TTFont(str(inp))
    if output_fmt == "woff":
        font.flavor = "woff"
    elif output_fmt == "woff2":
        font.flavor = "woff2"
    else:
        font.flavor = None  # TTF/OTF
    font.save(str(out))
```

### Code & Data Service
```python
import json, csv, yaml, xmltodict

def json_format(raw, indent=2, minify=False):
    obj = json.loads(raw)
    return json.dumps(obj) if minify else json.dumps(obj, indent=indent)

def json_to_csv(raw, out):
    data = json.loads(raw)
    if isinstance(data, list) and data:
        keys = data[0].keys()
        with open(out, 'w', newline='') as f:
            w = csv.DictWriter(f, fieldnames=keys); w.writeheader(); w.writerows(data)

def json_to_yaml(raw) -> str:
    return yaml.dump(json.loads(raw), default_flow_style=False)

def csv_to_json(inp) -> str:
    rows = []
    with open(inp, newline='') as f:
        rows = list(csv.DictReader(f))
    return json.dumps(rows, indent=2)

def json_to_xml(raw) -> str:
    data = json.loads(raw); return xmltodict.unparse({"root": data}, pretty=True)

def xml_to_json(raw) -> str:
    return json.dumps(xmltodict.parse(raw), indent=2)
```

### All New Endpoints
```
POST /api/ebook/epub-to-mobi
POST /api/ebook/epub-to-pdf
POST /api/ebook/epub-to-txt
POST /api/ebook/epub-to-html
POST /api/ebook/epub-to-docx
POST /api/ebook/mobi-to-epub
POST /api/ebook/mobi-to-pdf
POST /api/ebook/azw3-to-epub
POST /api/ebook/azw3-to-mobi
POST /api/ebook/fb2-to-epub
POST /api/ebook/fb2-to-pdf
POST /api/ebook/html-to-epub
POST /api/ebook/docx-to-epub
POST /api/ebook/txt-to-epub
POST /api/ebook/pdf-to-epub

POST /api/archive/extract          body: file (ZIP/RAR/7Z/TAR)
POST /api/archive/create-zip       body: multiple files
POST /api/archive/create-7z        body: multiple files
POST /api/archive/create-tar-gz    body: multiple files
POST /api/archive/zip-to-tar
POST /api/archive/rar-to-zip
POST /api/archive/7z-to-zip
POST /api/archive/inspect          returns JSON listing
POST /api/archive/compress         body: zip file, target quality

POST /api/vector/svg-to-eps
POST /api/vector/svg-to-pdf
POST /api/vector/svg-to-png
POST /api/vector/eps-to-svg
POST /api/vector/eps-to-png
POST /api/vector/eps-to-pdf
POST /api/vector/ai-to-svg
POST /api/vector/ai-to-pdf
POST /api/vector/pdf-to-svg
POST /api/vector/svg-optimize

POST /api/cad/dxf-to-png
POST /api/cad/dxf-to-svg
POST /api/cad/dxf-to-pdf
POST /api/cad/dwg-to-dxf           (ezdxf proxy — partial support)
POST /api/cad/stl-to-obj
POST /api/cad/obj-to-stl
POST /api/cad/svg-to-dxf
POST /api/cad/inspect              returns entity summary

POST /api/font/ttf-to-otf
POST /api/font/ttf-to-woff
POST /api/font/ttf-to-woff2
POST /api/font/otf-to-ttf
POST /api/font/otf-to-woff

POST /api/code/json-format         body: { raw, indent, minify }
POST /api/code/json-to-csv
POST /api/code/json-to-yaml
POST /api/code/json-to-xml
POST /api/code/csv-to-json
POST /api/code/xml-to-json
POST /api/code/yaml-to-json
POST /api/code/base64-encode       body: text or file
POST /api/code/base64-decode       body: { encoded }
POST /api/code/svg-to-code         body: svg file → returns formatted source
POST /api/code/code-to-svg         body: { svg_code } → returns .svg file
POST /api/code/html-format         body: { raw_html }
```

### Deliverables
- [ ] All 6 new routers + services
- [ ] Calibre CLI integration (ebook)
- [ ] patool + py7zr (archive)
- [ ] Inkscape CLI detection (vector)
- [ ] ezdxf + matplotlib (CAD preview)
- [ ] fonttools (font)
- [ ] All code/data conversions
- [ ] All endpoints tested

---

## Phase 6 — Production Hardening + Docker

### .env
```env
MAX_FILE_SIZE_MB=500
TEMP_DIR=./temp
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
LIBREOFFICE_PATH=libreoffice
INKSCAPE_PATH=inkscape
CALIBRE_PATH=ebook-convert
YTDLP_MAX_WORKERS=4
```

### Temp Cleanup Cron
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import time

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job("interval", minutes=30)
def clean_temp():
    for f in TEMP_DIR.glob("*"):
        if f.is_file() and (time.time() - f.stat().st_mtime) > 3600:
            f.unlink(missing_ok=True)

@app.on_event("startup")
def start_scheduler(): scheduler.start()
```

### Dockerfile
```dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    ffmpeg libreoffice inkscape calibre \
    libcairo2-dev libpango1.0-dev poppler-utils \
    && rm -rf /var/lib/apt/lists/*

RUN pip install yt-dlp

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Deliverables
- [ ] `.env` + dotenv integration
- [ ] Global exception handler
- [ ] Structured logging with rotation
- [ ] APScheduler temp cleanup
- [ ] `Dockerfile` with all system deps
- [ ] `docker-compose.yml` (frontend + backend)
- [ ] `README.md` — setup for Windows/macOS/Linux
- [ ] Final end-to-end test of all 120+ endpoints

---

## Complete Endpoint Count

| Category | Count |
|---|---|
| Image | 32 |
| Video | 19 |
| Audio | 20 |
| Document | 20 |
| Spreadsheet | 8 |
| Presentation | 9 |
| eBook | 15 |
| Archive | 9 |
| Vector | 10 |
| CAD | 8 |
| Font | 5 |
| Code & Data | 14 |
| Hash | 0 (browser-side) |
| **Total** | **169 endpoints** |

**All free. All open-source. All self-hosted.**

---

## Phase Summary

| Phase | Category | Key Libraries |
|---|---|---|
| 1 | Core setup + utils | FastAPI, aiofiles |
| 2 | Image (32 endpoints) | Pillow, pillow-heif, cairosvg |
| 3 | Video + Audio + URL (39 endpoints) | ffmpeg, yt-dlp |
| 4 | Document + Spreadsheet + Presentation (47 endpoints) | pdf2docx, LibreOffice, WeasyPrint, PyMuPDF, openpyxl |
| 5 | eBook + Archive + Vector + CAD + Font + Code (57 endpoints) | calibre, patool, Inkscape, ezdxf, fonttools |
| 6 | Production: Docker, logging, cleanup, README | APScheduler, Docker |

---

*Source of truth for all backend execution. Execute one phase at a time. Stop and report after each phase. Await explicit "Yes, Proceed" before advancing. Frontend Phase 6 (API integration) begins only after Backend Phase 5 is complete.*
