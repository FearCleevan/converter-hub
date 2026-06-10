from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from services import ffmpeg_service, image_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["image"])


# ── HEIC ──────────────────────────────────────────────────────────────────────

@router.post("/heic-to-webp")
async def heic_to_webp(file: UploadFile = File(...), quality: int = Form(85)):
    inp = await save_upload(file, "heic")
    out = temp_path("webp")
    try:
        image_service.convert(inp, out, "webp", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/webp", f"{Path(file.filename or 'output').stem}.webp", inp)


@router.post("/heic-to-jpg")
async def heic_to_jpg(file: UploadFile = File(...), quality: int = Form(85)):
    inp = await save_upload(file, "heic")
    out = temp_path("jpg")
    try:
        image_service.convert(inp, out, "jpg", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/jpeg", f"{Path(file.filename or 'output').stem}.jpg", inp)


@router.post("/heic-to-png")
async def heic_to_png(file: UploadFile = File(...)):
    inp = await save_upload(file, "heic")
    out = temp_path("png")
    try:
        image_service.convert(inp, out, "png")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/png", f"{Path(file.filename or 'output').stem}.png", inp)


# ── WebP ──────────────────────────────────────────────────────────────────────

@router.post("/webp-to-png")
async def webp_to_png(file: UploadFile = File(...)):
    inp = await save_upload(file, "webp")
    out = temp_path("png")
    try:
        image_service.convert(inp, out, "png")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/png", f"{Path(file.filename or 'output').stem}.png", inp)


@router.post("/webp-to-jpg")
async def webp_to_jpg(file: UploadFile = File(...), quality: int = Form(85)):
    inp = await save_upload(file, "webp")
    out = temp_path("jpg")
    try:
        image_service.convert(inp, out, "jpg", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/jpeg", f"{Path(file.filename or 'output').stem}.jpg", inp)


@router.post("/webp-to-gif")
async def webp_to_gif(file: UploadFile = File(...)):
    inp = await save_upload(file, "webp")
    out = temp_path("gif")
    try:
        image_service.convert(inp, out, "gif")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/gif", f"{Path(file.filename or 'output').stem}.gif", inp)


# ── PNG ───────────────────────────────────────────────────────────────────────

@router.post("/png-to-jpg")
async def png_to_jpg(file: UploadFile = File(...), quality: int = Form(85)):
    inp = await save_upload(file, "png")
    out = temp_path("jpg")
    try:
        image_service.convert(inp, out, "jpg", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/jpeg", f"{Path(file.filename or 'output').stem}.jpg", inp)


@router.post("/png-to-webp")
async def png_to_webp(file: UploadFile = File(...), quality: int = Form(85)):
    inp = await save_upload(file, "png")
    out = temp_path("webp")
    try:
        image_service.convert(inp, out, "webp", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/webp", f"{Path(file.filename or 'output').stem}.webp", inp)


@router.post("/png-to-gif")
async def png_to_gif(file: UploadFile = File(...)):
    inp = await save_upload(file, "png")
    out = temp_path("gif")
    try:
        image_service.convert(inp, out, "gif")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/gif", f"{Path(file.filename or 'output').stem}.gif", inp)


@router.post("/png-to-bmp")
async def png_to_bmp(file: UploadFile = File(...)):
    inp = await save_upload(file, "png")
    out = temp_path("bmp")
    try:
        image_service.convert(inp, out, "bmp")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/bmp", f"{Path(file.filename or 'output').stem}.bmp", inp)


@router.post("/png-to-tiff")
async def png_to_tiff(file: UploadFile = File(...)):
    inp = await save_upload(file, "png")
    out = temp_path("tiff")
    try:
        image_service.convert(inp, out, "tiff")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/tiff", f"{Path(file.filename or 'output').stem}.tiff", inp)


@router.post("/png-to-ico")
async def png_to_ico(file: UploadFile = File(...)):
    inp = await save_upload(file, "png")
    out = temp_path("ico")
    try:
        image_service.convert(inp, out, "ico")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/x-icon", f"{Path(file.filename or 'output').stem}.ico", inp)


# ── JPEG ──────────────────────────────────────────────────────────────────────

@router.post("/jpg-to-png")
async def jpg_to_png(file: UploadFile = File(...)):
    inp = await save_upload(file, "jpg")
    out = temp_path("png")
    try:
        image_service.convert(inp, out, "png")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/png", f"{Path(file.filename or 'output').stem}.png", inp)


@router.post("/jpg-to-webp")
async def jpg_to_webp(file: UploadFile = File(...), quality: int = Form(85)):
    inp = await save_upload(file, "jpg")
    out = temp_path("webp")
    try:
        image_service.convert(inp, out, "webp", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/webp", f"{Path(file.filename or 'output').stem}.webp", inp)


@router.post("/jpg-to-gif")
async def jpg_to_gif(file: UploadFile = File(...)):
    inp = await save_upload(file, "jpg")
    out = temp_path("gif")
    try:
        image_service.convert(inp, out, "gif")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/gif", f"{Path(file.filename or 'output').stem}.gif", inp)


@router.post("/jpg-to-bmp")
async def jpg_to_bmp(file: UploadFile = File(...)):
    inp = await save_upload(file, "jpg")
    out = temp_path("bmp")
    try:
        image_service.convert(inp, out, "bmp")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/bmp", f"{Path(file.filename or 'output').stem}.bmp", inp)


@router.post("/jpg-to-tiff")
async def jpg_to_tiff(file: UploadFile = File(...)):
    inp = await save_upload(file, "jpg")
    out = temp_path("tiff")
    try:
        image_service.convert(inp, out, "tiff")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/tiff", f"{Path(file.filename or 'output').stem}.tiff", inp)


# ── GIF ───────────────────────────────────────────────────────────────────────

@router.post("/gif-to-webp")
async def gif_to_webp(file: UploadFile = File(...), quality: int = Form(85)):
    inp = await save_upload(file, "gif")
    out = temp_path("webp")
    try:
        image_service.convert(inp, out, "webp", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/webp", f"{Path(file.filename or 'output').stem}.webp", inp)


@router.post("/gif-to-png")
async def gif_to_png(file: UploadFile = File(...)):
    inp = await save_upload(file, "gif")
    out = temp_path("png")
    try:
        image_service.convert(inp, out, "png")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/png", f"{Path(file.filename or 'output').stem}.png", inp)


@router.post("/gif-to-mp4")
async def gif_to_mp4(file: UploadFile = File(...)):
    inp = await save_upload(file, "gif")
    out = temp_path("mp4")
    try:
        ffmpeg_service.gif_to_mp4(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", f"{Path(file.filename or 'output').stem}.mp4", inp)


# ── BMP ───────────────────────────────────────────────────────────────────────

@router.post("/bmp-to-png")
async def bmp_to_png(file: UploadFile = File(...)):
    inp = await save_upload(file, "bmp")
    out = temp_path("png")
    try:
        image_service.convert(inp, out, "png")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/png", f"{Path(file.filename or 'output').stem}.png", inp)


@router.post("/bmp-to-jpg")
async def bmp_to_jpg(file: UploadFile = File(...), quality: int = Form(85)):
    inp = await save_upload(file, "bmp")
    out = temp_path("jpg")
    try:
        image_service.convert(inp, out, "jpg", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/jpeg", f"{Path(file.filename or 'output').stem}.jpg", inp)


# ── TIFF ──────────────────────────────────────────────────────────────────────

@router.post("/tiff-to-jpg")
async def tiff_to_jpg(file: UploadFile = File(...), quality: int = Form(85)):
    inp = await save_upload(file, "tiff")
    out = temp_path("jpg")
    try:
        image_service.convert(inp, out, "jpg", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/jpeg", f"{Path(file.filename or 'output').stem}.jpg", inp)


@router.post("/tiff-to-pdf")
async def tiff_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "tiff")
    out = temp_path("pdf")
    try:
        image_service.convert(inp, out, "pdf")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{Path(file.filename or 'output').stem}.pdf", inp)


# ── SVG ───────────────────────────────────────────────────────────────────────

@router.post("/svg-to-png")
async def svg_to_png(file: UploadFile = File(...), scale: float = Form(2.0)):
    inp = await save_upload(file, "svg")
    out = temp_path("png")
    try:
        image_service.svg_to_raster(inp, out, "png", scale=scale)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/png", f"{Path(file.filename or 'output').stem}.png", inp)


@router.post("/svg-to-pdf")
async def svg_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "svg")
    out = temp_path("pdf")
    try:
        image_service.svg_to_raster(inp, out, "pdf")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{Path(file.filename or 'output').stem}.pdf", inp)


@router.post("/svg-to-jpg")
async def svg_to_jpg(file: UploadFile = File(...), scale: float = Form(2.0)):
    inp = await save_upload(file, "svg")
    out = temp_path("jpg")
    try:
        image_service.svg_to_raster(inp, out, "jpg", scale=scale)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/jpeg", f"{Path(file.filename or 'output').stem}.jpg", inp)


# ── ICO ───────────────────────────────────────────────────────────────────────

@router.post("/ico-to-png")
async def ico_to_png(file: UploadFile = File(...)):
    inp = await save_upload(file, "ico")
    out = temp_path("png")
    try:
        image_service.convert(inp, out, "png")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/png", f"{Path(file.filename or 'output').stem}.png", inp)


@router.post("/ico-to-jpg")
async def ico_to_jpg(file: UploadFile = File(...), quality: int = Form(85)):
    inp = await save_upload(file, "ico")
    out = temp_path("jpg")
    try:
        image_service.convert(inp, out, "jpg", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/jpeg", f"{Path(file.filename or 'output').stem}.jpg", inp)


# ── MP4 → GIF (ffmpeg, Phase 3) ───────────────────────────────────────────────

@router.post("/mp4-to-gif")
async def mp4_to_gif(
    file: UploadFile = File(...),
    start: int = Form(0),
    duration: int = Form(10),
    fps: int = Form(12),
    scale: int = Form(480),
):
    inp = await save_upload(file, "mp4")
    out = temp_path("gif")
    try:
        ffmpeg_service.mp4_to_gif(inp, out, start=start, duration=duration, fps=fps, scale=scale)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/gif", f"{Path(file.filename or 'output').stem}.gif", inp)


# ── Resize / Compress / RAW ───────────────────────────────────────────────────

@router.post("/resize")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Form(1920),
    height: int = Form(1080),
    maintain_ratio: bool = Form(True),
    quality: int = Form(85),
):
    ext = Path(file.filename or "file.png").suffix.lstrip(".").lower() or "png"
    inp = await save_upload(file, ext)
    out = temp_path(ext)
    try:
        image_service.resize(inp, out, width, height, maintain_ratio=maintain_ratio, quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    stem = Path(file.filename or "output").stem
    media = image_service.FORMAT_MEDIA.get(ext, "image/png")
    return file_response(out, media, f"{stem}_resized.{ext}", inp)


@router.post("/compress")
async def compress_image(
    file: UploadFile = File(...),
    quality: int = Form(60),
):
    ext = Path(file.filename or "file.jpg").suffix.lstrip(".").lower() or "jpg"
    inp = await save_upload(file, ext)
    out = temp_path(ext)
    try:
        image_service.compress(inp, out, quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    stem = Path(file.filename or "output").stem
    media = image_service.FORMAT_MEDIA.get(ext, "image/jpeg")
    return file_response(out, media, f"{stem}_compressed.{ext}", inp)


@router.post("/raw-to-jpg")
async def raw_to_jpg(file: UploadFile = File(...), quality: int = Form(90)):
    ext = Path(file.filename or "file.raw").suffix.lstrip(".").lower() or "raw"
    inp = await save_upload(file, ext)
    out = temp_path("jpg")
    try:
        image_service.convert(inp, out, "jpg", quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "image/jpeg", f"{Path(file.filename or 'output').stem}.jpg", inp)
