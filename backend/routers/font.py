from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from services import font_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["font"])

_WOFF_MEDIA = "font/woff"
_WOFF2_MEDIA = "font/woff2"
_TTF_MEDIA = "font/ttf"
_OTF_MEDIA = "font/otf"

_PAIRS: list[tuple[str, str, str, str]] = [
    ("ttf-to-otf",   "ttf",  "otf",   _OTF_MEDIA),
    ("ttf-to-woff",  "ttf",  "woff",  _WOFF_MEDIA),
    ("ttf-to-woff2", "ttf",  "woff2", _WOFF2_MEDIA),
    ("otf-to-ttf",   "otf",  "ttf",   _TTF_MEDIA),
    ("otf-to-woff",  "otf",  "woff",  _WOFF_MEDIA),
    ("otf-to-woff2", "otf",  "woff2", _WOFF2_MEDIA),
    ("woff-to-ttf",  "woff", "ttf",   _TTF_MEDIA),
    ("woff2-to-ttf", "woff2","ttf",   _TTF_MEDIA),
]


def _make_endpoint(route: str, in_ext: str, out_ext: str, media: str):
    async def endpoint(file: UploadFile = File(...)):
        inp = await save_upload(file, in_ext)
        out = temp_path(out_ext)
        try:
            font_service.convert_font(inp, out, out_ext)
        except Exception as e:
            await cleanup(inp, out)
            raise HTTPException(500, str(e))
        stem = Path(file.filename).stem
        return file_response(out, media, f"{stem}.{out_ext}", inp)
    endpoint.__name__ = route.replace("-", "_")
    return endpoint


for _route, _in_ext, _out_ext, _media in _PAIRS:
    router.add_api_route(
        f"/{_route}",
        _make_endpoint(_route, _in_ext, _out_ext, _media),
        methods=["POST"],
    )


@router.post("/inspect")
async def inspect(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix.lstrip(".") or "ttf"
    inp = await save_upload(file, suffix)
    try:
        info = font_service.inspect_font(inp)
    except Exception as e:
        await cleanup(inp)
        raise HTTPException(500, str(e))
    await cleanup(inp)
    return JSONResponse(content=info)
