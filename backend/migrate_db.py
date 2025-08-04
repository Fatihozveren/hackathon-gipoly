#!/usr/bin/env python3
"""
Database migration script for adding TrendSuggestion table.
"""

import os
import sys
from sqlmodel import SQLModel, create_engine
from dotenv import load_dotenv

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable is required")
    sys.exit(1)

# Create engine
engine = create_engine(DATABASE_URL, echo=True)


def migrate_database():
    """Add TrendSuggestion table to the database."""
    try:
        print("Starting database migration...")
        
        # Import all models to register them
        from models.user import User
        from models.workspace import Workspace, WorkspaceMember
        from tools.trend_agent.models import TrendSuggestion, TrendCategory
        from tools.seo_strategist.models import SEOAnalysis
        from tools.adcreative.models import AdCreativeAnalysis
        
        print("Models imported successfully")
        
        # Create all tables
        SQLModel.metadata.create_all(engine)
        
        print("✅ Database migration completed successfully!")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    migrate_database() 