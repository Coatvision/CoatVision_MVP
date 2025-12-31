import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from sqlalchemy.orm.session import Session as SA_Session
from sqlmodel import Session as SQLModelSession

try:
    # from app.services.config import DATABASE_URL, BASE_DIR  # foretrukket sti
    # NOTE: Disabled due to unresolved import error (reportMissingImports)
    raise ImportError("app.services.config could not be resolved")
except Exception:
    # Fallback: beregn konfig lokalt uten å være avhengig av pakkelasting
    from pathlib import Path as _Path
    import os as _os
    try:
        from dotenv import load_dotenv as _load_dotenv
    except Exception:
        _load_dotenv = None

    _BACKEND_DIR = _Path(__file__).resolve().parents[1]
    _BASE_DIR = _Path(__file__).resolve().parents[2]
    _env_path = _BACKEND_DIR / ".env"
    if _load_dotenv and _env_path.exists():
        _load_dotenv(_env_path)
    _default_db_path = (_BACKEND_DIR / "coatvision.db").resolve()
    _default_db_url = f"sqlite:///{_default_db_path.as_posix()}"
    _raw = _os.getenv("DATABASE_URL", _default_db_url) or ""
    DATABASE_URL = _raw.strip().strip('"').strip("'") or _default_db_url
    BASE_DIR = _BASE_DIR

# Sett opp SQLAlchemy-engine og session
print(f"[db] DATABASE_URL={DATABASE_URL!r}")
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

if DATABASE_URL.startswith("sqlite:///"):
    db_path = DATABASE_URL.replace("sqlite:///", "", 1)
    # Resolve relative path (e.g., ./data/dev.db) from repo root
    if db_path.startswith("./"):
        abs_db_path = os.path.join(str(BASE_DIR), db_path[2:])
    else:
        abs_db_path = db_path
    os.makedirs(os.path.dirname(abs_db_path), exist_ok=True)
    posix_db_path = Path(abs_db_path).resolve().as_posix()
    engine = create_engine(f"sqlite:///{posix_db_path}", connect_args=connect_args)
else:
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db: SA_Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_session() -> SQLModelSession:
    """
    Convenience helper for routers/services expecting a direct Session.
    Use with care; prefer dependency-injected `get_db()` when possible.
    """
    return SQLModelSession(engine)
