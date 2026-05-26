from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import router as api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.scheduler.scheduler import build_scheduler

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle hook.

    We keep infrastructure wiring here (scheduler, clients, etc.). Business logic
    remains in `services/`, `ai/`, `rules/`, and `executors/`.
    """

    configure_logging()
    scheduler = build_scheduler()
    scheduler.start()
    logger.info("scheduler_started=true")
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)
        logger.info("scheduler_stopped=true")


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.include_router(api_router)

