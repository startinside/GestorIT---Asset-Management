import os

from flask import Flask, jsonify
from .config import Config
from .extensions import db, migrate, cors, jwt

def create_app(config_class=Config) -> Flask:
    app = Flask(__name__)

    # Pasta de upload de avatares (dentro da pasta static)
    avatars_path = os.path.join(app.static_folder, "avatars")
    os.makedirs(avatars_path, exist_ok=True)
    app.config["AVATAR_UPLOAD_FOLDER"] = avatars_path

    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})
    jwt.init_app(app)

    from .routes.auth_api import auth_bp
    from .routes.master_api import master_bp
    from .routes.tenant_api import tenant_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(master_bp, url_prefix="/api/master/v1")
    app.register_blueprint(tenant_bp, url_prefix="/api/v1")

    @app.get("/api/health")
    def healthcheck():
        return jsonify({"data": {"status": "ok"}, "meta": {}, "errors": None}), 200

    return app
