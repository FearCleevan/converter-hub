import subprocess
import platform
import os
from dotenv import load_dotenv

load_dotenv()


def _find_tool(env_key: str, candidates: list[str], name: str) -> str:
    from_env = os.getenv(env_key, "").strip()
    if from_env:
        return from_env

    for candidate in candidates:
        try:
            subprocess.run(
                [candidate, "--version"],
                capture_output=True,
                timeout=5,
            )
            return candidate
        except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
            continue

    raise RuntimeError(
        f"{name} not found. Install it and set {env_key} in .env, "
        f"or ensure it is on your PATH."
    )


def get_libreoffice_path() -> str:
    system = platform.system()
    if system == "Windows":
        candidates = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
            "soffice",
        ]
    elif system == "Darwin":
        candidates = [
            "/Applications/LibreOffice.app/Contents/MacOS/soffice",
            "soffice",
            "libreoffice",
        ]
    else:
        candidates = ["libreoffice", "soffice"]

    return _find_tool("LIBREOFFICE_PATH", candidates, "LibreOffice")


def get_inkscape_path() -> str:
    system = platform.system()
    if system == "Windows":
        candidates = [
            r"C:\Program Files\Inkscape\bin\inkscape.exe",
            r"C:\Program Files (x86)\Inkscape\bin\inkscape.exe",
            "inkscape",
        ]
    elif system == "Darwin":
        candidates = [
            "/Applications/Inkscape.app/Contents/MacOS/inkscape",
            "inkscape",
        ]
    else:
        candidates = ["inkscape"]

    return _find_tool("INKSCAPE_PATH", candidates, "Inkscape")


def get_calibre_path() -> str:
    return _find_tool("CALIBRE_PATH", ["ebook-convert"], "Calibre ebook-convert")


def get_ffmpeg_path() -> str:
    return _find_tool("FFMPEG_PATH", ["ffmpeg"], "ffmpeg")
