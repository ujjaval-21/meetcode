import asyncio
from fastapi import HTTPException
import httpx
from app.executors.base import BaseExecutor

from app.config import settings
from app.schemas.execution import (
    ExecutionRequest,
    ExecutionResponse,
)


class Judge0Executor(BaseExecutor):

    async def execute(
        self,
        request: ExecutionRequest,
    ) -> ExecutionResponse:

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:

                submission = await client.post(
                    f"{settings.JUDGE0_URL}/submissions?base64_encoded=false&wait=false",
                    json={
                        "source_code": request.source_code,
                        "language_id": request.language_id,
                        "stdin": request.stdin,
                    },
                )

                submission.raise_for_status()

                token = submission.json()["token"]

                while True:

                    result = await client.get(
                        f"{settings.JUDGE0_URL}/submissions/{token}?base64_encoded=false",
                    )

                    result.raise_for_status()

                    data = result.json()

                    status_id = data["status"]["id"]

                    # 1 = In Queue
                    # 2 = Processing
                    if status_id not in (1, 2):
                        break

                    await asyncio.sleep(0.5)

                return ExecutionResponse(
                    stdout=data.get("stdout"),
                    stderr=data.get("stderr"),
                    compile_output=data.get("compile_output"),
                    message=data.get("message"),
                    status=data["status"]["description"],
                    time=data.get("time"),
                    memory=data.get("memory"),
                )
            
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Judge0 service unavailable: {exc}",
            )


