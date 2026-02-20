"""
Flask Application Entry Point for PanelZero
Configures routes, middleware, and startup logic
Vercel-ready serverless backend
"""

from flask import Flask
from flask_cors import CORS
from core.config import settings
from api.documents import documents_bp
from api.analysis import analysis_bp

app = Flask(__name__)

# CORS Configuration
CORS(
    app,
    origins=["http://localhost:3000", "http://localhost:8000"],
    supports_credentials=True,
)

# Register blueprints
app.register_blueprint(documents_bp)
app.register_blueprint(analysis_bp)


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "api": settings.API_TITLE,
        "version": settings.API_VERSION,
    }


@app.route("/", methods=["GET"])
def root():
    """Root endpoint"""
    return {
        "message": "PanelZero API",
        "health": "/api/health",
        "docs": "/api/docs",
    }


@app.route("/api/docs", methods=["GET"])
def docs():
    """API Documentation endpoint"""
    return {
        "endpoints": {
            "health": "GET /api/health",
            "documents": "POST /api/v1/documents/upload",
            "analysis": "POST /api/v1/analysis/start",
        },
    }


if __name__ == "__main__":
    # For local development only
    app.run(debug=settings.DEBUG, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
