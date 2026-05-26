from __future__ import annotations

from app.services.database import database_service


def example_insert_user() -> dict:
    """Example only: demonstrates typed insert through the service layer."""

    from app.schemas.users import UserCreate

    return database_service.create_user(
        UserCreate(
            email="founder@example.com",
            company_name="Example SaaS Co",
            role="admin",
        )
    )


def example_query_user_integrations(user_id: str) -> list[dict]:
    """Example only: demonstrates filtered query through reusable helpers."""

    return database_service.list_user_integrations(user_id)
