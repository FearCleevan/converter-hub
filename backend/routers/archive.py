import shutil
from pathlib import Path
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from services import archive_service
from utils.file_utils import cleanup, save_upload, temp_path, TEMP_DIR
from utils.response_utils import file_response

router = APIRouter(tags=["archive"])


@router.post("/extract")
async def extract(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix.lower() or ".zip"
    inp = await save_upload(file, suffix.lstrip("."))
    out_dir = TEMP_DIR / inp.stem
    out_zip = temp_path("zip")
    try:
        archive_service.extract(inp, out_dir)
        extracted = [f for f in out_dir.rglob("*") if f.is_file()]
        archive_service.create_zip(extracted, out_zip)
    except Exception as e:
        await cleanup(inp, out_zip)
        shutil.rmtree(out_dir, ignore_errors=True)
        raise HTTPException(500, str(e))
    shutil.rmtree(out_dir, ignore_errors=True)
    stem = Path(file.filename).stem
    return file_response(out_zip, "application/zip", f"{stem}_extracted.zip", inp)


@router.post("/create-zip")
async def create_zip(files: List[UploadFile] = File(...)):
    saved: list[Path] = []
    try:
        for f in files:
            saved.append(await save_upload(f, Path(f.filename).suffix.lstrip(".")))
        out = temp_path("zip")
        archive_service.create_zip(saved, out)
    except Exception as e:
        for p in saved:
            await cleanup(p)
        raise HTTPException(500, str(e))
    return file_response(out, "application/zip", "archive.zip", *saved)


@router.post("/create-7z")
async def create_7z(files: List[UploadFile] = File(...)):
    saved: list[Path] = []
    try:
        for f in files:
            saved.append(await save_upload(f, Path(f.filename).suffix.lstrip(".")))
        out = temp_path("7z")
        archive_service.create_7z(saved, out)
    except Exception as e:
        for p in saved:
            await cleanup(p)
        raise HTTPException(500, str(e))
    return file_response(out, "application/x-7z-compressed", "archive.7z", *saved)


@router.post("/create-tar-gz")
async def create_tar_gz(files: List[UploadFile] = File(...)):
    saved: list[Path] = []
    try:
        for f in files:
            saved.append(await save_upload(f, Path(f.filename).suffix.lstrip(".")))
        out = temp_path("tar.gz")
        archive_service.create_tar_gz(saved, out)
    except Exception as e:
        for p in saved:
            await cleanup(p)
        raise HTTPException(500, str(e))
    return file_response(out, "application/gzip", "archive.tar.gz", *saved)


@router.post("/zip-to-tar")
async def zip_to_tar(file: UploadFile = File(...)):
    inp = await save_upload(file, "zip")
    out = temp_path("tar.gz")
    try:
        archive_service.zip_to_tar(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "application/gzip", f"{stem}.tar.gz", inp)


@router.post("/rar-to-zip")
async def rar_to_zip(file: UploadFile = File(...)):
    inp = await save_upload(file, "rar")
    out = temp_path("zip")
    extract_dir = TEMP_DIR / inp.stem
    try:
        archive_service.rar_to_zip(inp, out, extract_dir)
    except Exception as e:
        await cleanup(inp, out)
        shutil.rmtree(extract_dir, ignore_errors=True)
        raise HTTPException(500, str(e))
    shutil.rmtree(extract_dir, ignore_errors=True)
    stem = Path(file.filename).stem
    return file_response(out, "application/zip", f"{stem}.zip", inp)


@router.post("/7z-to-zip")
async def sevenz_to_zip(file: UploadFile = File(...)):
    inp = await save_upload(file, "7z")
    out = temp_path("zip")
    extract_dir = TEMP_DIR / inp.stem
    try:
        archive_service.sevenz_to_zip(inp, out, extract_dir)
    except Exception as e:
        await cleanup(inp, out)
        shutil.rmtree(extract_dir, ignore_errors=True)
        raise HTTPException(500, str(e))
    shutil.rmtree(extract_dir, ignore_errors=True)
    stem = Path(file.filename).stem
    return file_response(out, "application/zip", f"{stem}.zip", inp)


@router.post("/inspect")
async def inspect(file: UploadFile = File(...)):
    inp = await save_upload(file, "zip")
    try:
        listing = archive_service.inspect_zip(inp)
    except Exception as e:
        await cleanup(inp)
        raise HTTPException(500, str(e))
    await cleanup(inp)
    return JSONResponse(content={"files": listing, "count": len(listing)})


@router.post("/compress")
async def compress(file: UploadFile = File(...)):
    inp = await save_upload(file, "zip")
    out = temp_path("zip")
    try:
        archive_service.compress_zip(inp, out)
    except Exception as e:
        await cleanup(inp, out)
        raise HTTPException(500, str(e))
    stem = Path(file.filename).stem
    return file_response(out, "application/zip", f"{stem}_compressed.zip", inp)
