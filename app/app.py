"""
FastAPI Application Factory
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routes.analysis import router as analysis_router
from app.routes.health import router as health_router

settings = get_settings()

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🧬 PGx Risk Prediction API starting up...")
    logger.info("LLM Provider: %s | Model: %s", settings.llm_provider, settings.active_llm_model)
    yield
    logger.info("🧬 PGx Risk Prediction API shutting down.")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "End-to-End Pharmacogenomic Risk Prediction System. "
            "Upload a VCF file and drug names to receive CPIC-aligned risk assessments "
            "and LLM-generated clinical narratives."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Tighten in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Global Exception Handler ──────────────────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "detail": "An unexpected internal error occurred."},
        )

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(analysis_router)
    app.include_router(health_router)

    import os
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    
    frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

    if os.path.isdir(frontend_dist):
        logger.info(f"Serving frontend SPA from {frontend_dist}")
        
        # Mount the statically generated assets directory
        assets_dir = os.path.join(frontend_dist, "assets")
        if os.path.isdir(assets_dir):
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        # Catch-all route for the React Single Page Application
        @app.get("/{full_path:path}", include_in_schema=False)
        async def serve_spa(full_path: str):
            # Check if attempting to load a specific static file (like favicon)
            file_path = os.path.join(frontend_dist, full_path)
            if os.path.isfile(file_path) and full_path != "":
                return FileResponse(file_path)
            
            # For all other routes, serve index.html for React Router
            index_path = os.path.join(frontend_dist, "index.html")
            if os.path.isfile(index_path):
                return FileResponse(index_path)
            
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
    else:
        logger.warning(f"Frontend dist not found at {frontend_dist}. Running API only mode.")
        @app.get("/", tags=["Root"])
        async def root():
            return {
                "name": settings.app_name,
                "version": settings.app_version,
                "docs": "/docs",
                "health": "/api/v1/health",
                "analyze": "POST /api/v1/analyze",
                "frontend_status": "Not built",
            }

    return app


app = create_app()
