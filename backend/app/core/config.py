"""
Configuration Module for Mini Slack Backend.

WHAT THIS MODULE DOES:
Reads environment variables (such as database credentials and allowed CORS origins)
and exposes them as a centralized, type-safe Settings object.

WHY IT'S STRUCTURED THIS WAY:
Using Pydantic's BaseSettings ensures that configuration parameters are validated
at startup time, preventing runtime errors caused by missing environment variables.
"""

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """
    Application Settings Definition.
    
    Attributes:
        PROJECT_NAME: Name of the application displayed in OpenAPI documentation.
        DATABASE_URL: Connection URL for Neon Postgres instance.
        ALLOWED_ORIGINS: Comma-separated list or wildcard for CORS policy.
    """
    PROJECT_NAME: str = "Mini Slack API"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://neondb_owner:npg_kXM4nOZI9mKp@ep-misty-bread-axw5g972-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
    )
    ALLOWED_ORIGINS: str = "*"

    class Config:
        case_sensitive = True


# Global settings instance shared across the application
settings = Settings()
