from app.executors.base import BaseExecutor
from app.schemas.execution import (
    ExecutionRequest,
    ExecutionResponse,
)


class DockerExecutor(BaseExecutor):

    async def execute(
        self,
        request: ExecutionRequest,
    ) -> ExecutionResponse:
        raise NotImplementedError("Docker executor not implemented yet")