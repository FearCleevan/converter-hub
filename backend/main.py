import logging
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv()

from routers import (
    image,
    video,
    audio,
    document,
    spreadsheet,
    presentation,
    ebook,
    archive,
    vector,
    cad,
    font,
    code_data,
)

# ── Logging ────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("converthub")

# ── App ────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="ConvertHub API",
    version="2.0.0",
    description="Self-hosted universal file converter. 169 endpoints. Zero rate limits.",
)

# ── CORS ───────────────────────────────────────────────────────────────────────

_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────

for _module, _prefix in [
    (image,        "/api/image"),
    (video,        "/api/video"),
    (audio,        "/api/audio"),
    (document,     "/api/document"),
    (spreadsheet,  "/api/spreadsheet"),
    (presentation, "/api/presentation"),
    (ebook,        "/api/ebook"),
    (archive,      "/api/archive"),
    (vector,       "/api/vector"),
    (cad,          "/api/cad"),
    (font,         "/api/font"),
    (code_data,    "/api/code"),
]:
    app.include_router(_module.router, prefix=_prefix)

# ── Temp cleanup scheduler ─────────────────────────────────────────────────────

try:
    from apscheduler.schedulers.asyncio import AsyncIOScheduler

    _TEMP_DIR = Path(os.getenv("TEMP_DIR", "temp"))

    def _clean_temp() -> None:
        now = time.time()
        removed = 0
        for f in _TEMP_DIR.glob("*"):
            if f.is_file() and (now - f.stat().st_mtime) > 3600:
                f.unlink(missing_ok=True)
                removed += 1
        if removed:
            logger.info(f"Cleaned {removed} stale temp files")

    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(_clean_temp, "interval", minutes=30)

    @app.on_event("startup")
    def _start_scheduler() -> None:
        _scheduler.start()
        logger.info("Temp cleanup scheduler started (runs every 30 min)")

except ImportError:
    logger.warning("apscheduler not installed — temp cleanup disabled")

# ── Global exception handler ───────────────────────────────────────────────────

@app.exception_handler(Exception)
async def _catch_all(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled exception on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )

# ── Health ─────────────────────────────────────────────────────────────────────

@app.get("/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok", "version": "2.0.0"}


@app.get("/", tags=["meta"])
def root() -> dict:
    return {"message": "ConvertHub API", "docs": "/docs", "health": "/health"}
