from fastapi import HTTPException


def not_found(detail: str = "Resource not found") -> None:
    raise HTTPException(status_code=404, detail=detail)


def bad_request(detail: str) -> None:
    raise HTTPException(status_code=400, detail=detail)


def server_error(detail: str = "Conversion failed") -> None:
    raise HTTPException(status_code=500, detail=detail)


def too_large(size_mb: float, max_mb: int) -> None:
    raise HTTPException(
        status_code=413,
        detail=f"File too large ({size_mb:.1f} MB). Maximum allowed: {max_mb} MB.",
    )
