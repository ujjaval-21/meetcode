from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently authenticated user",
)
async def read_current_user(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Return the profile of the user identified by the provided JWT.

    Requires a valid `Authorization: Bearer <token>` header.
    """
    return current_user