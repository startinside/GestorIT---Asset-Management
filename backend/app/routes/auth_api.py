from flask import Blueprint, jsonify

auth_bp = Blueprint("auth_api", __name__)


@auth_bp.get("/health")
def auth_health():
    """
    Endpoint simples apenas para indicar que o módulo de autenticação está ativo.
    Não é usado diretamente pelo frontend, mas facilita debug.
    """
    return jsonify(
        {
            "data": {"message": "auth api ok"},
            "meta": {},
            "errors": None,
        }
    ), 200
