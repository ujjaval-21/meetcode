from abc import ABC, abstractmethod

from app.schemas.execution import (
    ExecutionRequest,
    ExecutionResponse,
)


class BaseExecutor(ABC):
    @abstractmethod
    async def execute(
        self,
        request: ExecutionRequest,
    ) -> ExecutionResponse:
        pass
    