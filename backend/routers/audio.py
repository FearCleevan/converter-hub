from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from services import ffmpeg_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["audio"])


def _stem(filename: str | None) -> str:
    return Path(filename or "output").stem


# ── MP3 source ────────────────────────────────────────────────────────────────

@router.post("/mp3-to-wav")
async def mp3_to_wav(file: UploadFile = File(...)):
    inp = await save_upload(file, "mp3")
    out = temp_path("wav")
    try:
        ffmpeg_service.any_to_wav(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/wav", f"{_stem(file.filename)}.wav", inp)


@router.post("/mp3-to-flac")
async def mp3_to_flac(file: UploadFile = File(...)):
    inp = await save_upload(file, "mp3")
    out = temp_path("flac")
    try:
        ffmpeg_service.any_to_flac(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/flac", f"{_stem(file.filename)}.flac", inp)


@router.post("/mp3-to-ogg")
async def mp3_to_ogg(file: UploadFile = File(...), quality: int = Form(5)):
    inp = await save_upload(file, "mp3")
    out = temp_path("ogg")
    try:
        ffmpeg_service.any_to_ogg(inp, out, quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/ogg", f"{_stem(file.filename)}.ogg", inp)


@router.post("/mp3-to-aac")
async def mp3_to_aac(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "mp3")
    out = temp_path("aac")
    try:
        ffmpeg_service.any_to_aac(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/aac", f"{_stem(file.filename)}.aac", inp)


@router.post("/mp3-to-m4a")
async def mp3_to_m4a(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "mp3")
    out = temp_path("m4a")
    try:
        ffmpeg_service.any_to_m4a(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mp4", f"{_stem(file.filename)}.m4a", inp)


# ── WAV source ────────────────────────────────────────────────────────────────

@router.post("/wav-to-mp3")
async def wav_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "wav")
    out = temp_path("mp3")
    try:
        ffmpeg_service.any_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


@router.post("/wav-to-flac")
async def wav_to_flac(file: UploadFile = File(...)):
    inp = await save_upload(file, "wav")
    out = temp_path("flac")
    try:
        ffmpeg_service.any_to_flac(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/flac", f"{_stem(file.filename)}.flac", inp)


@router.post("/wav-to-ogg")
async def wav_to_ogg(file: UploadFile = File(...), quality: int = Form(5)):
    inp = await save_upload(file, "wav")
    out = temp_path("ogg")
    try:
        ffmpeg_service.any_to_ogg(inp, out, quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/ogg", f"{_stem(file.filename)}.ogg", inp)


# ── FLAC source ───────────────────────────────────────────────────────────────

@router.post("/flac-to-mp3")
async def flac_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "flac")
    out = temp_path("mp3")
    try:
        ffmpeg_service.any_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


@router.post("/flac-to-wav")
async def flac_to_wav(file: UploadFile = File(...)):
    inp = await save_upload(file, "flac")
    out = temp_path("wav")
    try:
        ffmpeg_service.any_to_wav(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/wav", f"{_stem(file.filename)}.wav", inp)


@router.post("/flac-to-ogg")
async def flac_to_ogg(file: UploadFile = File(...), quality: int = Form(5)):
    inp = await save_upload(file, "flac")
    out = temp_path("ogg")
    try:
        ffmpeg_service.any_to_ogg(inp, out, quality=quality)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/ogg", f"{_stem(file.filename)}.ogg", inp)


# ── OGG source ────────────────────────────────────────────────────────────────

@router.post("/ogg-to-mp3")
async def ogg_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "ogg")
    out = temp_path("mp3")
    try:
        ffmpeg_service.any_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


@router.post("/ogg-to-wav")
async def ogg_to_wav(file: UploadFile = File(...)):
    inp = await save_upload(file, "ogg")
    out = temp_path("wav")
    try:
        ffmpeg_service.any_to_wav(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/wav", f"{_stem(file.filename)}.wav", inp)


# ── AAC source ────────────────────────────────────────────────────────────────

@router.post("/aac-to-mp3")
async def aac_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "aac")
    out = temp_path("mp3")
    try:
        ffmpeg_service.any_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


@router.post("/aac-to-wav")
async def aac_to_wav(file: UploadFile = File(...)):
    inp = await save_upload(file, "aac")
    out = temp_path("wav")
    try:
        ffmpeg_service.any_to_wav(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/wav", f"{_stem(file.filename)}.wav", inp)


# ── M4A source ────────────────────────────────────────────────────────────────

@router.post("/m4a-to-mp3")
async def m4a_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "m4a")
    out = temp_path("mp3")
    try:
        ffmpeg_service.any_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


@router.post("/m4a-to-wav")
async def m4a_to_wav(file: UploadFile = File(...)):
    inp = await save_upload(file, "m4a")
    out = temp_path("wav")
    try:
        ffmpeg_service.any_to_wav(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/wav", f"{_stem(file.filename)}.wav", inp)


# ── WMA source ────────────────────────────────────────────────────────────────

@router.post("/wma-to-mp3")
async def wma_to_mp3(file: UploadFile = File(...), bitrate: str = Form("192k")):
    inp = await save_upload(file, "wma")
    out = temp_path("mp3")
    try:
        ffmpeg_service.any_to_mp3(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}.mp3", inp)


# ── Operations ────────────────────────────────────────────────────────────────

@router.post("/trim")
async def trim_audio(
    file: UploadFile = File(...),
    start_sec: float = Form(0.0),
    end_sec: float = Form(30.0),
):
    ext = Path(file.filename or "file.mp3").suffix.lstrip(".").lower() or "mp3"
    inp = await save_upload(file, ext)
    out = temp_path(ext)
    try:
        ffmpeg_service.audio_trim(inp, out, start=start_sec, end=end_sec)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    media = "audio/mpeg" if ext == "mp3" else f"audio/{ext}"
    return file_response(out, media, f"{_stem(file.filename)}_trimmed.{ext}", inp)


@router.post("/compress")
async def compress_audio(file: UploadFile = File(...), bitrate: str = Form("128k")):
    ext = Path(file.filename or "file.mp3").suffix.lstrip(".").lower() or "mp3"
    inp = await save_upload(file, ext)
    out = temp_path("mp3")
    try:
        ffmpeg_service.audio_compress(inp, out, bitrate=bitrate)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "audio/mpeg", f"{_stem(file.filename)}_compressed.mp3", inp)


@router.post("/merge")
async def merge_audio(
    files: list[UploadFile] = File(...),
    output_format: str = Form("mp3"),
):
    if len(files) < 2:
        raise HTTPException(400, "At least 2 audio files are required for merge.")

    ext_map = {"mp3": "mp3", "wav": "wav", "flac": "flac", "ogg": "ogg"}
    out_ext = ext_map.get(output_format.lower(), "mp3")

    input_paths = []
    for f in files:
        ext = Path(f.filename or "file.mp3").suffix.lstrip(".").lower() or "mp3"
        input_paths.append(await save_upload(f, ext))

    out = temp_path(out_ext)
    try:
        ffmpeg_service.audio_merge(input_paths, out)
    except Exception as e:
        for p in input_paths:
            await cleanup(p)
        await cleanup(out)
        raise HTTPException(500, str(e))

    for p in input_paths:
        await cleanup(p)

    media = "audio/mpeg" if out_ext == "mp3" else f"audio/{out_ext}"
    return file_response(out, media, f"merged.{out_ext}")
