# backend/app/general.py
from typing import Any, Dict, Optional
from flask import jsonify, request


def _api_response(
	data: Any = None,
	meta: Optional[Dict[str, Any]] = None,
	errors: Optional[Dict[str, Any]] = None,
	status_code: int = 200,
):
	"""
	Resposta padrão da API no formato:
	{
		"data": ...,
		"meta": {...},
		"errors": {...}
	}
	"""
	payload: Dict[str, Any] = {
			"data": data,
			"meta": meta or {},
			"errors": errors,
	}
	return jsonify(payload), status_code


def _get_company_id_from_header() -> Optional[str]:
	"""
	Lê o cabeçalho X-Company-Id e retorna o valor (ou None se não existir).

	A validação (retornar 400 se estiver ausente) fica a cargo
	da rota que estiver usando.
	"""
	return request.headers.get("X-Company-Id")
