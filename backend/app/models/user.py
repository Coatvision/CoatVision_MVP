from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.sqlite import BLOB
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

from backend.app.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    salt = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
