from typing import Any, TypedDict

import httpx
from fastapi import HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from starlette.concurrency import run_in_threadpool

from app.config import settings


class OAuthProfile(TypedDict):
    """Normalized shape every provider module returns, regardless of provider."""
    provider: str
    provider_user_id: str
    email: str
    name: str | None
    avatar_url: str | None


async def _exchange_code(code: str) -> dict[str, Any]:
    """
    Exchanges a one-time authorization code (from @react-oauth/google's
    auth-code flow) for Google tokens, server-to-server.

    redirect_uri must be the literal string "postmessage" — that's what
    @react-oauth/google's popup flow expects Google to see on this end.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": "postmessage",
                "grant_type": "authorization_code",
            },
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to exchange Google authorization code.",
        )

    return response.json()


def _verify_id_token_sync(token: str) -> dict[str, Any]:
    """Blocking call — verifies signature, expiry, and audience against Google's public keys."""
    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        print("GOOGLE TOKEN VERIFY FAILED:", str(e))  # TEMP DEBUG — remove after diagnosis
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token.",
        )
    if idinfo.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer.",
        )

    return idinfo


async def get_profile_from_code(code: str) -> OAuthProfile:
    """
    Full Google flow: exchange the auth code, verify the returned ID token,
    and return a normalized profile that auth_service can consume without
    knowing anything Google-specific.
    """
    token_data = await _exchange_code(code)
    id_token_str = token_data.get("id_token")

    if not id_token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google did not return an ID token.",
        )

    idinfo = await run_in_threadpool(_verify_id_token_sync, id_token_str)

    return OAuthProfile(
        provider="google",
        provider_user_id=idinfo["sub"],
        email=idinfo["email"],
        name=idinfo.get("name"),
        avatar_url=idinfo.get("picture"),
    )