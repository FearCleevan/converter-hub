import io
import tarfile
import zipfile
from pathlib import Path

import py7zr

try:
    import patoollib as patool
    _HAS_PATOOL = True
except ImportError:
    _HAS_PATOOL = False


def extract(inp: Path, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    suffix = inp.suffix.lower()
    if suffix == ".zip":
        with zipfile.ZipFile(inp, "r") as zf:
            zf.extractall(output_dir)
    elif suffix == ".7z":
        with py7zr.SevenZipFile(inp, mode="r") as zf:
            zf.extractall(output_dir)
    elif suffix in (".tar", ".gz", ".bz2", ".xz", ".tgz"):
        with tarfile.open(inp) as tf:
            tf.extractall(output_dir)
    elif _HAS_PATOOL:
        patool.extract_archive(str(inp), outdir=str(output_dir))
    else:
        raise RuntimeError(
            f"Cannot extract {suffix} — install patool for broader archive support."
        )


def create_zip(file_paths: list[Path], out: Path) -> None:
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in file_paths:
            zf.write(p, p.name)


def create_7z(file_paths: list[Path], out: Path) -> None:
    with py7zr.SevenZipFile(out, mode="w") as zf:
        for p in file_paths:
            zf.write(p, p.name)


def create_tar_gz(file_paths: list[Path], out: Path) -> None:
    with tarfile.open(out, "w:gz") as tf:
        for p in file_paths:
            tf.add(p, arcname=p.name)


def inspect_zip(inp: Path) -> list[dict]:
    with zipfile.ZipFile(inp, "r") as zf:
        return [
            {
                "name": i.filename,
                "size": i.file_size,
                "compressed": i.compress_size,
                "ratio": round(1 - i.compress_size / i.file_size, 3) if i.file_size else 0,
            }
            for i in zf.infolist()
        ]


def compress_zip(inp: Path, out: Path) -> None:
    with zipfile.ZipFile(inp, "r") as src, zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as dst:
        for item in src.infolist():
            dst.writestr(item, src.read(item.filename))


def zip_to_tar(inp: Path, out: Path) -> None:
    with zipfile.ZipFile(inp, "r") as zf, tarfile.open(out, "w:gz") as tf:
        for name in zf.namelist():
            data = zf.read(name)
            buf = io.BytesIO(data)
            info = tarfile.TarInfo(name=name)
            info.size = len(data)
            tf.addfile(info, buf)


def rar_to_zip(inp: Path, out: Path, extract_dir: Path) -> None:
    extract(inp, extract_dir)
    files = [f for f in extract_dir.rglob("*") if f.is_file()]
    create_zip(files, out)


def sevenz_to_zip(inp: Path, out: Path, extract_dir: Path) -> None:
    with py7zr.SevenZipFile(inp, mode="r") as zf:
        zf.extractall(extract_dir)
    files = [f for f in extract_dir.rglob("*") if f.is_file()]
    create_zip(files, out)
