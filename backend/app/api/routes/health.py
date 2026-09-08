from fastapi import APIRouter
from app.schemas import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Check if the backend service is running and operational.",
)
def check_health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="ImpactForge backend",
    )
