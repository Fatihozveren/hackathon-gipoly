from datetime import datetime
from typing import Dict, List, Optional
from sqlmodel import SQLModel, Field, Column, JSON
from sqlalchemy import DateTime


class TrendsData(SQLModel, table=True):
    __tablename__ = "trends_data"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    keyword: str = Field(index=True)
    country: str = Field(default="TR")
    trend_score: int = Field(default=0)
    interest_over_time: List[Dict] = Field(sa_column=Column(JSON))
    related_queries: List[Dict] = Field(sa_column=Column(JSON))
    related_topics: List[Dict] = Field(sa_column=Column(JSON))
    chart_data: Optional[str] = Field(default=None)
    created_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)
    updated_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)


class CategoryTrends(SQLModel, table=True):
    __tablename__ = "category_trends"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str = Field(index=True)
    country: str = Field(default="TR")
    average_trend_score: float = Field(default=0.0)
    top_keywords: List[Dict] = Field(sa_column=Column(JSON))
    trends_data: Dict = Field(sa_column=Column(JSON))
    created_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)
    updated_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)


class EcommerceTrends(SQLModel, table=True):
    __tablename__ = "ecommerce_trends"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    keyword: str = Field(index=True)
    category: str = Field(index=True)
    country: str = Field(default="TR")
    trend_score: int = Field(default=0)
    search_volume: Optional[int] = Field(default=None)
    competition_level: str = Field(default="medium")
    seasonal_factor: float = Field(default=1.0)
    interest_over_time: List[Dict] = Field(sa_column=Column(JSON))
    related_queries: List[Dict] = Field(sa_column=Column(JSON))
    chart_data: Optional[str] = Field(default=None)
    created_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)
    updated_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)


class WordCloudData(SQLModel, table=True):
    __tablename__ = "wordcloud_data"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str = Field(index=True)
    country: str = Field(default="TR")
    word_frequencies: Dict[str, int] = Field(sa_column=Column(JSON))
    ngram_data: Dict[str, List[Dict]] = Field(sa_column=Column(JSON))
    wordcloud_image: Optional[str] = Field(default=None)
    total_words: int = Field(default=0)
    unique_words: int = Field(default=0)
    created_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)
    updated_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)


class NgramAnalysis(SQLModel, table=True):
    __tablename__ = "ngram_analysis"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    category: str = Field(index=True)
    country: str = Field(default="TR")
    n_gram_size: int = Field(default=2)
    ngram_frequencies: Dict[str, int] = Field(sa_column=Column(JSON))
    top_ngrams: List[Dict] = Field(sa_column=Column(JSON))
    total_ngrams: int = Field(default=0)
    created_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow)
    updated_at: datetime = Field(sa_column=Column(DateTime), default_factory=datetime.utcnow) 