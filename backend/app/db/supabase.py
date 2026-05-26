from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any

from supabase import Client, create_client

from app.core.config import Settings, settings

logger = logging.getLogger(__name__)


class DatabaseConfigError(RuntimeError):
    """Raised when the Supabase client cannot be configured."""


class DatabaseQueryError(RuntimeError):
    """Raised when a Supabase query fails."""


@lru_cache
def get_supabase_client() -> Client:
    """
    Build a reusable Supabase client.

    The service role key is preferred for backend-only operations. The anon key
    remains supported for local read-only experiments before production secrets
    are available.
    """

    if not settings.supabase_url:
        raise DatabaseConfigError("SUPABASE_URL is not configured")

    key = settings.supabase_service_role_key or settings.supabase_anon_key
    if not key:
        raise DatabaseConfigError("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required")

    return create_client(settings.supabase_url, key)


def get_supabase_status(config: Settings = settings) -> dict[str, Any]:
    """Return safe connection configuration details for health checks."""

    return {
        "configured": config.has_supabase_config,
        "url_present": bool(config.supabase_url),
        "service_role_key_present": bool(config.supabase_service_role_key),
        "anon_key_present": bool(config.supabase_anon_key),
    }


def test_supabase_connection() -> dict[str, Any]:
    """
    Run a lightweight query against the users table.

    This assumes the SQL schema has already been applied in Supabase.
    """

    try:
        response = get_supabase_client().table("users").select("id").limit(1).execute()
    except DatabaseConfigError:
        raise
    except Exception as exc:
        logger.exception("supabase_connection_test_failed=true")
        raise DatabaseQueryError("Supabase connection test failed") from exc

    return {
        "connected": True,
        "table": "users",
        "sample_count": len(response.data or []),
    }
