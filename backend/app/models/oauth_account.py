import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.user import User


class OAuthAccount(Base):
    """
    One row per (provider, provider_user_id) linked to a User.
    A single User can have multiple rows here — e.g. one for Google,
    one for GitHub — once GitHub is added.
    """
    __tablename__ = "oauth_accounts"
    __table_args__ = (
        UniqueConstraint("provider", "provider_user_id", name="uq_provider_account"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    provider: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )  # "google" | "github" (later)

    provider_user_id: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )  # Google's "sub" claim / GitHub's numeric user id

    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    access_token: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )  # store when you need to call the provider's API later (e.g. GitHub repos)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ──────
    user: Mapped["User"] = relationship(
        "User",
        back_populates="oauth_accounts",
    )