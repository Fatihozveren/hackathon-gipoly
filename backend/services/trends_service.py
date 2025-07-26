"""
Service for managing Google Trends data collection and storage.
"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlmodel import Session, select
from ..models.trends import TrendsData, CategoryTrends, EcommerceTrends
from ..tools.trend_agent.trends_analyzer import TrendsAnalyzer
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


class TrendsService:
    """Service for managing Google Trends data."""
    
    def __init__(self):
        self.trends_analyzer = TrendsAnalyzer()
        
        # E-commerce related keywords for different categories
        self.ecommerce_keywords = {
            "Electronics": [
                "elektronik", "teknoloji", "akıllı telefon", "laptop", "tablet", 
                "kulaklık", "hoparlör", "monitör", "klavye", "mouse"
            ],
            "Fashion": [
                "moda", "giyim", "ayakkabı", "çanta", "aksesuar", "takı", 
                "saat", "gözlük", "şapka", "eldiven"
            ],
            "Home & Garden": [
                "ev", "bahçe", "dekorasyon", "mobilya", "bitki", "çiçek",
                "mutfak", "banyo", "yatak odası", "salon"
            ],
            "Beauty": [
                "kozmetik", "makyaj", "cilt bakımı", "parfüm", "saç bakımı",
                "tırnak", "güneş kremi", "nemlendirici", "şampuan", "saç boyası"
            ],
            "Sports": [
                "spor", "fitness", "egzersiz", "yoga", "koşu", "bisiklet",
                "futbol", "basketbol", "tenis", "yüzme"
            ],
            "Books": [
                "kitap", "okuma", "e-kitap", "roman", "eğitim", "çocuk kitabı",
                "bilim kurgu", "tarih", "felsefe", "psikoloji"
            ],
            "Toys": [
                "oyuncak", "çocuk", "eğitici oyuncak", "puzzle", "lego",
                "bebek", "arabalar", "oyun", "eğlence", "hobi"
            ],
            "Food": [
                "yemek", "gıda", "organik", "sağlıklı beslenme", "vegan",
                "gluten free", "protein", "vitamin", "takviye", "smoothie"
            ]
        }
    
    async def collect_daily_trends(self, db: Session, country: str = "TR") -> Dict[str, int]:
        """
        Collect daily trends data for all e-commerce categories.
        
        Returns:
            Dict with category names and number of keywords processed
        """
        logger.info(f"Starting daily trends collection for country: {country}")
        
        results = {}
        
        for category, keywords in self.ecommerce_keywords.items():
            logger.info(f"Processing category: {category}")
            processed_count = 0
            
            for keyword in keywords:
                try:
                    # Check if we already have recent data (within 24 hours)
                    existing_data = db.exec(
                        select(TrendsData)
                        .where(TrendsData.keyword == keyword)
                        .where(TrendsData.country == country)
                        .where(TrendsData.updated_at >= datetime.utcnow() - timedelta(hours=24))
                    ).first()
                    
                    if existing_data:
                        logger.info(f"Skipping {keyword} - recent data exists")
                        continue
                    
                    # Get trends data
                    trends_data = self.trends_analyzer.get_trends_data(keyword, country)
                    
                    # Save to database
                    db_trends = TrendsData(
                        keyword=keyword,
                        country=country,
                        trend_score=trends_data.trend_score,
                        interest_over_time=trends_data.interest_over_time,
                        related_queries=trends_data.related_queries,
                        related_topics=trends_data.related_topics,
                        chart_data=trends_data.chart_data
                    )
                    
                    db.add(db_trends)
                    processed_count += 1
                    
                    # Small delay to avoid rate limiting
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error processing keyword {keyword}: {e}")
                    continue
            
            # Commit changes for this category
            try:
                db.commit()
                results[category] = processed_count
                logger.info(f"Processed {processed_count} keywords for {category}")
            except Exception as e:
                logger.error(f"Error committing data for {category}: {e}")
                db.rollback()
        
        logger.info(f"Daily trends collection completed. Results: {results}")
        return results
    
    async def update_category_trends(self, db: Session, country: str = "TR") -> Dict[str, float]:
        """
        Update category-level trends analysis.
        
        Returns:
            Dict with category names and average trend scores
        """
        logger.info(f"Updating category trends for country: {country}")
        
        results = {}
        
        for category, keywords in self.ecommerce_keywords.items():
            try:
                # Get all trends data for this category
                trends_data_list = db.exec(
                    select(TrendsData)
                    .where(TrendsData.keyword.in_(keywords))
                    .where(TrendsData.country == country)
                    .where(TrendsData.updated_at >= datetime.utcnow() - timedelta(hours=24))
                ).all()
                
                if not trends_data_list:
                    logger.warning(f"No trends data found for category: {category}")
                    continue
                
                # Calculate average trend score
                total_score = sum(td.trend_score for td in trends_data_list)
                avg_score = total_score / len(trends_data_list)
                
                # Get top keywords by trend score
                top_keywords = sorted(
                    trends_data_list, 
                    key=lambda x: x.trend_score, 
                    reverse=True
                )[:5]
                
                top_keywords_data = [
                    {
                        "keyword": tk.keyword,
                        "trend_score": tk.trend_score,
                        "updated_at": tk.updated_at.isoformat()
                    }
                    for tk in top_keywords
                ]
                
                # Save or update category trends
                existing_category = db.exec(
                    select(CategoryTrends)
                    .where(CategoryTrends.category == category)
                    .where(CategoryTrends.country == country)
                ).first()
                
                if existing_category:
                    existing_category.average_trend_score = avg_score
                    existing_category.top_keywords = top_keywords_data
                    existing_category.updated_at = datetime.utcnow()
                else:
                    category_trends = CategoryTrends(
                        category=category,
                        country=country,
                        average_trend_score=avg_score,
                        top_keywords=top_keywords_data,
                        trends_data={}
                    )
                    db.add(category_trends)
                
                results[category] = avg_score
                
            except Exception as e:
                logger.error(f"Error updating category trends for {category}: {e}")
                continue
        
        try:
            db.commit()
            logger.info(f"Category trends updated successfully. Results: {results}")
        except Exception as e:
            logger.error(f"Error committing category trends: {e}")
            db.rollback()
        
        return results
    
    async def update_wordcloud_analysis(self, db: Session, country: str = "TR") -> Dict[str, Dict]:
        """
        Update word cloud analysis for all categories.
        
        Returns:
            Dict with category names and analysis results
        """
        logger.info(f"Updating word cloud analysis for country: {country}")
        
        from services.text_analysis_service import TextAnalysisService
        text_analysis = TextAnalysisService()
        
        results = {}
        
        for category in self.ecommerce_keywords.keys():
            try:
                logger.info(f"Processing word cloud analysis for category: {category}")
                result = await text_analysis.update_wordcloud_data(db, category, country)
                results[category] = result
                
            except Exception as e:
                logger.error(f"Error updating word cloud analysis for {category}: {e}")
                results[category] = {'error': str(e)}
                continue
        
        logger.info(f"Word cloud analysis completed. Results: {results}")
        return results
    
    def get_trends_data(self, db: Session, keyword: str, country: str = "TR") -> Optional[TrendsData]:
        """Get trends data from database."""
        return db.exec(
            select(TrendsData)
            .where(TrendsData.keyword == keyword)
            .where(TrendsData.country == country)
            .order_by(TrendsData.updated_at.desc())
        ).first()
    
    def get_category_trends(self, db: Session, category: str, country: str = "TR") -> Optional[CategoryTrends]:
        """Get category trends from database."""
        return db.exec(
            select(CategoryTrends)
            .where(CategoryTrends.category == category)
            .where(CategoryTrends.country == country)
        ).first()
    
    def get_all_category_trends(self, db: Session, country: str = "TR") -> List[CategoryTrends]:
        """Get all category trends from database."""
        return db.exec(
            select(CategoryTrends)
            .where(CategoryTrends.country == country)
            .order_by(CategoryTrends.average_trend_score.desc())
        ).all()
    
    def get_top_trending_keywords(self, db: Session, country: str = "TR", limit: int = 10) -> List[TrendsData]:
        """Get top trending keywords from database."""
        return db.exec(
            select(TrendsData)
            .where(TrendsData.country == country)
            .where(TrendsData.updated_at >= datetime.utcnow() - timedelta(hours=24))
            .order_by(TrendsData.trend_score.desc())
            .limit(limit)
        ).all() 