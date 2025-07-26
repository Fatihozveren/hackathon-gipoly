#!/usr/bin/env python3
"""
Script to collect daily Google Trends data.
This script should be run daily via cron job.
"""

import asyncio
import sys
from database import get_session
from services.trends_service import TrendsService
from utils.logging_config import get_logger

logger = get_logger(__name__)


async def main():
    """Main function to collect trends data."""
    logger.info("Starting daily trends collection script")
    
    try:
        # Get database session
        session_gen = get_session()
        db = next(session_gen)
        
        # Initialize trends service
        trends_service = TrendsService()
        
        # Collect trends data for Turkey
        logger.info("Collecting trends data for Turkey")
        collection_results = await trends_service.collect_daily_trends(db, "TR")
        
        # Update category trends
        logger.info("Updating category trends")
        category_results = await trends_service.update_category_trends(db, "TR")
        
        # Log results
        logger.info(f"Collection completed. Results: {collection_results}")
        logger.info(f"Category updates completed. Results: {category_results}")
        
        # Close database session
        db.close()
        
        logger.info("Daily trends collection script completed successfully")
        
    except Exception as e:
        logger.error(f"Error in daily trends collection: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main()) 