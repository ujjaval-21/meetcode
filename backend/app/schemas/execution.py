from pydantic import BaseModel, Field
from typing import Optional


class ExecutionRequest(BaseModel):
    source_code: str = Field(..., min_length=1)
    language_id: int
    stdin: Optional[str] = None

  
class ExecutionResponse(BaseModel):
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    compile_output: Optional[str] = None
    message: Optional[str] = None
    status: str
    time: Optional[str] = None
    memory: Optional[int] = None