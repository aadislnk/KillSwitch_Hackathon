from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import Any

from postgrest.exceptions import APIError
from pydantic import BaseModel

from app.db.supabase import DatabaseQueryError, get_supabase_client

logger = logging.getLogger(__name__)


Payload = Mapping[str, Any] | BaseModel


def _as_payload(payload: Payload) -> dict[str, Any]:
    if isinstance(payload, BaseModel):
        return payload.model_dump(mode="json", exclude_none=True)
    return dict(payload)


def create_record(table: str, payload: Payload) -> dict[str, Any]:
    """Insert a single row and return it."""

    try:
        response = get_supabase_client().table(table).insert(_as_payload(payload)).execute()
    except APIError as exc:
        logger.exception("db_create_failed table=%s", table)
        raise DatabaseQueryError(f"Failed to create record in {table}") from exc
    except Exception as exc:
        logger.exception("db_create_unexpected_failed table=%s", table)
        raise DatabaseQueryError(f"Unexpected create failure in {table}") from exc

    rows = response.data or []
    if not rows:
        raise DatabaseQueryError(f"Create in {table} returned no data")
    return rows[0]


def get_record_by_id(table: str, record_id: str) -> dict[str, Any] | None:
    """Fetch one row by id."""

    try:
        response = get_supabase_client().table(table).select("*").eq("id", record_id).limit(1).execute()
    except APIError as exc:
        logger.exception("db_get_failed table=%s id=%s", table, record_id)
        raise DatabaseQueryError(f"Failed to fetch record from {table}") from exc
    except Exception as exc:
        logger.exception("db_get_unexpected_failed table=%s id=%s", table, record_id)
        raise DatabaseQueryError(f"Unexpected fetch failure from {table}") from exc

    rows = response.data or []
    return rows[0] if rows else None


def list_records(
    table: str,
    *,
    filters: Mapping[str, Any] | None = None,
    limit: int = 100,
    order_by: str | None = None,
    desc: bool = True,
) -> list[dict[str, Any]]:
    """List rows with equality filters and optional ordering."""

    try:
        query = get_supabase_client().table(table).select("*")
        for key, value in (filters or {}).items():
            query = query.eq(key, value)
        if order_by:
            query = query.order(order_by, desc=desc)
        response = query.limit(limit).execute()
    except APIError as exc:
        logger.exception("db_list_failed table=%s", table)
        raise DatabaseQueryError(f"Failed to list records from {table}") from exc
    except Exception as exc:
        logger.exception("db_list_unexpected_failed table=%s", table)
        raise DatabaseQueryError(f"Unexpected list failure from {table}") from exc

    return response.data or []


def update_record(table: str, record_id: str, payload: Payload) -> dict[str, Any] | None:
    """Update one row by id and return the updated row."""

    try:
        response = (
            get_supabase_client()
            .table(table)
            .update(_as_payload(payload))
            .eq("id", record_id)
            .execute()
        )
    except APIError as exc:
        logger.exception("db_update_failed table=%s id=%s", table, record_id)
        raise DatabaseQueryError(f"Failed to update record in {table}") from exc
    except Exception as exc:
        logger.exception("db_update_unexpected_failed table=%s id=%s", table, record_id)
        raise DatabaseQueryError(f"Unexpected update failure in {table}") from exc

    rows = response.data or []
    return rows[0] if rows else None


def delete_record(table: str, record_id: str) -> bool:
    """Delete one row by id."""

    try:
        response = get_supabase_client().table(table).delete().eq("id", record_id).execute()
    except APIError as exc:
        logger.exception("db_delete_failed table=%s id=%s", table, record_id)
        raise DatabaseQueryError(f"Failed to delete record from {table}") from exc
    except Exception as exc:
        logger.exception("db_delete_unexpected_failed table=%s id=%s", table, record_id)
        raise DatabaseQueryError(f"Unexpected delete failure from {table}") from exc

    return bool(response.data)
