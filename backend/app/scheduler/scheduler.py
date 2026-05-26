from __future__ import annotations

import logging

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.config import settings

logger = logging.getLogger(__name__)


def build_scheduler() -> BackgroundScheduler:
    """
    APScheduler entrypoint.

    Jobs are registered here as *placeholders* only; real jobs will live under
    `services/`, `ai/`, and `executors/` and will be called by the scheduler.
    """

    scheduler = BackgroundScheduler(timezone=settings.scheduler_timezone)

    # Placeholder "heartbeat" job to prove wiring. Safe to remove later.
    scheduler.add_job(
        func=_heartbeat,
        trigger=IntervalTrigger(seconds=60),
        id="heartbeat",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )

    return scheduler


def _heartbeat() -> None:
    logger.debug("scheduler_heartbeat=ok")

