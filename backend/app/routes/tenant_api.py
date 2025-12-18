import os
from datetime import datetime
from .general import _api_response, _get_company_id_from_header
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
import uuid

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
        "active": True,  # NOVO
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

        # padrão do seu mock hoje
        "serialNumber": "SN-ABC-123",

        "internalId": "NBK-001",
        "patrimonyId": "PAT-1001",
        "statusId": "st1",
        "description": "Notebook do financeiro",
        "acquisitionDate": "2024-01-10",

        # legado (pode manter por enquanto)
        "imageUrl": None,

        # ✅ ESSENCIAL pro seu caso
        "photos": [],

        "active": True,
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
        "photos": [],
        "active": True,
    },
]

# ✅ Normalização (Saneamento) — FORA da lista
for eq in EQUIPMENTS:
    if "photos" not in eq or not isinstance(eq["photos"], list):
        eq["photos"] = []


TICKETS = [
    {        
        "id": "tk1",
        "companyId": "c1",
        "equipmentId": "eq2",
        "title": "Computador travando",
        "description": "Máquina reiniciando sozinha várias vezes ao dia.",
        "kanbanStatus": "Aberto", # Deve corresponder a um nome em KANBAN_COLUMNS
        "priority": "Alta",
        "responsibleId": "u-tenant-1",
        "createdAt": "2025-01-15T10:00:00",
        "dueDate": "2025-01-20T18:00:00",
        "completedAt": None,
    },
    {
        "id": "tk2",
        "companyId": "c1",
        "equipmentId": "eq1",
        "title": "Configuração de Backup",
        "description": "Revisar rotina de backup do servidor principal.",
        "kanbanStatus": "Aberto", # Deve corresponder a um nome em KANBAN_COLUMNS
        "priority": "Baixa",
        "responsibleId": "u-tenant-2",
        "createdAt": "2023-11-01T10:00:00",
        "dueDate": "2023-11-03T10:00:00",
        "completedAt": None,
    },
]

# -------------------------------------------------------------------
# Kanban (colunas configuráveis) + Timeline de chamados
# -------------------------------------------------------------------

# Colunas de Kanban mockadas (uma empresa c1 para começar)
KANBAN_COLUMNS = [
    {
        "id": "kc1",
        "companyId": "c1",
        "name": "Aberto",
        "order": 1,
        "type": "default",
        "isSchedulingColumn": False,
        "scheduleEnabled": False,
        "slaHours": 24,
        "color": "#e5e7eb",
    },
    {
        "id": "kc2",
        "companyId": "c1",
        "name": "Em execução",
        "order": 2,
        "type": "default",
        "isSchedulingColumn": False,
        "scheduleEnabled": False,
        "slaHours": 48,
        "color": "#dbeafe",
    },
    {
        "id": "kc3",
        "companyId": "c1",
        "name": "Aguardando cliente",
        "order": 3,
        "type": "default",
        "isSchedulingColumn": True,
        "scheduleEnabled": True,
        "slaHours": 72,
        "color": "#fef3c7",
    },
    {
        "id": "kc4",
        "companyId": "c1",
        "name": "Concluído",
        "order": 4,
        "type": "done",
        "isSchedulingColumn": False,
        "scheduleEnabled": False,
        "slaHours": None,
        "color": "#dcfce7",
    },
]

# Eventos de timeline dos chamados
TICKET_EVENTS: list[dict] = []

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
# Usuários: /api/v1/usuarios
# -------------------------------------------------------------------

@tenant_bp.get("/usuarios")
def list_tenant_users():
    company_id = _get_company_id_from_header()
    items = [u for u in TENANT_USERS if company_id in u["companies"]]
    return _api_response(items)


