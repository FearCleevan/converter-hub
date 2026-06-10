import subprocess
from pathlib import Path

from utils.file_utils import temp_path


def _run(args: list[str], timeout: int = 300) -> None:
    """Run an ffmpeg command, raising RuntimeError on failure."""
    try:
        result = subprocess.run(
            ["ffmpeg", "-y", *args],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
    except FileNotFoundError:
        raise RuntimeError(
            "ffmpeg is not installed or not on PATH. "
            "Install it from https://ffmpeg.org/download.html"
        )
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg error:\n{result.stderr[-800:]}")


# ── Video ─────────────────────────────────────────────────────────────────────

def mp4_to_mp3(inp: Path, out: Path, bitrate: str = "192k") -> None:
    _run(["-i", str(inp), "-vn", "-ab", bitrate, "-ar", "44100", str(out)])


def mp4_to_wav(inp: Path, out: Path) -> None:
    _run(["-i", str(inp), "-vn", "-acodec", "pcm_s16le", "-ar", "44100", str(out)])


def mp4_to_webm(inp: Path, out: Path, crf: int = 33) -> None:
    _run([
        "-i", str(inp),
        "-c:v", "libvpx-vp9", "-crf", str(crf), "-b:v", "0",
        "-c:a", "libopus",
        str(out),
    ])


def mp4_to_gif(inp: Path, out: Path, start: int = 0, duration: int = 10,
               fps: int = 12, scale: int = 480) -> None:
    """Two-pass palette GIF generation for best quality."""
    palette = temp_path("png")
    try:
        _run([
            "-ss", str(start), "-t", str(duration), "-i", str(inp),
            "-vf", f"fps={fps},scale={scale}:-1:flags=lanczos,palettegen",
            str(palette),
        ])
        _run([
            "-ss", str(start), "-t", str(duration),
            "-i", str(inp), "-i", str(palette),
            "-filter_complex",
            f"fps={fps},scale={scale}:-1:flags=lanczos[x];[x][1:v]paletteuse",
            "-loop", "0", str(out),
        ])
    finally:
        palette.unlink(missing_ok=True)


def gif_to_mp4(inp: Path, out: Path) -> None:
    _run([
        "-i", str(inp),
        "-movflags", "faststart",
        "-pix_fmt", "yuv420p",
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        str(out),
    ])


def video_any_to_mp4(inp: Path, out: Path) -> None:
    _run([
        "-i", str(inp),
        "-c:v", "libx264", "-crf", "23", "-preset", "medium",
        "-c:a", "aac",
        str(out),
    ])


def video_any_to_mp3(inp: Path, out: Path, bitrate: str = "192k") -> None:
    _run(["-i", str(inp), "-vn", "-ab", bitrate, "-ar", "44100", str(out)])


def video_any_to_wav(inp: Path, out: Path) -> None:
    _run(["-i", str(inp), "-vn", "-acodec", "pcm_s16le", "-ar", "44100", str(out)])


def video_compress(inp: Path, out: Path, crf: int = 28) -> None:
    _run([
        "-i", str(inp),
        "-c:v", "libx264", "-crf", str(crf), "-preset", "medium",
        "-c:a", "copy",
        str(out),
    ])


def video_trim(inp: Path, out: Path, start: float, end: float) -> None:
    _run(["-ss", str(start), "-to", str(end), "-i", str(inp), "-c", "copy", str(out)])


def video_resize(inp: Path, out: Path, width: int, height: int) -> None:
    # h264 requires even dimensions
    w = width if width % 2 == 0 else width + 1
    h = height if height % 2 == 0 else height + 1
    _run(["-i", str(inp), "-vf", f"scale={w}:{h}", "-c:a", "copy", str(out)])


# ── Audio ─────────────────────────────────────────────────────────────────────

def any_to_mp3(inp: Path, out: Path, bitrate: str = "192k") -> None:
    _run(["-i", str(inp), "-vn", "-ab", bitrate, "-ar", "44100", str(out)])


def any_to_wav(inp: Path, out: Path) -> None:
    _run(["-i", str(inp), "-vn", "-acodec", "pcm_s16le", "-ar", "44100", str(out)])


def any_to_flac(inp: Path, out: Path) -> None:
    _run(["-i", str(inp), "-vn", "-c:a", "flac", str(out)])


def any_to_ogg(inp: Path, out: Path, quality: int = 5) -> None:
    _run(["-i", str(inp), "-vn", "-c:a", "libvorbis", "-q:a", str(quality), str(out)])


def any_to_aac(inp: Path, out: Path, bitrate: str = "192k") -> None:
    _run(["-i", str(inp), "-vn", "-c:a", "aac", "-b:a", bitrate, str(out)])


def any_to_m4a(inp: Path, out: Path, bitrate: str = "192k") -> None:
    _run(["-i", str(inp), "-vn", "-c:a", "aac", "-b:a", bitrate, str(out)])


def audio_trim(inp: Path, out: Path, start: float, end: float) -> None:
    _run(["-ss", str(start), "-to", str(end), "-i", str(inp), "-c", "copy", str(out)])


def audio_compress(inp: Path, out: Path, bitrate: str = "128k") -> None:
    _run(["-i", str(inp), "-vn", "-ab", bitrate, "-ar", "44100", str(out)])


def audio_merge(input_paths: list[Path], out: Path) -> None:
    """Concatenate multiple audio files into one."""
    n = len(input_paths)
    inputs: list[str] = []
    for p in input_paths:
        inputs.extend(["-i", str(p)])
    filter_str = "".join(f"[{i}:a]" for i in range(n)) + f"concat=n={n}:v=0:a=1[outa]"
    _run([*inputs, "-filter_complex", filter_str, "-map", "[outa]", str(out)])
