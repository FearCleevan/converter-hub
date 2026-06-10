from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from services import document_service
from utils.file_utils import cleanup, save_upload, temp_path
from utils.response_utils import file_response

router = APIRouter(tags=["document"])


def _stem(filename: str | None) -> str:
    return Path(filename or "output").stem


# ── PDF → X ───────────────────────────────────────────────────────────────────

@router.post("/pdf-to-word")
async def pdf_to_word(file: UploadFile = File(...)):
    inp = await save_upload(file, "pdf")
    out = temp_path("docx")
    try:
        document_service.pdf_to_word(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                         f"{_stem(file.filename)}.docx", inp)


@router.post("/pdf-to-txt")
async def pdf_to_txt(file: UploadFile = File(...)):
    inp = await save_upload(file, "pdf")
    out = temp_path("txt")
    try:
        document_service.pdf_to_txt(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "text/plain", f"{_stem(file.filename)}.txt", inp)


@router.post("/pdf-to-html")
async def pdf_to_html(file: UploadFile = File(...)):
    inp = await save_upload(file, "pdf")
    out = temp_path("html")
    try:
        document_service.pdf_to_html(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "text/html", f"{_stem(file.filename)}.html", inp)


@router.post("/pdf-to-images")
async def pdf_to_images(file: UploadFile = File(...), dpi: int = Form(150)):
    inp = await save_upload(file, "pdf")
    out = temp_path("zip")
    try:
        document_service.pdf_to_images_zip(inp, out, dpi=dpi)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/zip", f"{_stem(file.filename)}_images.zip", inp)


@router.post("/pdf-merge")
async def pdf_merge(files: list[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(400, "At least 2 PDF files are required.")
    paths = [await save_upload(f, "pdf") for f in files]
    out = temp_path("pdf")
    try:
        document_service.pdf_merge(paths, out)
    except Exception as e:
        for p in paths: await cleanup(p)
        await cleanup(out)
        raise HTTPException(500, str(e))
    for p in paths: await cleanup(p)
    return file_response(out, "application/pdf", "merged.pdf")


@router.post("/pdf-split")
async def pdf_split(file: UploadFile = File(...)):
    inp = await save_upload(file, "pdf")
    out = temp_path("zip")
    try:
        document_service.pdf_split(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/zip", f"{_stem(file.filename)}_pages.zip", inp)


@router.post("/pdf-compress")
async def pdf_compress(file: UploadFile = File(...)):
    inp = await save_upload(file, "pdf")
    out = temp_path("pdf")
    try:
        document_service.pdf_compress(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}_compressed.pdf", inp)


# ── Word / ODT / RTF → X ──────────────────────────────────────────────────────

@router.post("/word-to-pdf")
async def word_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "docx")
    out = temp_path("pdf")
    try:
        document_service.office_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}.pdf", inp)


@router.post("/word-to-odt")
async def word_to_odt(file: UploadFile = File(...)):
    inp = await save_upload(file, "docx")
    out = temp_path("odt")
    try:
        document_service.office_convert(inp, out, "odt")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/vnd.oasis.opendocument.text",
                         f"{_stem(file.filename)}.odt", inp)


@router.post("/word-to-txt")
async def word_to_txt(file: UploadFile = File(...)):
    inp = await save_upload(file, "docx")
    out = temp_path("txt")
    try:
        document_service.docx_to_txt(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "text/plain", f"{_stem(file.filename)}.txt", inp)


@router.post("/word-to-html")
async def word_to_html(file: UploadFile = File(...)):
    inp = await save_upload(file, "docx")
    out = temp_path("html")
    try:
        document_service.docx_to_html(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "text/html", f"{_stem(file.filename)}.html", inp)


@router.post("/odt-to-pdf")
async def odt_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "odt")
    out = temp_path("pdf")
    try:
        document_service.office_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}.pdf", inp)


@router.post("/odt-to-docx")
async def odt_to_docx(file: UploadFile = File(...)):
    inp = await save_upload(file, "odt")
    out = temp_path("docx")
    try:
        document_service.office_convert(inp, out, "docx")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                         f"{_stem(file.filename)}.docx", inp)


@router.post("/rtf-to-pdf")
async def rtf_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "rtf")
    out = temp_path("pdf")
    try:
        document_service.office_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}.pdf", inp)


@router.post("/rtf-to-docx")
async def rtf_to_docx(file: UploadFile = File(...)):
    inp = await save_upload(file, "rtf")
    out = temp_path("docx")
    try:
        document_service.office_convert(inp, out, "docx")
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                         f"{_stem(file.filename)}.docx", inp)


@router.post("/pages-to-pdf")
async def pages_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "pages")
    out = temp_path("pdf")
    try:
        document_service.office_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}.pdf", inp)


# ── HTML / Markdown / TXT → X ─────────────────────────────────────────────────

@router.post("/html-to-pdf")
async def html_to_pdf(
    file: UploadFile = File(None),
    html: str = Form(None),
):
    if file and file.filename:
        inp = await save_upload(file, "html")
        html_content = inp.read_text(encoding="utf-8")
        await cleanup(inp)
    elif html:
        html_content = html
    else:
        raise HTTPException(400, "Provide either an HTML file or html form field.")
    out = temp_path("pdf")
    try:
        document_service.html_to_pdf(html_content, out)
    except Exception as e:
        await cleanup(out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", "output.pdf")


@router.post("/md-to-pdf")
async def md_to_pdf(
    file: UploadFile = File(None),
    markdown: str = Form(None),
):
    if file and file.filename:
        inp = await save_upload(file, "md")
        md_text = inp.read_text(encoding="utf-8")
        await cleanup(inp)
    elif markdown:
        md_text = markdown
    else:
        raise HTTPException(400, "Provide either a .md file or markdown form field.")
    out = temp_path("pdf")
    try:
        document_service.md_to_pdf(md_text, out)
    except Exception as e:
        await cleanup(out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", "output.pdf")


@router.post("/md-to-html")
async def md_to_html(
    file: UploadFile = File(None),
    markdown: str = Form(None),
):
    if file and file.filename:
        inp = await save_upload(file, "md")
        md_text = inp.read_text(encoding="utf-8")
        await cleanup(inp)
    elif markdown:
        md_text = markdown
    else:
        raise HTTPException(400, "Provide either a .md file or markdown form field.")
    out = temp_path("html")
    try:
        html_content = document_service.md_to_html_str(md_text)
        out.write_text(html_content, encoding="utf-8")
    except Exception as e:
        await cleanup(out); raise HTTPException(500, str(e))
    return file_response(out, "text/html", "output.html")


@router.post("/md-to-docx")
async def md_to_docx(
    file: UploadFile = File(None),
    markdown: str = Form(None),
):
    if file and file.filename:
        inp = await save_upload(file, "md")
        md_text = inp.read_text(encoding="utf-8")
        await cleanup(inp)
    elif markdown:
        md_text = markdown
    else:
        raise HTTPException(400, "Provide either a .md file or markdown form field.")
    out = temp_path("docx")
    try:
        document_service.md_to_docx(md_text, out)
    except Exception as e:
        await cleanup(out); raise HTTPException(500, str(e))
    return file_response(out, "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                         "output.docx")


@router.post("/txt-to-pdf")
async def txt_to_pdf(file: UploadFile = File(...)):
    inp = await save_upload(file, "txt")
    out = temp_path("pdf")
    try:
        document_service.txt_to_pdf(inp, out)
    except Exception as e:
        await cleanup(inp, out); raise HTTPException(500, str(e))
    return file_response(out, "application/pdf", f"{_stem(file.filename)}.pdf", inp)
