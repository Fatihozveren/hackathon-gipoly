import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Create engine
engine = create_engine(DATABASE_URL, echo=True)


def init_db():
    """Initialize database tables from SQLModel metadata"""
    # Import models to register them
    from models.user import User
    from models.workspace import Workspace, WorkspaceMember
    from tools.trend_agent.models import TrendSuggestion, TrendCategory
    from tools.seo_strategist.models import SEOAnalysis
    from tools.adcreative.models import AdCreativeAnalysis

    # Create all tables
    SQLModel.metadata.create_all(engine)


def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session 