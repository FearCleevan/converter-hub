from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import JSONResponse

from services import cad_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["cad"])


@router.post("/dxf-to-png")
async def dxf_to_png(
    file: UploadFile = File(...),
    dpi: int = Query(150, ge=72, le=300),
):
    inp = await save_upload(file, "dxf")
    out = temp_path("png")
    try:
        cad_service.dxf_to_png(inp, out, dpi)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "image/png", f"{stem}.png", inp)


@router.post("/dxf-to-svg")
async def dxf_to_svg(file: UploadFile = File(...)):
    inp = await save_upload(file, "dxf")
    out = temp_path("svg")
    try:
        cad_service.dxf_to_svg(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "image/svg+xml", f"{stem}.svg", inp)


@router.post("/dxf-to-pdf")
async def dxf_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "dxf")
    out = temp_path("pdf")
    try:
        cad_service.dxf_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "application/pdf", f"{stem}.pdf", inp)


@router.post("/dwg-to-dxf")
async def dwg_to_dxf(file: UploadFile = File(...)):
    inp = await save_upload(file, "dwg")
    out = temp_path("dxf")
    try:
        cad_service.dwg_to_dxf(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "application/dxf", f"{stem}.dxf", inp)


@router.post("/stl-to-obj")
async def stl_to_obj(file: UploadFile = File(...)):
    inp = await save_upload(file, "stl")
    out = temp_path("obj")
    try:
        cad_service.stl_to_obj(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "model/obj", f"{stem}.obj", inp)


@router.post("/obj-to-stl")
async def obj_to_stl(file: UploadFile = File(...)):
    inp = await save_upload(file, "obj")
    out = temp_path("stl")
    try:
        cad_service.obj_to_stl(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "model/stl", f"{stem}.stl", inp)


@router.post("/svg-to-dxf")
async def svg_to_dxf(file: UploadFile = File(...)):
    inp = await save_upload(file, "svg")
    out = temp_path("dxf")
    try:
        cad_service.svg_to_dxf(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "application/dxf", f"{stem}.dxf", inp)


@router.post("/inspect")
async def inspect(file: UploadFile = File(...)):
    inp = await save_upload(file, "dxf")
    try:
        info = cad_service.inspect_dxf(inp)
    except Exception as e:
        await cleanup(inp)
        raise HTTPException(500, str(e))
    await cleanup(inp)
    return JSONResponse(content=info)
