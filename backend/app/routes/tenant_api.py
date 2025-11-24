from flask import Blueprint, request, jsonify

tenant_bp = Blueprint("tenant_api", __name__)

# -------------------------------------------------------------------
# Dados estáticos em memória para testes iniciais
# -------------------------------------------------------------------

TENANT_USERS = [
    {
        "id": "u-tenant-1",
        "name": "Admin Cliente",
        "email": "admin@gestorit.com",
        "role": "admin_empresa",
        "avatarUrl": None,
        "companies": ["c1"],
    }
]

BRANCHES = [
    {
        "id": "b1",
        "companyId": "c1",
        "name": "Matriz",
        "code": "MAT",
    },
    {
        "id": "b2",
        "companyId": "c1",
        "name": "Filial 1",
        "code": "F1",
    },
]

STATUSES = [
    {
        "id": "st1",
        "companyId": "c1",
        "name": "Funcionando",
        "color": "#16a34a",  # verde
        "isSystemDefault": True,
    },
    {
        "id": "st2",
        "companyId": "c1",
        "name": "Em Manutenção",
        "color": "#eab308",  # amarelo
        "isSystemDefault": True,
    },
    {
        "id": "st3",
        "companyId": "c1",
        "name": "Parado",
        "color": "#dc2626",  # vermelho
        "isSystemDefault": False,
    },
]

EQUIPMENTS = [
    {
        "id": "eq1",
        "companyId": "c1",
        "branchId": "b1",
        "type": "Notebook",
        "brand": "Dell",
        "model": "Inspiron 15",
        "serialNumber": "SN-ABC-123",
        "internalId": "NBK-001",
        "patrimonyId": "PAT-1001",
        "statusId": "st1",
        "description": "Notebook do financeiro",
        "acquisitionDate": "2024-01-10",
        "imageUrl": None,
    },
    {
        "id": "eq2",
        "companyId": "c1",
        "branchId": "b2",
        "type": "Desktop",
        "brand": "HP",
        "model": "ProDesk",
        "serialNumber": "SN-XYZ-789",
        "internalId": "DTP-005",
        "patrimonyId": "PAT-2001",
        "statusId": "st2",
        "description": "Estação de trabalho da recepção",
        "acquisitionDate": "2023-11-05",
        "imageUrl": None,
    },
]

TICKETS = [
    {
        "id": "tk1",
        "companyId": "c1",
        "equipmentId": "eq2",
        "title": "Computador travando",
        "description": "Máquina reiniciando sozinha várias vezes ao dia.",
        "kanbanStatus": "Aberto",
        "priority": "Alta",
        "responsibleId": "u-tenant-1",
        "createdAt": "2025-01-15T10:00:00",
        "dueDate": "2025-01-20T18:00:00",
        "completedAt": None,
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


def _get_company_id_from_header():
    """
    Recupera o companyId do header X-Company-Id.
    Se não vier nada, retorna 'c1' como default.
    """
    company_id = request.headers.get("X-Company-Id")
    if not company_id:
        company_id = "c1"
    return company_id


# -------------------------------------------------------------------
# Autenticação Tenant: /api/v1/auth/login
# -------------------------------------------------------------------
@tenant_bp.post("/auth/login")
def tenant_login():
    payload = request.get_json(silent=True) or {}
    email = payload.get("email")
    password = payload.get("password")

    if email == "admin@gestorit.com" and password == "123":
        user = TENANT_USERS[0]
        token = "fake-tenant-token"
        return _api_response({"token": token, "user": user})

    return _api_response(
        None,
        errors={"message": "Credenciais inválidas"},
        status_code=401,
    )


# -------------------------------------------------------------------
# Equipamentos: /api/v1/equipamentos
# -------------------------------------------------------------------
@tenant_bp.get("/equipamentos")
def list_equipments():
    company_id = _get_company_id_from_header()
    items = [e for e in EQUIPMENTS if e["companyId"] == company_id]
    return _api_response(items)


# -------------------------------------------------------------------
# Chamados: /api/v1/chamados
# -------------------------------------------------------------------
@tenant_bp.get("/chamados")
def list_tickets():
    company_id = _get_company_id_from_header()
    items = [t for t in TICKETS if t["companyId"] == company_id]
    return _api_response(items)


# -------------------------------------------------------------------
# Estados de equipamento: /api/v1/estados_equipamento
# -------------------------------------------------------------------
@tenant_bp.get("/estados_equipamento")
def list_statuses():
    company_id = _get_company_id_from_header()
    items = [
        s
        for s in STATUSES
        if s["companyId"] == company_id or s["companyId"] == "global"
    ]
    return _api_response(items)


# -------------------------------------------------------------------
# Filiais: /api/v1/filiais
# -------------------------------------------------------------------
@tenant_bp.get("/filiais")
def list_branches():
    company_id = _get_company_id_from_header()
    items = [b for b in BRANCHES if b["companyId"] == company_id]
    return _api_response(items)
