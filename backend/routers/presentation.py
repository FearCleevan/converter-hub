from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from services import presentation_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["presentation"])

_DOCX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation"


def _stem(filename: str | None) -> str:
    return Path(filename or "output").stem


@router.post("/pptx-to-pdf")
async def pptx_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "pptx")
    out = temp_path("pdf")
    try:
        presentation_service.pptx_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}.pdf", inp)


@router.post("/pptx-to-images")
async def pptx_to_images(file: UploadFile = File(...)):
    inp = await save_upload(file, "pptx")
    out = temp_path("zip")
    try:
        presentation_service.pptx_to_images_zip(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/zip", f"{_stem(file.filename)}_slides.zip", inp)


@router.post("/pptx-to-html")
async def pptx_to_html(file: UploadFile = File(...)):
    inp = await save_upload(file, "pptx")
    out = temp_path("html")
    try:
        presentation_service.pptx_to_html(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "text/html", f"{_stem(file.filename)}.html", inp)


@router.post("/ppt-to-pptx")
async def ppt_to_pptx(file: UploadFile = File(...)):
    inp = await save_upload(file, "ppt")
    out = temp_path("pptx")
    try:
        presentation_service.office_to_pptx(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, _DOCX_MIME, f"{_stem(file.filename)}.pptx", inp)


@router.post("/ppt-to-pdf")
async def ppt_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "ppt")
    out = temp_path("pdf")
    try:
        presentation_service.office_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}.pdf", inp)


@router.post("/odp-to-pptx")
async def odp_to_pptx(file: UploadFile = File(...)):
    inp = await save_upload(file, "odp")
    out = temp_path("pptx")
    try:
        presentation_service.office_to_pptx(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, _DOCX_MIME, f"{_stem(file.filename)}.pptx", inp)


@router.post("/odp-to-pdf")
async def odp_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "odp")
    out = temp_path("pdf")
    try:
        presentation_service.office_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}.pdf", inp)


@router.post("/key-to-pdf")
async def key_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "key")
    out = temp_path("pdf")
    try:
        presentation_service.office_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}.pdf", inp)


@router.post("/pdf-to-pptx")
async def pdf_to_pptx(file: UploadFile = File(...)):
    inp = await save_upload(file, "pdf")
    out = temp_path("pptx")
    try:
        presentation_service.office_to_pptx(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, _DOCX_MIME, f"{_stem(file.filename)}.pptx", inp)


@router.post("/compress")
async def compress_pptx(
    file: UploadFile = File(...),
    max_image_px: int = Form(1280),
):
    inp = await save_upload(file, "pptx")
    out = temp_path("pptx")
    try:
        presentation_service.compress_pptx(inp, out, max_image_px=max_image_px)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, _DOCX_MIME, f"{_stem(file.filename)}_compressed.pptx", inp)


@router.post("/merge")
async def merge_pptx(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(400, "At least 2 PPTX files are required.")
    paths = [await save_upload(f, "pptx") for f in files]
    out = temp_path("pptx")
    try:
        presentation_service.merge_pptx(paths, out)
    except Exception as e:
        for p in paths: await cleanup(p)
        await cleanup(out)
        raise HTTPException(500, str(e))
    for p in paths: await cleanup(p)
    return file_response(out, _DOCX_MIME, "merged.pptx")
