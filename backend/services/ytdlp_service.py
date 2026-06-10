import asyncio
import subprocess
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

_executor = ThreadPoolExecutor(
    max_workers=4,
    thread_name_prefix="ytdlp",
)


def _check_ytdlp() -> None:
    try:
        subprocess.run(["yt-dlp", "--version"], capture_output=True, check=True, timeout=5)
    except FileNotFoundError:
        raise RuntimeError(
            "yt-dlp is not installed. Install it with: pip install yt-dlp"
        )


def _dl_mp4(url: str, path: Path) -> None:
    _check_ytdlp()
    subprocess.run(
        ["yt-dlp", "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/mp4",
         "--merge-output-format", "mp4", "-o", str(path), url],
        check=True,
        timeout=600,
    )


def _dl_mp3(url: str, path: Path) -> None:
    _check_ytdlp()
    subprocess.run(
        ["yt-dlp", "-x", "--audio-format", "mp3", "--audio-quality", "0",
         "-o", str(path), url],
        check=True,
        timeout=600,
    )


def _dl_webm(url: str, path: Path) -> None:
    _check_ytdlp()
    subprocess.run(
        ["yt-dlp", "-f", "bestvideo[ext=webm]+bestaudio[ext=webm]/webm",
         "-o", str(path), url],
        check=True,
        timeout=600,
    )


async def download_mp4(url: str, path: Path) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_executor, _dl_mp4, url, path)


async def download_mp3(url: str, path: Path) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_executor, _dl_mp3, url, path)


async def download_webm(url: str, path: Path) -> None:
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_executor, _dl_webm, url, path)
