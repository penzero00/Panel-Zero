"""
FastAPI Application Entry Point
Configures routes, middleware, and startup logic
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core import settings
from api import documents_router, analysis_router

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    debug=settings.DEBUG,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(documents_router)
app.include_router(analysis_router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "api": settings.API_TITLE,
        "version": settings.API_VERSION,
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "PanelZero API",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
