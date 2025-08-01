import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine
engine = create_engine(DATABASE_URL, echo=True)


def init_db():
    """Initialize database tables from SQLModel metadata"""
    SQLModel.metadata.clear()
    
    # Import models to register them
    from models.user import User
    from models.workspace import Workspace, WorkspaceMember
    from tools.trend_agent.models import TrendSuggestion
    from tools.seo_strategist.models import SEOAnalysis
    from tools.adcreative.models import AdCreativeAnalysis

    
    SQLModel.metadata.create_all(engine)


def get_session():
    """Get database session"""
    with Session(engine) as session:
        yield session 