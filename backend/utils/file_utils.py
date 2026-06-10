import uuid
import os
from pathlib import Path
from fastapi import HTTPException, UploadFile
from dotenv import load_dotenv

load_dotenv()

TEMP_DIR = Path(os.getenv("TEMP_DIR", "temp"))
TEMP_DIR.mkdir(exist_ok=True)
MAX_MB = int(os.getenv("MAX_FILE_SIZE_MB", "500"))


def temp_path(ext: str) -> Path:
    return TEMP_DIR / f"{uuid.uuid4().hex}.{ext}"


async def save_upload(file: UploadFile, ext: str) -> Path:
    content = await file.read()
    mb = len(content) / 1_048_576
    if mb > MAX_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({mb:.1f} MB). Maximum allowed: {MAX_MB} MB.",
        )
    path = temp_path(ext)
    path.write_bytes(content)
    return path


async def cleanup(*paths: Path) -> None:
    for p in paths:
        try:
            p.unlink(missing_ok=True)
        except Exception:
            pass
