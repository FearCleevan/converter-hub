import io
import json
from pathlib import Path

from utils.platform_utils import get_libreoffice_path


def _lo_convert(inp: Path, out: Path, target_fmt: str) -> None:
    import subprocess
    soffice = get_libreoffice_path()
    result = subprocess.run(
        [soffice, "--headless", "--convert-to", target_fmt, "--outdir", str(inp.parent), str(inp)],
        capture_output=True, text=True, timeout=120,
    )
    if result.returncode != 0:
        raise RuntimeError(f"LibreOffice error: {result.stderr[-500:]}")
    converted = inp.parent / (inp.stem + f".{target_fmt}")
    if converted != out:
        converted.rename(out)


def csv_to_excel(inp: Path, out: Path) -> None:
    import pandas as pd  # type: ignore[import-untyped]
    df = pd.read_csv(inp)
    df.to_excel(str(out), index=False, engine="openpyxl")


def csv_to_json(inp: Path, out: Path) -> None:
    import pandas as pd
    df = pd.read_csv(inp)
    out.write_text(df.to_json(orient="records", indent=2), encoding="utf-8")


def csv_to_html(inp: Path, out: Path) -> None:
    import pandas as pd
    df = pd.read_csv(inp)
    html = (
        '<!DOCTYPE html><html><head><meta charset="utf-8">'
        '<style>table{border-collapse:collapse;width:100%}'
        'th,td{border:1px solid #ddd;padding:8px;text-align:left}'
        'th{background:#f5f5f5}</style></head><body>'
        + df.to_html(index=False, border=0)
        + "</body></html>"
    )
    out.write_text(html, encoding="utf-8")


def excel_to_csv(inp: Path, out: Path) -> None:
    import pandas as pd
    df = pd.read_excel(inp, engine="openpyxl")
    df.to_csv(str(out), index=False)


def excel_to_pdf(inp: Path, out: Path) -> None:
    _lo_convert(inp, out, "pdf")


def excel_to_json(inp: Path, out: Path) -> None:
    import pandas as pd
    df = pd.read_excel(inp, engine="openpyxl")
    out.write_text(df.to_json(orient="records", indent=2), encoding="utf-8")


def ods_to_xlsx(inp: Path, out: Path) -> None:
    """ODS → XLSX via pandas (requires odfpy) or LibreOffice fallback."""
    try:
        import pandas as pd
        df = pd.read_excel(inp, engine="odf")
        df.to_excel(str(out), index=False, engine="openpyxl")
    except Exception:
        _lo_convert(inp, out, "xlsx")


def xlsx_to_ods(inp: Path, out: Path) -> None:
    _lo_convert(inp, out, "ods")
