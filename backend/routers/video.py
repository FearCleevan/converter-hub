from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from services import ffmpeg_service, ytdlp_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["video"])


class UrlRequest(BaseModel):
    url: str


def _stem(filename: str | None) -> str:
    return Path(filename or "output").stem


# ── MP4 source ────────────────────────────────────────────────────────────────

@router.post("/mp4-to-mp3")
async def mp4_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "mp4")
    out = temp_path("mp3")
    try:
        ffmpeg_service.mp4_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


@router.post("/mp4-to-wav")
async def mp4_to_wav(file: UploadFile = File(...)):
    inp = await save_upload(file, "mp4")
    out = temp_path("wav")
    try:
        ffmpeg_service.mp4_to_wav(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/wav", f"{_stem(file.filename)}.wav", inp)


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
    return file_response(out, "image/gif", f"{_stem(file.filename)}.gif", inp)


@router.post("/mp4-to-webm")
async def mp4_to_webm(file: UploadFile = File(...), crf: int = Form(33)):
    inp = await save_upload(file, "mp4")
    out = temp_path("webm")
    try:
        ffmpeg_service.mp4_to_webm(inp, out, crf=crf)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/webm", f"{_stem(file.filename)}.webm", inp)


@router.post("/mp4-to-avi")
async def mp4_to_avi(file: UploadFile = File(...)):
    inp = await save_upload(file, "mp4")
    out = temp_path("avi")
    try:
        ffmpeg_service.video_any_to_mp4.__module__  # ensure import ok
        from services.ffmpeg_service import _run
        _run(["-i", str(inp), "-c:v", "libxvid", "-c:a", "libmp3lame", str(out)])
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/x-msvideo", f"{_stem(file.filename)}.avi", inp)


@router.post("/mp4-to-mov")
async def mp4_to_mov(file: UploadFile = File(...)):
    inp = await save_upload(file, "mp4")
    out = temp_path("mov")
    try:
        from services.ffmpeg_service import _run
        _run(["-i", str(inp), "-c", "copy", str(out)])
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/quicktime", f"{_stem(file.filename)}.mov", inp)


# ── MOV source ────────────────────────────────────────────────────────────────

@router.post("/mov-to-mp4")
async def mov_to_mp4(file: UploadFile = File(...)):
    inp = await save_upload(file, "mov")
    out = temp_path("mp4")
    try:
        ffmpeg_service.video_any_to_mp4(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", f"{_stem(file.filename)}.mp4", inp)


@router.post("/mov-to-mp3")
async def mov_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "mov")
    out = temp_path("mp3")
    try:
        ffmpeg_service.video_any_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


# ── AVI source ────────────────────────────────────────────────────────────────

@router.post("/avi-to-mp4")
async def avi_to_mp4(file: UploadFile = File(...)):
    inp = await save_upload(file, "avi")
    out = temp_path("mp4")
    try:
        ffmpeg_service.video_any_to_mp4(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", f"{_stem(file.filename)}.mp4", inp)


@router.post("/avi-to-mp3")
async def avi_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "avi")
    out = temp_path("mp3")
    try:
        ffmpeg_service.video_any_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


# ── MKV source ────────────────────────────────────────────────────────────────

@router.post("/mkv-to-mp4")
async def mkv_to_mp4(file: UploadFile = File(...)):
    inp = await save_upload(file, "mkv")
    out = temp_path("mp4")
    try:
        ffmpeg_service.video_any_to_mp4(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", f"{_stem(file.filename)}.mp4", inp)


@router.post("/mkv-to-mp3")
async def mkv_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "mkv")
    out = temp_path("mp3")
    try:
        ffmpeg_service.video_any_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


# ── WebM source ───────────────────────────────────────────────────────────────

@router.post("/webm-to-mp4")
async def webm_to_mp4(file: UploadFile = File(...)):
    inp = await save_upload(file, "webm")
    out = temp_path("mp4")
    try:
        ffmpeg_service.video_any_to_mp4(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", f"{_stem(file.filename)}.mp4", inp)


@router.post("/webm-to-mp3")
async def webm_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "webm")
    out = temp_path("mp3")
    try:
        ffmpeg_service.video_any_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


# ── FLV / WMV source ─────────────────────────────────────────────────────────

@router.post("/flv-to-mp4")
async def flv_to_mp4(file: UploadFile = File(...)):
    inp = await save_upload(file, "flv")
    out = temp_path("mp4")
    try:
        ffmpeg_service.video_any_to_mp4(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", f"{_stem(file.filename)}.mp4", inp)


@router.post("/wmv-to-mp4")
async def wmv_to_mp4(file: UploadFile = File(...)):
    inp = await save_upload(file, "wmv")
    out = temp_path("mp4")
    try:
        ffmpeg_service.video_any_to_mp4(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", f"{_stem(file.filename)}.mp4", inp)


# ── Operations ────────────────────────────────────────────────────────────────

@router.post("/compress")
async def compress_video(file: UploadFile = File(...), crf: int = Form(28)):
    ext = Path(file.filename or "file.mp4").suffix.lstrip(".").lower() or "mp4"
    inp = await save_upload(file, ext)
    out = temp_path(ext)
    try:
        ffmpeg_service.video_compress(inp, out, crf=crf)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", f"{_stem(file.filename)}_compressed.{ext}", inp)


@router.post("/trim")
async def trim_video(
    file: UploadFile = File(...),
    start_sec: float = Form(0.0),
    end_sec: float = Form(30.0),
):
    ext = Path(file.filename or "file.mp4").suffix.lstrip(".").lower() or "mp4"
    inp = await save_upload(file, ext)
    out = temp_path(ext)
    try:
        ffmpeg_service.video_trim(inp, out, start=start_sec, end=end_sec)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", f"{_stem(file.filename)}_trimmed.{ext}", inp)


@router.post("/resize")
async def resize_video(
    file: UploadFile = File(...),
    width: int = Form(1280),
    height: int = Form(720),
):
    ext = Path(file.filename or "file.mp4").suffix.lstrip(".").lower() or "mp4"
    inp = await save_upload(file, ext)
    out = temp_path(ext)
    try:
        ffmpeg_service.video_resize(inp, out, width=width, height=height)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", f"{_stem(file.filename)}_resized.{ext}", inp)


# ── URL downloads (yt-dlp) ────────────────────────────────────────────────────

@router.post("/url-to-mp4")
async def url_to_mp4(req: UrlRequest):
    out = temp_path("mp4")
    try:
        await ytdlp_service.download_mp4(req.url, out)
    except Exception as e:
        await cleanup(out); raise HTTPException(500, str(e))
    return file_response(out, "video/mp4", "download.mp4")


@router.post("/url-to-mp3")
async def url_to_mp3(req: UrlRequest):
    out = temp_path("mp3")
    try:
        await ytdlp_service.download_mp3(req.url, out)
    except Exception as e:
        await cleanup(out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", "download.mp3")


@router.post("/url-to-webm")
async def url_to_webm(req: UrlRequest):
    out = temp_path("webm")
    try:
        await ytdlp_service.download_webm(req.url, out)
    except Exception as e:
        await cleanup(out); raise HTTPException(500, str(e))
    return file_response(out, "video/webm", "download.webm")
