from fastapi import APIRouter

from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.integrations import router as integrations_router
from app.api.v1.routes.findings import router as findings_router
from app.api.v1.routes.rules import router as rules_router
from app.api.v1.routes.actions import router as actions_router
from app.api.v1.routes.approvals import router as approvals_router

router = APIRouter()

router.include_router(health_router, tags=["health"])
router.include_router(integrations_router, prefix="/integrations", tags=["integrations"])
router.include_router(findings_router, prefix="/findings", tags=["findings"])
router.include_router(rules_router, prefix="/rules", tags=["rules"])
router.include_router(actions_router, prefix="/actions", tags=["actions"])
router.include_router(approvals_router, prefix="/approvals", tags=["approvals"])
