from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import UserRole


class UserBase(BaseModel):
    email: str
    company_name: str
    role: UserRole = UserRole.ADMIN


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    email: str | None = None
    company_name: str | None = None
    role: UserRole | None = None


class UserRead(UserBase):
    id: UUID
    created_at: datetime
