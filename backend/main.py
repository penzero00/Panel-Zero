"""
Flask Application Entry Point for PanelZero
Configures routes, middleware, and startup logic
Vercel-ready serverless backend
"""

from flask import Flask, jsonify
from flask_cors import CORS
from core.config import settings
from api.documents import documents_bp
from api.analysis import analysis_bp

app = Flask(__name__)

# CORS Configuration - Allow all origins for Vercel
CORS(
    app,
    origins="*",
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
)

# Register blueprints
app.register_blueprint(documents_bp)
app.register_blueprint(analysis_bp)


@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "api": settings.API_TITLE,
        "version": settings.API_VERSION,
    })


@app.route("/", methods=["GET"])
def root():
    """Root endpoint"""
    return jsonify({
        "message": "PanelZero API",
        "health": "/api/health",
        "docs": "/api/docs",
    })


@app.route("/api/docs", methods=["GET"])
def docs():
    """API Documentation endpoint"""
    return jsonify({
        "endpoints": {
            "health": "GET /api/health",
            "documents": "POST /api/v1/documents/upload",
            "analysis": "POST /api/v1/analysis/start",
        },
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    # Local development only
    app.run(debug=settings.DEBUG, host="0.0.0.0", port=8000)