@tenant_bp.post("/usuarios")
def create_tenant_user():
    payload = request.get_json(silent=True) or {}
    company_id = _get_company_id_from_header()

    new_user = {
        "id": f"u-{len(TENANT_USERS) + 1}",
        "name": payload.get("name"),
        "email": payload.get("email"),
        "role": payload.get("role") or "leitura",
        "avatarUrl": payload.get("avatarUrl"),
        "active": payload.get("active", True),
        "companies": [company_id],
    }

    TENANT_USERS.append(new_user)
    return _api_response(new_user, status_code=201)

# Procure a seção "Upload de avatar" e adicione o novo endpoint logo abaixo ou em uma seção similar:

# -------------------------------------------------------------------
# Upload de imagem genérica (para equipamentos, etc.)
# -------------------------------------------------------------------
@tenant_bp.post("/upload/image")
def upload_image():
    """
    Upload genérico de imagem (retorna { imageUrl }).
    Espera multipart/form-data com campo: file
    Header obrigatório: X-Company-Id
    """
    company_id = _get_company_id_from_header()
    if not company_id:
        return _api_response(None, errors={"message": "Missing X-Company-Id"}, status_code=400)

    file = request.files.get("file")
    if not file:
        return _api_response(None, errors={"message": "Missing file"}, status_code=400)

    filename = secure_filename(file.filename or "")
    if filename == "":
        return _api_response(None, errors={"message": "Invalid filename"}, status_code=400)

    # Pasta de destino (ajuste se você já tem um padrão)
    upload_dir = os.path.join("app", "static", "uploads", company_id)
    os.makedirs(upload_dir, exist_ok=True)

    ext = os.path.splitext(filename)[1].lower() or ".png"
    new_name = f"{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(upload_dir, new_name)
    file.save(save_path)

    # URL pública (Flask serve /static/*)
    image_url = f"/static/uploads/{company_id}/{new_name}"

    return _api_response({"imageUrl": image_url})

@tenant_bp.patch("/usuarios/<user_id>")
def update_tenant_user(user_id):
    payload = request.get_json(silent=True) or {}

    for u in TENANT_USERS:
        if u["id"] == user_id:
            # Atualiza apenas campos esperados
            for field in ["name", "email", "role", "active", "avatarUrl"]:
                if field in payload:
                    u[field] = payload[field]
            return _api_response(u)

    return _api_response(
        None,
        errors={"message": "User not found"},
        status_code=404,
    )

@tenant_bp.post("/usuarios/<user_id>/suspender")
def suspend_tenant_user(user_id):
    payload = request.get_json() or {}
    active = payload.get("active", True)

    for u in TENANT_USERS:
        if u["id"] == user_id:
            u["active"] = active
            return _api_response(u)

    return _api_response(None, errors={"message": "User not found"}, status_code=404)


@tenant_bp.delete("/usuarios/<user_id>")
def delete_tenant_user(user_id):
    global TENANT_USERS
    before = len(TENANT_USERS)
    TENANT_USERS = [u for u in TENANT_USERS if u["id"] != user_id]

    deleted = len(TENANT_USERS) < before
    return _api_response({"deleted": deleted})
    

# -------------------------------------------------------------------
# Equipamentos: /api/v1/equipamentos
# -------------------------------------------------------------------
@tenant_bp.get("/equipamentos")
def list_equipments():
    company_id = _get_company_id_from_header()
    items = [e for e in EQUIPMENTS if e["companyId"] == company_id]
    return _api_response(items)

# -------------------------------------------------------------------
# Criar novo equipamento: POST /api/v1/equipamentos
# -------------------------------------------------------------------
@tenant_bp.post("/equipamentos")
def create_equipment():
    company_id = _get_company_id_from_header()
    payload = request.get_json(silent=True) or {}

    new_id = f"eq{len(EQUIPMENTS)+1}"

    equipment = {
        "id": new_id,
        "companyId": company_id,
        "internalId": payload.get("internalId") or f"AUTO-{len(EQUIPMENTS)+1}",
        "type": payload.get("type") or "",
        "brand": payload.get("brand") or "",
        "model": payload.get("model") or "",
        "serial": payload.get("serial") or "",
        "branchId": payload.get("branchId") or "",
        "statusId": payload.get("statusId") or "",
        "description": payload.get("description") or "",
        "patrimonyId": payload.get("patrimonyId") or "",
        "acquisitionDate": payload.get("acquisitionDate") or "",
        "photos": payload.get("photos") or [],  # <<< aqui
    }

    EQUIPMENTS.append(equipment)
    return _api_response(equipment, status_code=201)

