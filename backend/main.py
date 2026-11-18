import time
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database.db import init_db
from .routes import analyze, history, settings, export

app = FastAPI(
    title="CodeWaste Detector API",
    description="Intelligent static code optimization and redundant waste detection platform",
    version="1.0.0"
)

START_TIME = time.time()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database
init_db()

# Include API routers
app.include_router(analyze.router)
app.include_router(history.router)
app.include_router(settings.router)
app.include_router(export.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CodeWaste Detector",
        "version": "1.0.0",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "supported_languages": ["python", "javascript", "typescript", "java", "cpp", "c"],
        "analyzers": {
            "python": "AST-based Scope & Control Flow Analyzer",
            "javascript": "Lexical & Block AST Analyzer",
            "java": "Compilation Unit & String Optimization Analyzer",
            "cpp": "Preprocessor & I/O Stream Analyzer",
            "universal": "Normalized Sliding Window Block Duplicate Detector"
        }
    }

# SPA Static file serving & client-side route fallback
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not Found")
        target_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(target_path) and os.path.isfile(target_path):
            return FileResponse(target_path)
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"service": "CodeWaste Detector"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port)
