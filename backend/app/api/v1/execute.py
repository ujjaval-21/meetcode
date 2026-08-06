from fastapi import APIRouter

from app.schemas.execution import (
    ExecutionRequest,
    ExecutionResponse,
)
from app.services.execution_service import execution_service

router = APIRouter(
    prefix="/execute",
    tags=["Execution"],
)


@router.post(
    "",
    response_model=ExecutionResponse,
)
async def execute_code(
    request: ExecutionRequest,
) -> ExecutionResponse:
    return await execution_service.execute(request)
