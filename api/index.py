"""
Vercel Serverless Function Entry Point
Exports Flask app for Vercel deployment

This file should be at the root /api directory for Vercel to recognize it as a serverless function.
Routes all backend requests through the Flask app.
"""

import sys
import os

# Add backend to Python path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import Flask app from backend
from main import app

# Export for Vercel
handler = app
