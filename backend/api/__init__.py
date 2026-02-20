"""API package - Flask Blueprints"""
from .documents import documents_bp
from .analysis import analysis_bp

__all__ = ["documents_bp", "analysis_bp"]