# -------------------------------------------------------------------
# Atualizar equipamento: PATCH /api/v1/equipamentos/<equipment_id>
# -------------------------------------------------------------------
@tenant_bp.patch("/equipamentos/<equipment_id>")
def update_equipment(equipment_id):
    company_id = _get_company_id_from_header()
    payload = request.get_json(silent=True) or {}

    # 1. Campos permitidos para atualização
    allowed_fields = {
        "type", "brand", "model",
        "serialNumber", "internalId", "branchId", "statusId",
        "description", "patrimonyId", "acquisitionDate",
        "photos", "active",
    }

    # 2. Busca o equipamento na lista global
    target_eq = None
    for eq in EQUIPMENTS:
        if eq.get("id") == equipment_id and eq.get("companyId") == company_id:
            target_eq = eq
            break

    # 3. Se não encontrar, retorna 404 imediatamente
    if not target_eq:
        return _api_response(
            None,
            errors={"message": "Equipamento não encontrado"},
            status_code=404,
        )

    # 4. Processa os dados do payload
    for key, value in payload.items():
        if key not in allowed_fields:
            continue

        # Normalização específica para o campo 'photos'
        if key == "photos":
            if value is None:
                target_eq["photos"] = []
            elif isinstance(value, list):
                # Mantém apenas strings válidas e remove espaços
                target_eq["photos"] = [v for v in value if isinstance(v, str) and v.strip()]
            else:
                return _api_response(
                    None,
                    errors={"message": "Campo 'photos' deve ser uma lista de URLs."},
                    status_code=400,
                )
        else:
            # Atualiza os demais campos diretamente
            target_eq[key] = value

    # 5. Garantia final de estrutura para o campo photos
    if "photos" not in target_eq or not isinstance(target_eq["photos"], list):
        target_eq["photos"] = []

    return _api_response(target_eq)

# -------------------------------------------------------------------
# Suspender ou reativar equipamento: POST /api/v1/equipamentos/<id>/suspender
# body: { "active": false } ou { "active": true }
# -------------------------------------------------------------------
@tenant_bp.post("/equipamentos/<equipment_id>/suspender")
def suspend_equipment(equipment_id):
    company_id = _get_company_id_from_header()
    payload = request.get_json(silent=True) or {}
    active = payload.get("active", False)

    for eq in EQUIPMENTS:
        if eq["id"] == equipment_id and eq["companyId"] == company_id:
            eq["active"] = active
            return _api_response(eq)

    return _api_response(
        None,
        errors={"message": "Equipamento não encontrado"},
        status_code=404,
    )

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

@tenant_bp.post("/equipamentos/<equipment_id>/duplicar")
def duplicate_equipment(equipment_id):
    for e in EQUIPMENTS:
        if e["id"] == equipment_id:
            new_item = e.copy()
            new_item["id"] = f"eq{len(EQUIPMENTS)+1}"
            new_item["internalId"] = f"DUP-{new_item['internalId']}"
            EQUIPMENTS.append(new_item)
            return _api_response(new_item)

    return _api_response(None, errors={"message": "Equipment not found"}, status_code=404)

