from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.db.session import engine
from app.db.base import Base

from app.api.v1 import auth, rooms, users

from fastapi import WebSocket

from app.db.session import AsyncSessionLocal
from app.websocket.handler import handler


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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(rooms.router)


@app.get("/")
async def root():
    return {"message": "Backend is running 🚀"}


@app.websocket("/ws/{room_code}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_code: str,
):
    async with AsyncSessionLocal() as db:
        await handler.handle_connection(
            websocket=websocket,
            room_code=room_code,
            db=db,
        )

        