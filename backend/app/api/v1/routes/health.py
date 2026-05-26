from fastapi import APIRouter, HTTPException, status

from app.db.supabase import DatabaseConfigError, DatabaseQueryError, get_supabase_status
from app.db.supabase import test_supabase_connection

router = APIRouter()


@router.get("/health")
def health():
    # Keep it simple: used by the frontend axios scaffold and readiness checks.
    return {"status": "ok"}


@router.get("/health/db")
def database_health():
    """Check whether Supabase is configured and reachable."""

    status_payload = get_supabase_status()
    if not status_payload["configured"]:
        return {"status": "not_configured", "database": status_payload}

    try:
        connection = test_supabase_connection()
    except DatabaseConfigError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except DatabaseQueryError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    return {"status": "ok", "database": {**status_payload, **connection}}