# garante pasta de uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "..", "static", "equipment_photos")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@tenant_bp.post("/equipamentos/<equipment_id>/fotos")
def upload_equipment_photos(equipment_id):
    company_id = _get_company_id_from_header()
    if not company_id:
        return _api_response(None, errors={"message":"Missing X-Company-Id"}, status_code=400)

    files = request.files.getlist("files")
    if not files:
        # fallback: se vier "file" em vez de "files"
        f = request.files.get("file")
        files = [f] if f else []

    if not files:
        return _api_response(None, errors={"message":"No files provided"}, status_code=400)

    eq = next((e for e in EQUIPMENTS if e["id"] == equipment_id), None)
    if not eq:
        return _api_response(None, errors={"message":"Equipment not found"}, status_code=404)

    eq.setdefault("photos", [])

    uploaded_urls = []
    for file in files:
        if not file:
            continue
        url = _save_upload_and_get_public_url(file)  # sua função real
        eq["photos"].append(url)
        uploaded_urls.append(url)

    return _api_response({"photos": eq["photos"]})


# -------------------------------------------------------------------
# Excluir equipamento: DELETE /api/v1/equipamentos/<id>
# -------------------------------------------------------------------
@tenant_bp.delete("/equipamentos/<equipment_id>")
def delete_equipment(equipment_id):
    company_id = _get_company_id_from_header()

    for idx, eq in enumerate(EQUIPMENTS):
        if eq["id"] == equipment_id and eq["companyId"] == company_id:
            EQUIPMENTS.pop(idx)
            return _api_response({"deleted": True})

    return _api_response(
        None,
        errors={"message": "Equipamento não encontrado"},
        status_code=404,
    )

# -------------------------------------------------------------------
# Chamados: /api/v1/chamados Registra um evento de timeline para um chamado
# -------------------------------------------------------------------
def _append_ticket_event(
    company_id: str,
    ticket_id: str,
    event_type: str,
    from_status: str | None,
    to_status: str | None,
    note: str | None = None,
) -> dict:
    """Registra um evento de timeline para um chamado."""
    event = {
        "id": f"ev{len(TICKET_EVENTS) + 1}",
        "companyId": company_id,
        "ticketId": ticket_id,
        "type": event_type,  # ex: "created", "status_changed"
        "fromStatus": from_status,
        "toStatus": to_status,
        "note": note or "",
        "createdAt": datetime.utcnow().isoformat() + "Z",
    }
    TICKET_EVENTS.append(event)
    return event

# -------------------------------------------------------------------
# Chamados: /api/v1/chamados
# -------------------------------------------------------------------
@tenant_bp.get("/chamados")
def list_tenant_tickets():
    company_id = _get_company_id_from_header()

    tickets = [
        t for t in TICKETS
        if t.get("companyId") in (None, company_id)
    ]

    return _api_response(tickets)

# -------------------------------------------------------------------
# Criar novo chamado: /api/v1/chamados
# -------------------------------------------------------------------
@tenant_bp.post("/chamados")
def create_tenant_ticket():
    company_id = _get_company_id_from_header()
    payload = request.get_json() or {}

    new_id = f"tk{len(TICKETS) + 1}"
    now = datetime.utcnow().isoformat() + "Z"

    ticket = {
        "id": new_id,
        "companyId": company_id,
        "equipmentId": payload.get("equipmentId"),
        "title": payload.get("title") or "Chamado sem título",
        "description": payload.get("description") or "",
        "kanbanStatus": payload.get("kanbanStatus") or "Aberto",
        "priority": payload.get("priority") or "Normal",
        "responsibleId": payload.get("responsibleId"),
        "createdAt": now,
        "updatedAt": now,
    }

    TICKETS.append(ticket)

    # Evento inicial da timeline
    _append_ticket_event(
        company_id=company_id,
        ticket_id=new_id,
        event_type="created",
        from_status=None,
        to_status=ticket["kanbanStatus"],
        note=payload.get("note"),
    )

    return _api_response(ticket, status_code=201)

