from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str

    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int

    JUDGE0_URL: str
    EXECUTOR: str

    class Config:
        env_file = ".env"


settings = Settings()