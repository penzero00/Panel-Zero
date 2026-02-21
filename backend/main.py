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
from api.agent_profiles import agent_profiles_bp
from api.user_profiles import user_profiles_bp

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
app.register_blueprint(agent_profiles_bp)
app.register_blueprint(user_profiles_bp)


# Initialize and log AI services
def _log_service_status():
    """Log the status of configured AI and data services"""
    print("\n" + "="*60)
    print("PanelZero Services Status:")
    print("="*60)
    
    # Check Azure OpenAI
    if settings.AZURE_OPENAI_ENDPOINT and settings.AZURE_OPENAI_API_KEY:
        print(f"[OK] Azure OpenAI GPT connected")
        print(f"     Model: {settings.AZURE_OPENAI_MODEL}")
        print(f"     Endpoint: {settings.AZURE_OPENAI_ENDPOINT_BASE}")
    else:
        print("[WARN] Azure OpenAI GPT: Not configured")
    
    print("="*60 + "\n")


_log_service_status()


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
            "agent_profiles": "GET /api/v1/agent-profiles",
        },
    }


if __name__ == "__main__":
    # For local development only
    app.run(debug=settings.DEBUG, host="0.0.0.0", port=8000)
