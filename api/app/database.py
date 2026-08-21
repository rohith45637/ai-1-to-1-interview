from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Create engine (handling SQLite vs PostgreSQL parameters)
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    Base.metadata.create_all(bind=engine)
    if settings.DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            for col_sql in [
                "ALTER TABLE interviews ADD COLUMN presentation_metrics JSON",
                "ALTER TABLE interviews ADD COLUMN duration_minutes INTEGER DEFAULT 15"
            ]:
                try:
                    conn.execute(text(col_sql))
                    conn.commit()
                except Exception:
                    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
