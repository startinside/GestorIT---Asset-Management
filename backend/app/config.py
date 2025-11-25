import os
from datetime import timedelta


class Config:
    """Configuração básica da aplicação Flask."""

    # Chave secreta da aplicação
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")

    # Banco principal (multi-tenant pode ser construído em cima disso)
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "sqlite:///gestorit.db",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=4)

    # CORS / Frontend
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

    # Diretório base para bancos de tenants (se for usar multi-db depois)
    TENANT_DB_DIR = os.environ.get("TENANT_DB_DIR", os.path.join(os.getcwd(), "tenants"))

    # Outros ajustes que você queira adicionar futuramente
    ENV = os.environ.get("FLASK_ENV", "development")
    DEBUG = ENV == "development"
