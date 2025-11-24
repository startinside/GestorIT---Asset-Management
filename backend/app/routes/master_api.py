from flask import Blueprint, request, jsonify

master_bp = Blueprint("master_api", __name__)

# -------------------------------------------------------------------
# Dados estáticos em memória para testes iniciais
# -------------------------------------------------------------------

COMPANIES = [
    {
        "id": "c1",
        "name": "Empresa Exemplo LTDA",
        "cnpj": "00.000.000/0001-00",
        "active": True,
        "status": "ATIVA",  # CompanyStatus
        "plan": "STARTER",  # CompanyPlan
        "contactEmail": "contato@empresaexemplo.com",
        "limits": {
            "users": 10,
            "branches": 5,
            "equipments": 500,
        },
        "renewalDate": "2026-01-01",
        "isOverdue": False,
    }
]

TRANSACTIONS = [
    {
        "id": "t1",
        "companyId": "c1",
        "date": "2025-01-01",
        "type": "MENSALIDADE",        # 'MENSALIDADE' | 'RENOVACAO' | ...
        "amount": 197.0,
        "paymentMethod": "PIX",       # 'BOLETO' | 'PIX' | 'CARTAO' | 'MANUAL'
        "status": "PAGO",             # 'PAGO' | 'PENDENTE'
    }
]

MASTER_USERS = [
    {
        "id": "u-master-1",
        "name": "Master Admin",
        "email": "master@gestorit.com",
        "role": "superadmin_sistema",
        "avatarUrl": None,
        "companies": [c["id"] for c in COMPANIES],
    }
]


def _api_response(data=None, meta=None, errors=None, status_code=200):
    return jsonify(
        {
            "data": data,
            "meta": meta or {},
            "errors": errors,
        }
    ), status_code


# -------------------------------------------------------------------
# Autenticação Master: /api/master/v1/auth/login
# -------------------------------------------------------------------
@master_bp.post("/auth/login")
def master_login():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email")
    password = payload.get("password")

    if email == "master@gestorit.com" and password == "123":
        user = MASTER_USERS[0]
        token = "fake-master-token"
        # AuthResponse = { token, user }
        return _api_response({"token": token, "user": user})

    return _api_response(
        None,
        errors={"message": "Credenciais inválidas"},
        status_code=401,
    )


# -------------------------------------------------------------------
# Empresas (Master): /api/master/v1/empresas
# -------------------------------------------------------------------
@master_bp.get("/empresas")
def list_companies():
    return _api_response(COMPANIES)


# -------------------------------------------------------------------
# Pagamentos (Master): /api/master/v1/pagamentos
# -------------------------------------------------------------------
@master_bp.get("/pagamentos")
def list_transactions():
    return _api_response(TRANSACTIONS)


# -------------------------------------------------------------------
# Usuários Master (opcional): /api/master/v1/usuarios
# -------------------------------------------------------------------
@master_bp.get("/usuarios")
def list_master_users():
    return _api_response(MASTER_USERS)
