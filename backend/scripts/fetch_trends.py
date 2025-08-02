#!/usr/bin/env python3
"""
Script to fetch Google Trends data for popular categories and store in database.
"""

import os
import json
import asyncio
from datetime import datetime, timedelta
from pytrends.request import TrendReq
from sqlmodel import Session, create_engine
from dotenv import load_dotenv

# Import models
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools.trend_agent.models import TrendCategory

load_dotenv()

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/gipoly")
engine = create_engine(DATABASE_URL)

# Popular categories for Turkish market (using Turkish terms)
CATEGORIES = [
    "Elektronik",
    "Moda", 
    "Ev & Bahçe",
    "Spor & Outdoor",
    "Kozmetik",
    "Kitap & Eğitim",
    "Oyuncak & Hobi",
    "Gıda & İçecek",
    "Sağlık & Fitness",
    "Otomotiv"
]

def fetch_trend_data(category: str) -> dict:
    """Fetch Google Trends data for a category."""
    try:
        # Initialize pytrends with different settings
        pytrends = TrendReq(hl='tr-TR', tz=180)
        
        # Build payload for last 2 months
        timeframe = 'today 2-m'
        pytrends.build_payload([category], timeframe=timeframe, geo='TR')
        
        # Get interest over time
        interest_over_time = pytrends.interest_over_time()
        
        if interest_over_time.empty:
            return {}
        
        # Convert to simple date -> score format
        trend_data = {}
        for date, row in interest_over_time.iterrows():
            trend_data[date.strftime('%Y-%m-%d')] = int(row[category])
        
        return trend_data
        
    except Exception as e:
        return {}

def save_trend_data():
    """Save trend data to database."""
    with Session(engine) as session:
        for category in CATEGORIES:
            # Fetch trend data
            trend_data = fetch_trend_data(category)
            
            if not trend_data:
                continue
            
            # Check if category exists
            existing = session.query(TrendCategory).filter(
                TrendCategory.category_name == category
            ).first()
            
            if existing:
                # Update existing
                existing.trend_data = json.dumps(trend_data, ensure_ascii=False)
                existing.last_updated = datetime.utcnow()
            else:
                # Create new
                new_category = TrendCategory(
                    category_name=category,
                    trend_data=json.dumps(trend_data, ensure_ascii=False)
                )
                session.add(new_category)

            # Longer delay to avoid rate limiting
            import time
            time.sleep(30)
        
        session.commit()

if __name__ == "__main__":
    save_trend_data() 