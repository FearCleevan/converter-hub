from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from services import spreadsheet_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["spreadsheet"])


def _stem(filename: str | None) -> str:
    return Path(filename or "output").stem


@router.post("/csv-to-excel")
async def csv_to_excel(file: UploadFile = File(...)):
    inp = await save_upload(file, "csv")
    out = temp_path("xlsx")
    try:
        spreadsheet_service.csv_to_excel(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(
        out,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        f"{_stem(file.filename)}.xlsx",
        inp,
    )


@router.post("/csv-to-json")
async def csv_to_json(file: UploadFile = File(...)):
    inp = await save_upload(file, "csv")
    out = temp_path("json")
    try:
        spreadsheet_service.csv_to_json(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/json", f"{_stem(file.filename)}.json", inp)


@router.post("/csv-to-html")
async def csv_to_html(file: UploadFile = File(...)):
    inp = await save_upload(file, "csv")
    out = temp_path("html")
    try:
        spreadsheet_service.csv_to_html(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "text/html", f"{_stem(file.filename)}.html", inp)


@router.post("/excel-to-csv")
async def excel_to_csv(file: UploadFile = File(...)):
    ext = Path(file.filename or "file.xlsx").suffix.lstrip(".").lower() or "xlsx"
    inp = await save_upload(file, ext)
    out = temp_path("csv")
    try:
        spreadsheet_service.excel_to_csv(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "text/csv", f"{_stem(file.filename)}.csv", inp)


@router.post("/excel-to-pdf")
async def excel_to_pdf(file: UploadFile = File(...)):
    ext = Path(file.filename or "file.xlsx").suffix.lstrip(".").lower() or "xlsx"
    inp = await save_upload(file, ext)
    out = temp_path("pdf")
    try:
        spreadsheet_service.excel_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}.pdf", inp)


@router.post("/excel-to-json")
async def excel_to_json(file: UploadFile = File(...)):
    ext = Path(file.filename or "file.xlsx").suffix.lstrip(".").lower() or "xlsx"
    inp = await save_upload(file, ext)
    out = temp_path("json")
    try:
        spreadsheet_service.excel_to_json(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/json", f"{_stem(file.filename)}.json", inp)


@router.post("/ods-to-xlsx")
async def ods_to_xlsx(file: UploadFile = File(...)):
    inp = await save_upload(file, "ods")
    out = temp_path("xlsx")
    try:
        spreadsheet_service.ods_to_xlsx(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(
        out,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        f"{_stem(file.filename)}.xlsx",
        inp,
    )


@router.post("/xlsx-to-ods")
async def xlsx_to_ods(file: UploadFile = File(...)):
    inp = await save_upload(file, "xlsx")
    out = temp_path("ods")
    try:
        spreadsheet_service.xlsx_to_ods(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(
        out,
        "application/vnd.oasis.opendocument.spreadsheet",
        f"{_stem(file.filename)}.ods",
        inp,
    )
