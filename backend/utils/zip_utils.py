import zipfile
from pathlib import Path


def bundle_to_zip(files: list[tuple[Path, str]], output_path: Path) -> None:
    """Bundle files into a ZIP archive.

    Args:
        files: List of (file_path, name_in_zip) tuples.
        output_path: Destination .zip path.
    """
    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for path, arc_name in files:
            zf.write(path, arc_name)
