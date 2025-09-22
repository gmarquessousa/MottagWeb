from flask import Flask
from dotenv import load_dotenv
import os


def create_app():
    """Application factory for the Flask app."""
    load_dotenv()

    # Tell Flask where to find 'templates' and 'static' (they are at project root)
    app = Flask(
        __name__,
        template_folder='../templates',
        static_folder='../static'
    )
    # Basic config
    app.config['GOOGLE_MAPS_API_KEY'] = os.getenv('GOOGLE_MAPS_API_KEY', '')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')

    # Register routes
    from .routes import bp as routes_bp
    app.register_blueprint(routes_bp)

    return app
