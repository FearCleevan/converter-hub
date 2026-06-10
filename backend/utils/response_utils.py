from pathlib import Path
from starlette.background import BackgroundTask
from fastapi.responses import FileResponse
from utils.file_utils import cleanup


def file_response(
    path: Path,
    media_type: str,
    filename: str,
    *cleanup_paths: Path,
) -> FileResponse:
    return FileResponse(
        str(path),
        media_type=media_type,
        filename=filename,
        background=BackgroundTask(cleanup, path, *cleanup_paths),
    )
