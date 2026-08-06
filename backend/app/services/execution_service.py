from app.executors.base import BaseExecutor
from app.executors.judge0_executor import Judge0Executor
from app.executors.docker_executor import DockerExecutor
from app.config import settings
from app.schemas.execution import (
    ExecutionRequest,
    ExecutionResponse,
)


class ExecutionService:
    def __init__(self):
        self.executor: BaseExecutor

        if settings.EXECUTOR.lower() == "judge0":
            self.executor = Judge0Executor()

        elif settings.EXECUTOR.lower() == "docker":
            self.executor = DockerExecutor()

        else:
            raise ValueError(
                f"Unknown executor: {settings.EXECUTOR}"
            )

    async def execute(
        self,
        request: ExecutionRequest,
    ) -> ExecutionResponse:
        return await self.executor.execute(request)

execution_service = ExecutionService()