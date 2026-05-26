from __future__ import annotations

from supabase import Client

from app.db.supabase import DatabaseConfigError, get_supabase_client as get_database_client


def get_supabase_client() -> Client | None:
    """
    Supabase client factory.

    Authentication and per-tenant scoping will be introduced later. For now this
    simply proves wiring and keeps integration code isolated.
    """

    try:
        return get_database_client()
    except DatabaseConfigError:
        return None
