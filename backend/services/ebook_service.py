import subprocess
from pathlib import Path
from utils.platform_utils import get_calibre_path


def ebook_convert(inp: Path, out: Path) -> None:
    calibre = get_calibre_path()
    subprocess.run(
        [calibre, str(inp), str(out)],
        check=True,
        capture_output=True,
        timeout=180,
    )
