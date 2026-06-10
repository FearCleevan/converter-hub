from pathlib import Path
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, PlainTextResponse, Response

from services import code_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["code-data"])


@router.post("/json-format")
async def json_format(
    raw: str = Form(...),
    indent: int = Form(2),
    minify: bool = Form(False),
):
    try:
        result = code_service.json_format(raw, indent, minify)
    except Exception as e:
        raise HTTPException(400, str(e))
    return PlainTextResponse(result, media_type="application/json")


@router.post("/json-to-csv")
async def json_to_csv(raw: str = Form(...)):
    try:
        result = code_service.json_to_csv(raw)
    except Exception as e:
        raise HTTPException(400, str(e))
    out = temp_path("csv")
    out.write_text(result, encoding="utf-8")
    return file_response(out, "text/csv", "output.csv")


@router.post("/json-to-yaml")
async def json_to_yaml(raw: str = Form(...)):
    try:
        result = code_service.json_to_yaml(raw)
    except Exception as e:
        raise HTTPException(400, str(e))
    out = temp_path("yaml")
    out.write_text(result, encoding="utf-8")
    return file_response(out, "text/yaml", "output.yaml")


@router.post("/json-to-xml")
async def json_to_xml(raw: str = Form(...)):
    try:
        result = code_service.json_to_xml(raw)
    except Exception as e:
        raise HTTPException(400, str(e))
    out = temp_path("xml")
    out.write_text(result, encoding="utf-8")
    return file_response(out, "application/xml", "output.xml")


@router.post("/csv-to-json")
async def csv_to_json(file: UploadFile = File(...)):
    inp = await save_upload(file, "csv")
    try:
        result = code_service.csv_to_json_str(inp)
    except Exception as e:
        await cleanup(inp)
        raise HTTPException(400, str(e))
    await cleanup(inp)
    out = temp_path("json")
    out.write_text(result, encoding="utf-8")
    return file_response(out, "application/json", "output.json")


@router.post("/xml-to-json")
async def xml_to_json(raw: str = Form(...)):
    try:
        result = code_service.xml_to_json(raw)
    except Exception as e:
        raise HTTPException(400, str(e))
    out = temp_path("json")
    out.write_text(result, encoding="utf-8")
    return file_response(out, "application/json", "output.json")


@router.post("/yaml-to-json")
async def yaml_to_json(raw: str = Form(...)):
    try:
        result = code_service.yaml_to_json(raw)
    except Exception as e:
        raise HTTPException(400, str(e))
    out = temp_path("json")
    out.write_text(result, encoding="utf-8")
    return file_response(out, "application/json", "output.json")


@router.post("/base64-encode")
async def base64_encode(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    if file is not None:
        data = await file.read()
        result = code_service.base64_encode_bytes(data)
    elif text is not None:
        result = code_service.base64_encode_text(text)
    else:
        raise HTTPException(400, "Provide either 'text' or 'file'.")
    return JSONResponse({"encoded": result})


@router.post("/base64-decode")
async def base64_decode(encoded: str = Form(...)):
    try:
        data = code_service.base64_decode(encoded)
    except Exception as e:
        raise HTTPException(400, str(e))
    out = temp_path("bin")
    out.write_bytes(data)
    return file_response(out, "application/octet-stream", "decoded.bin")


@router.post("/svg-to-code")
async def svg_to_code(file: UploadFile = File(...)):
    inp = await save_upload(file, "svg")
    try:
        code = code_service.svg_to_code(inp.read_bytes())
    except Exception as e:
        await cleanup(inp)
        raise HTTPException(500, str(e))
    await cleanup(inp)
    return PlainTextResponse(code, media_type="image/svg+xml")


@router.post("/code-to-svg")
async def code_to_svg(code: str = Form(...)):
    try:
        data = code_service.code_to_svg(code)
    except Exception as e:
        raise HTTPException(400, str(e))
    out = temp_path("svg")
    out.write_bytes(data)
    return file_response(out, "image/svg+xml", "output.svg")


@router.post("/html-format")
async def html_format(raw: str = Form(...)):
    try:
        result = code_service.html_format(raw)
    except Exception as e:
        raise HTTPException(500, str(e))
    return PlainTextResponse(result, media_type="text/html")