@tenant_bp.patch("/chamados/<ticket_id>/kanban")
def move_tenant_ticket(ticket_id: str):
    company_id = _get_company_id_from_header()
    payload = request.get_json() or {}
    new_status = payload.get("kanbanStatus")

    if not new_status:
        return _api_response(
            None,
            errors={"message": "Campo 'kanbanStatus' é obrigatório."},
            status_code=400,
        )

    ticket = next(
        (t for t in TICKETS if t["id"] == ticket_id and t.get("companyId") == company_id),
        None,
    )
    if not ticket:
        return _api_response(
            None,
            errors={"message": "Ticket não encontrado."},
            status_code=404,
        )

    old_status = ticket.get("kanbanStatus")
    ticket["kanbanStatus"] = new_status
    ticket["updatedAt"] = datetime.utcnow().isoformat() + "Z"

    _append_ticket_event(
        company_id=company_id,
        ticket_id=ticket_id,
        event_type="status_changed",
        from_status=old_status,
        to_status=new_status,
    )

    return _api_response(ticket)

# -------------------------------------------------------------------
# Atualizar chamado (campos básicos)
# -------------------------------------------------------------------
@tenant_bp.patch("/chamados/<ticket_id>")
def update_ticket(ticket_id):
    """
    Atualiza um chamado de manutenção (título, descrição, prioridade, dueDate,
    equipamento vinculado e opcionalmente status).

    Se o status mudar, registra um evento na timeline.
    """
    company_id = _get_company_id_from_header()
    if not company_id:
        return _api_response(
            None,
            errors={"message": "Missing X-Company-Id header"},
            status_code=400,
        )

    payload = request.get_json() or {}

    ticket = None
    for t in MAINTENANCE_TICKETS:
        if t["id"] == ticket_id and t["companyId"] == company_id:
            ticket = t
            break

    if not ticket:
        return _api_response(
            None,
            errors={"message": "Ticket not found"},
            status_code=404,
        )

    old_status = ticket.get("status")

    # Campos básicos
    for field in ["title", "description", "priority", "dueDate", "equipmentId"]:
        if field in payload:
            ticket[field] = payload[field]

    # Status opcional, com registro em timeline
    if "status" in payload and payload["status"] != old_status:
        ticket["status"] = payload["status"]

        event = {
            "id": f"ev{len(TICKET_EVENTS) + 1}",
            "ticketId": ticket_id,
            "companyId": company_id,
            "type": "status_change",
            "fromStatus": old_status,
            "toStatus": payload["status"],
            "note": payload.get("note", ""),
            "createdAt": datetime.utcnow().isoformat() + "Z",
        }
        TICKET_EVENTS.append(event)

    return _api_response(ticket)

@tenant_bp.get("/chamados/<ticket_id>/timeline")
def get_tenant_ticket_timeline(ticket_id: str):
    company_id = _get_company_id_from_header()

    events = [
        e for e in TICKET_EVENTS
        if e["ticketId"] == ticket_id and e["companyId"] == company_id
    ]
    # Ordena por data ascendente
    events.sort(key=lambda e: e["createdAt"])

    return _api_response(events)

# -------------------------------------------------------------------
# Kanban Columns (CRUD de colunas configuráveis)
# -------------------------------------------------------------------

@tenant_bp.get("/kanban/colunas")
def list_kanban_columns():
    company_id = _get_company_id_from_header()
    cols = [c for c in KANBAN_COLUMNS if c["companyId"] == company_id]
    cols.sort(key=lambda c: c.get("order") or 0)
    return _api_response(cols)


@tenant_bp.post("/kanban/colunas")
def create_kanban_column():
    company_id = _get_company_id_from_header()
    payload = request.get_json() or {}

    new_id = f"kc{len(KANBAN_COLUMNS) + 1}"
    max_order = max(
        [c.get("order") or 0 for c in KANBAN_COLUMNS if c["companyId"] == company_id]
        or [0]
    )

    col = {
        "id": new_id,
        "companyId": company_id,
        "name": payload.get("name") or "Nova coluna",
        "order": max_order + 1,
        "type": payload.get("type") or "default",
        "isSchedulingColumn": bool(payload.get("isSchedulingColumn")),
        "scheduleEnabled": bool(payload.get("scheduleEnabled")),
        "slaHours": payload.get("slaHours"),
        "color": payload.get("color") or "#e5e7eb",
    }

    KANBAN_COLUMNS.append(col)
    return _api_response(col, status_code=201)


