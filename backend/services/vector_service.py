import subprocess
from pathlib import Path

from utils.platform_utils import get_inkscape_path


def _cairosvg():
    try:
        import cairosvg  # type: ignore[import-untyped]
        return cairosvg
    except OSError:
        raise RuntimeError(
            "cairosvg requires the Cairo library. "
            "On Windows install GTK3 runtime or use WSL. "
            "On Linux: apt install libcairo2-dev"
        )


def svg_to_png(inp: Path, out: Path, scale: float = 2.0) -> None:
    _cairosvg().svg2png(url=str(inp), write_to=str(out), scale=scale)


def svg_to_pdf(inp: Path, out: Path) -> None:
    _cairosvg().svg2pdf(url=str(inp), write_to=str(out))


def svg_to_jpg(inp: Path, out: Path, scale: float = 2.0) -> None:
    import io
    from PIL import Image
    png_data = _cairosvg().svg2png(url=str(inp), scale=scale)
    img = Image.open(io.BytesIO(png_data)).convert("RGB")
    img.save(str(out), format="JPEG", quality=90)


def svg_to_eps(inp: Path, out: Path) -> None:
    inkscape = get_inkscape_path()
    subprocess.run(
        [inkscape, str(inp), f"--export-eps={out}"],
        check=True, capture_output=True, timeout=60,
    )


def eps_to_svg(inp: Path, out: Path) -> None:
    inkscape = get_inkscape_path()
    subprocess.run(
        [inkscape, str(inp), f"--export-plain-svg={out}"],
        check=True, capture_output=True, timeout=60,
    )


def eps_to_png(inp: Path, out: Path) -> None:
    inkscape = get_inkscape_path()
    subprocess.run(
        [inkscape, str(inp), f"--export-png={out}", "--export-dpi=150"],
        check=True, capture_output=True, timeout=60,
    )


def eps_to_pdf(inp: Path, out: Path) -> None:
    inkscape = get_inkscape_path()
    subprocess.run(
        [inkscape, str(inp), f"--export-pdf={out}"],
        check=True, capture_output=True, timeout=60,
    )


def ai_to_svg(inp: Path, out: Path) -> None:
    inkscape = get_inkscape_path()
    subprocess.run(
        [inkscape, str(inp), f"--export-plain-svg={out}"],
        check=True, capture_output=True, timeout=60,
    )


def ai_to_pdf(inp: Path, out: Path) -> None:
    inkscape = get_inkscape_path()
    subprocess.run(
        [inkscape, str(inp), f"--export-pdf={out}"],
        check=True, capture_output=True, timeout=60,
    )


def pdf_to_svg(inp: Path, out: Path) -> None:
    inkscape = get_inkscape_path()
    subprocess.run(
        [inkscape, str(inp), f"--export-plain-svg={out}"],
        check=True, capture_output=True, timeout=60,
    )


def svg_optimize(inp: Path, out: Path) -> None:
    try:
        subprocess.run(
            [
                "scour", "-i", str(inp), "-o", str(out),
                "--enable-viewboxing", "--strip-xml-prolog",
                "--remove-metadata", "--shorten-ids",
            ],
            check=True, capture_output=True, timeout=30,
        )
    except FileNotFoundError:
        raise RuntimeError("scour not found. Install it: pip install scour")
