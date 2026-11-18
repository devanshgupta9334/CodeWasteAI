import time
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database.db import init_db
from .routes import analyze, history, settings, export

app = FastAPI(
    title="CodeWaste Detector API",
    description="Intelligent static code optimization and redundant waste detection platform",
    version="1.0.0"
)
@app.get("/")
def home():
    return {
        "message": "Welcome to CodeWasteAI",
        "status": "Backend is running successfully"
    }
    
START_TIME = time.time()

# Configure CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database
init_db()

# Include routers
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

# If frontend build directory exists, mount it
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
