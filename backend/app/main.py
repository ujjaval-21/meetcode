from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.session import engine
from app.db.base import Base

from app.api.v1 import auth, rooms, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup (dev convenience — use Alembic in production).
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="MeetCode Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(rooms.router)


@app.get("/")
async def root():
    return {"message": "Backend is running 🚀"}