"""
Root entry point — run with: python main.py
"""
import uvicorn
from app.config import get_settings

# Expose the FastAPI app instance so Vercel's Python builder can find it
from app.app import app

# Vercel needs this EXACT variable name at the root of the file it routes to
app = app

settings = get_settings()

if __name__ == "__main__":
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info",
    )
