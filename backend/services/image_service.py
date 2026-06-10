from pathlib import Path

from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()

FORMAT_MEDIA: dict[str, str] = {
    "webp": "image/webp",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "bmp": "image/bmp",
    "tiff": "image/tiff",
    "ico": "image/x-icon",
    "pdf": "application/pdf",
    "mp4": "video/mp4",
}

_NEEDS_RGB = {"jpg", "jpeg", "bmp", "tiff"}
_ALPHA_FMTS = {"RGBA", "LA", "PA"}


def _to_rgb(img: Image.Image, bg: tuple[int, int, int] = (255, 255, 255)) -> Image.Image:
    """Flatten transparency onto a white background and return an RGB image."""
    if img.mode == "P":
        img = img.convert("RGBA")
    if img.mode in _ALPHA_FMTS:
        background = Image.new("RGB", img.size, bg)
        background.paste(img, mask=img.split()[-1])
        return background
    return img.convert("RGB")


def convert(input_path: Path, output_path: Path, fmt: str, quality: int = 85) -> None:
    """Convert any Pillow-supported image to the given output format."""
    fmt = fmt.lower()

    with Image.open(input_path) as img:
        # Animated GIF → animated WebP
        if fmt == "webp" and getattr(img, "n_frames", 1) > 1:
            frames: list[Image.Image] = []
            for i in range(img.n_frames):
                img.seek(i)
                frames.append(img.copy().convert("RGBA"))
            durations = [img.info.get("duration", 100)] * len(frames)
            frames[0].save(
                output_path,
                format="WEBP",
                save_all=True,
                append_images=frames[1:],
                quality=quality,
                loop=0,
                duration=durations,
            )
            return

        # GIF: extract first frame only for non-GIF targets
        if getattr(img, "n_frames", 1) > 1 and fmt != "gif":
            img.seek(0)
            img = img.copy()

        # Flatten alpha for formats that don't support it
        if fmt in _NEEDS_RGB:
            img = _to_rgb(img)
        elif fmt == "gif" and img.mode not in ("P", "RGB", "L"):
            img = img.convert("P")
        elif img.mode not in ("RGB", "RGBA", "L", "P", "1"):
            img = img.convert("RGB")

        pil_fmt = {"jpg": "JPEG", "jpeg": "JPEG"}.get(fmt, fmt.upper())
        save_kwargs: dict = {}
        if fmt in ("jpg", "jpeg", "webp"):
            save_kwargs["quality"] = quality
        if fmt == "ico":
            save_kwargs["sizes"] = [(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)]

        img.save(output_path, format=pil_fmt, **save_kwargs)


def svg_to_raster(svg_path: Path, output_path: Path, fmt: str, scale: float = 2.0) -> None:
    """Convert SVG to PNG, PDF, or JPEG using cairosvg."""
    try:
        import cairosvg  # type: ignore[import-untyped]
    except Exception as exc:
        raise RuntimeError(
            "cairosvg is required for SVG conversions. "
            "Install the Cairo library for your OS and run: pip install cairosvg"
        ) from exc

    fmt = fmt.lower()
    if fmt == "png":
        cairosvg.svg2png(url=str(svg_path), write_to=str(output_path), scale=scale)
    elif fmt == "pdf":
        cairosvg.svg2pdf(url=str(svg_path), write_to=str(output_path))
    elif fmt in ("jpg", "jpeg"):
        tmp = output_path.with_suffix(".tmp.png")
        try:
            cairosvg.svg2png(url=str(svg_path), write_to=str(tmp), scale=scale)
            with Image.open(tmp) as img:
                bg = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "RGBA":
                    bg.paste(img, mask=img.split()[3])
                else:
                    bg.paste(img)
                bg.save(output_path, format="JPEG", quality=85)
        finally:
            tmp.unlink(missing_ok=True)
    else:
        raise ValueError(f"Unsupported SVG output format: {fmt}")


def resize(
    input_path: Path,
    output_path: Path,
    width: int,
    height: int,
    maintain_ratio: bool = True,
    quality: int = 85,
) -> None:
    with Image.open(input_path) as img:
        if maintain_ratio:
            img.thumbnail((width, height), Image.LANCZOS)
        else:
            img = img.resize((width, height), Image.LANCZOS)
        fmt = output_path.suffix.lstrip(".").lower()
        pil_fmt = {"jpg": "JPEG"}.get(fmt, fmt.upper())
        save_kwargs: dict = {}
        if fmt in ("jpg", "jpeg", "webp"):
            save_kwargs["quality"] = quality
        img.save(output_path, format=pil_fmt, **save_kwargs)


def compress(input_path: Path, output_path: Path, quality: int = 60) -> None:
    with Image.open(input_path) as img:
        fmt = output_path.suffix.lstrip(".").lower()
        if fmt in _NEEDS_RGB:
            img = _to_rgb(img)
        pil_fmt = {"jpg": "JPEG"}.get(fmt, fmt.upper())
        img.save(output_path, format=pil_fmt, quality=quality, optimize=True)
