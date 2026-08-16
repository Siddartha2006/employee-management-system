import os
from flask import Flask, request, jsonify
from app.extensions import db, cors
from app.config import config_by_name, Config

def create_app(config_name=None):
    """
    Application factory for Flask app initialization.
    """
    app = Flask(__name__)

    # Determine configuration
    if config_name is None:
        config_name = os.getenv("FLASK_ENV", "development").lower()
    
    if isinstance(config_name, str):
        app_config = config_by_name.get(config_name, Config)
        app.config.from_object(app_config)
    else:
        app.config.from_object(config_name)

    # Initialize extensions
    db.init_app(app)
    
    # Configure CORS extension
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
    )

    # Bulletproof CORS middleware for preflight and cross-origin requests
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = app.make_default_options_response()
            origin = request.headers.get("Origin", "*")
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
            response.headers["Access-Control-Max-Age"] = "86400"
            return response

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin", "*")
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response

    # Register blueprints
    from app.routes import api_bp
    app.register_blueprint(api_bp)

    # Root redirect / landing check
    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "service": "Employee Management System API",
            "version": "1.0.0",
            "health": "/api/health",
            "endpoints": "/api/employees",
            "docs": "/api/health"
        }), 200

    # Register centralized error handlers for clean JSON responses
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "error": "Bad Request",
            "message": getattr(error, "description", "The request could not be understood by the server.")
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Resource Not Found",
            "message": "The requested URL or resource was not found on this server."
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "error": "Method Not Allowed",
            "message": "The HTTP method used is not allowed for the requested resource."
        }), 405

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "message": "An unexpected server error occurred. Please try again later."
        }), 500

    # Create tables if using SQLite or in development
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.warning(f"Could not auto-create database tables on startup: {e}")

    return app
