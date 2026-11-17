from flask import Flask
from flask_cors import CORS

from .dao import inicializar_banco


def create_app():
    app = Flask(__name__)  # usa app/templates e app/static
    CORS(app)
    inicializar_banco()

    from .routes import bp
    app.register_blueprint(bp)
    return app