@tenant_bp.patch("/kanban/colunas/<col_id>")
def update_kanban_column(col_id: str):
    company_id = _get_company_id_from_header()
    payload = request.get_json() or {}

    col = next(
        (c for c in KANBAN_COLUMNS if c["id"] == col_id and c["companyId"] == company_id),
        None,
    )
    if not col:
        return _api_response(
            None,
            errors={"message": "Coluna não encontrada."},
            status_code=404,
        )

    for key in ["name", "order", "type", "isSchedulingColumn", "scheduleEnabled", "slaHours", "color"]:
        if key in payload:
            col[key] = payload[key]

    return _api_response(col)


@tenant_bp.delete("/kanban/colunas/<col_id>")
def delete_kanban_column(col_id: str):
    company_id = _get_company_id_from_header()

    idx = next(
        (i for i, c in enumerate(KANBAN_COLUMNS) if c["id"] == col_id and c["companyId"] == company_id),
        None,
    )
    if idx is None:
        return _api_response(
            None,
            errors={"message": "Coluna não encontrada."},
            status_code=404,
        )

    col = KANBAN_COLUMNS.pop(idx)
    return _api_response(col)


@tenant_bp.patch("/kanban/colunas/reorder")
def reorder_kanban_columns():
    company_id = _get_company_id_from_header()
    payload = request.get_json() or {}
    ordered_ids = payload.get("orderedIds") or []

    if not isinstance(ordered_ids, list):
        return _api_response(
            None,
            errors={"message": "Campo 'orderedIds' deve ser uma lista."},
            status_code=400,
        )

    order_map = {col_id: idx + 1 for idx, col_id in enumerate(ordered_ids)}

    for col in KANBAN_COLUMNS:
        if col["companyId"] == company_id and col["id"] in order_map:
            col["order"] = order_map[col["id"]]

    cols = [c for c in KANBAN_COLUMNS if c["companyId"] == company_id]
    cols.sort(key=lambda c: c.get("order") or 0)
    return _api_response(cols)

# -------------------------------------------------------------------
# Filiais: /api/v1/filiais
# -------------------------------------------------------------------
@tenant_bp.get("/filiais")
def list_branches():
    company_id = _get_company_id_from_header()
    items = [b for b in BRANCHES if b["companyId"] == company_id]
    return _api_response(items)


# -------------------------------------------------------------------
# Upload de avatar (arquivo do dispositivo)
# -------------------------------------------------------------------
@tenant_bp.post("/upload/avatar")
def upload_avatar():
    """
    Recebe um arquivo de imagem e salva em static/avatars.
    Retorna uma URL pública para ser usada em avatarUrl.
    """
    if "file" not in request.files:
        return _api_response(
            None,
            errors={"message": "Nenhum arquivo enviado (campo 'file')"},
            status_code=400,
        )

    file = request.files["file"]
    if file.filename == "":
        return _api_response(
            None,
            errors={"message": "Arquivo sem nome"},
            status_code=400,
        )

    filename = secure_filename(file.filename)
    upload_folder = current_app.config.get("AVATAR_UPLOAD_FOLDER")
    if not upload_folder:
        return _api_response(
            None,
            errors={"message": "Configuração de upload não encontrada"},
            status_code=500,
        )

    save_path = os.path.join(upload_folder, filename)
    file.save(save_path)

    # URL pública do avatar (servida via /static/avatars/<filename>)
    public_url = f"/static/avatars/{filename}"

    return _api_response({"url": public_url}, status_code=201)
