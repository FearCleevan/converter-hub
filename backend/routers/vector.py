from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from services import vector_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["vector"])


@router.post("/svg-to-png")
async def svg_to_png(
    file: UploadFile = File(...),
    scale: float = Query(2.0, ge=0.5, le=4.0),
):
    inp = await save_upload(file, "svg")
    out = temp_path("png")
    try:
        vector_service.svg_to_png(inp, out, scale)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "image/png", f"{stem}.png", inp)


@router.post("/svg-to-pdf")
async def svg_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "svg")
    out = temp_path("pdf")
    try:
        vector_service.svg_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "application/pdf", f"{stem}.pdf", inp)


@router.post("/svg-to-jpg")
async def svg_to_jpg(
    file: UploadFile = File(...),
    scale: float = Query(2.0, ge=0.5, le=4.0),
):
    inp = await save_upload(file, "svg")
    out = temp_path("jpg")
    try:
        vector_service.svg_to_jpg(inp, out, scale)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "image/jpeg", f"{stem}.jpg", inp)


@router.post("/svg-to-eps")
async def svg_to_eps(file: UploadFile = File(...)):
    inp = await save_upload(file, "svg")
    out = temp_path("eps")
    try:
        vector_service.svg_to_eps(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "application/postscript", f"{stem}.eps", inp)


@router.post("/eps-to-svg")
async def eps_to_svg(file: UploadFile = File(...)):
    inp = await save_upload(file, "eps")
    out = temp_path("svg")
    try:
        vector_service.eps_to_svg(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "image/svg+xml", f"{stem}.svg", inp)


@router.post("/eps-to-png")
async def eps_to_png(file: UploadFile = File(...)):
    inp = await save_upload(file, "eps")
    out = temp_path("png")
    try:
        vector_service.eps_to_png(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "image/png", f"{stem}.png", inp)


@router.post("/eps-to-pdf")
async def eps_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "eps")
    out = temp_path("pdf")
    try:
        vector_service.eps_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "application/pdf", f"{stem}.pdf", inp)


@router.post("/ai-to-svg")
async def ai_to_svg(file: UploadFile = File(...)):
    inp = await save_upload(file, "ai")
    out = temp_path("svg")
    try:
        vector_service.ai_to_svg(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "image/svg+xml", f"{stem}.svg", inp)


@router.post("/ai-to-pdf")
async def ai_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "ai")
    out = temp_path("pdf")
    try:
        vector_service.ai_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "application/pdf", f"{stem}.pdf", inp)


@router.post("/pdf-to-svg")
async def pdf_to_svg(file: UploadFile = File(...)):
    inp = await save_upload(file, "pdf")
    out = temp_path("svg")
    try:
        vector_service.pdf_to_svg(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "image/svg+xml", f"{stem}.svg", inp)


@router.post("/svg-optimize")
async def svg_optimize(file: UploadFile = File(...)):
    inp = await save_upload(file, "svg")
    out = temp_path("svg")
    try:
        vector_service.svg_optimize(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "image/svg+xml", f"{stem}_optimized.svg", inp)
