from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from services import ebook_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["ebook"])

_MEDIA = "application/octet-stream"

_PAIRS: list[tuple[str, str, str, str]] = [
    ("epub-to-mobi",  "epub", "mobi",  "application/x-mobipocket-ebook"),
    ("epub-to-pdf",   "epub", "pdf",   "application/pdf"),
    ("epub-to-txt",   "epub", "txt",   "text/plain"),
    ("epub-to-html",  "epub", "html",  "text/html"),
    ("epub-to-docx",  "epub", "docx",  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    ("mobi-to-epub",  "mobi", "epub",  "application/epub+zip"),
    ("mobi-to-pdf",   "mobi", "pdf",   "application/pdf"),
    ("azw3-to-epub",  "azw3", "epub",  "application/epub+zip"),
    ("azw3-to-mobi",  "azw3", "mobi",  "application/x-mobipocket-ebook"),
    ("fb2-to-epub",   "fb2",  "epub",  "application/epub+zip"),
    ("fb2-to-pdf",    "fb2",  "pdf",   "application/pdf"),
    ("html-to-epub",  "html", "epub",  "application/epub+zip"),
    ("docx-to-epub",  "docx", "epub",  "application/epub+zip"),
    ("txt-to-epub",   "txt",  "epub",  "application/epub+zip"),
    ("pdf-to-epub",   "pdf",  "epub",  "application/epub+zip"),
]


def _make_endpoint(route: str, in_ext: str, out_ext: str, media: str):
    async def endpoint(file: UploadFile = File(...)):
        inp = await save_upload(file, in_ext)
        out = temp_path(out_ext)
        try:
            ebook_service.ebook_convert(inp, out)
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
