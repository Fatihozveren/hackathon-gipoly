"""
Google Trends analyzer for TrendAgent.
"""

from typing import Dict, List, Any, Optional
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from pytrends.request import TrendReq
from .schemas import GoogleTrendsData


class TrendsAnalyzer:
    """Google Trends data analyzer and chart generator."""
    
    def __init__(self):
        self.pytrends = TrendReq(hl='tr-TR', tz=180)  # Turkey timezone
    
    def get_trends_data(self, keyword: str, country: str = "TR", timeframe: str = "today 12-m") -> GoogleTrendsData:
        """
        Get Google Trends data for a keyword.
        
        Args:
            keyword: Search keyword
            country: Country code (default: TR for Turkey)
            timeframe: Time range for analysis
            
        Returns:
            GoogleTrendsData object with trends information
        """
        try:
            # Build payload
            self.pytrends.build_payload([keyword], cat=0, timeframe=timeframe, geo=country)
            
            # Get interest over time
            interest_over_time = self.pytrends.interest_over_time()
            
            # Get related queries (with error handling)
            related_queries = {}
            try:
                related_queries = self.pytrends.related_queries()
            except Exception as e:
                print(f"Error getting related queries: {e}")
                related_queries = {}
            
            # Get related topics (with error handling)
            related_topics = {}
            try:
                related_topics = self.pytrends.related_topics()
            except Exception as e:
                print(f"Error getting related topics: {e}")
                related_topics = {}
            
            # Calculate trend score (average interest over last 3 months)
            if not interest_over_time.empty and keyword in interest_over_time.columns:
                recent_interest = interest_over_time[keyword].tail(90).mean()
                trend_score = int(recent_interest)
            else:
                trend_score = 0
            
            # Generate chart
            chart_data = self._generate_trends_chart(interest_over_time, keyword)
            
            # Format data for response
            interest_data = []
            if not interest_over_time.empty and keyword in interest_over_time.columns:
                for date, value in interest_over_time[keyword].items():
                    if pd.notna(value):  # Check for NaN values
                        interest_data.append({
                            "date": date.strftime("%Y-%m-%d"),
                            "interest": int(value)
                        })
            
            related_queries_data = []
            if (keyword in related_queries and 
                related_queries[keyword] is not None and 
                'top' in related_queries[keyword] and 
                related_queries[keyword]['top'] is not None and 
                not related_queries[keyword]['top'].empty):
                for _, row in related_queries[keyword]['top'].head(10).iterrows():
                    related_queries_data.append({
                        "query": row['query'],
                        "value": int(row['value'])
                    })
            
            related_topics_data = []
            if (keyword in related_topics and 
                related_topics[keyword] is not None and 
                'top' in related_topics[keyword] and 
                related_topics[keyword]['top'] is not None and 
                not related_topics[keyword]['top'].empty):
                for _, row in related_topics[keyword]['top'].head(10).iterrows():
                    related_topics_data.append({
                        "topic": row['topic_title'],
                        "value": int(row['value'])
                    })
            
            return GoogleTrendsData(
                keyword=keyword,
                trend_score=trend_score,
                interest_over_time=interest_data,
                related_queries=related_queries_data,
                related_topics=related_topics_data,
                chart_data=chart_data
            )
            
        except Exception as e:
            print(f"Error getting trends data: {e}")
            import traceback
            traceback.print_exc()
            return GoogleTrendsData(
                keyword=keyword,
                trend_score=0,
                interest_over_time=[],
                related_queries=[],
                related_topics=[],
                chart_data=None
            )
    
    def _generate_trends_chart(self, interest_data: pd.DataFrame, keyword: str) -> Optional[str]:
        """
        Generate a trends chart and return as base64 encoded image.
        
        Args:
            interest_data: Interest over time data
            keyword: Search keyword
            
        Returns:
            Base64 encoded chart image
        """
        try:
            if interest_data.empty:
                return None
            
            # Create subplots
            fig = make_subplots(
                rows=2, cols=1,
                subplot_titles=(f'"{keyword}" İlgi Trendi', 'Aylık Ortalama İlgi'),
                vertical_spacing=0.1
            )
            
            # Time series plot
            fig.add_trace(
                go.Scatter(
                    x=interest_data.index,
                    y=interest_data[keyword],
                    mode='lines+markers',
                    name='Günlük İlgi',
                    line=dict(color='#1f77b4', width=2),
                    marker=dict(size=4)
                ),
                row=1, col=1
            )
            
            # Monthly average plot
            monthly_avg = interest_data[keyword].resample('M').mean()
            fig.add_trace(
                go.Bar(
                    x=monthly_avg.index,
                    y=monthly_avg.values,
                    name='Aylık Ortalama',
                    marker_color='#ff7f0e'
                ),
                row=2, col=1
            )
            
            # Update layout
            fig.update_layout(
                title=f'"{keyword}" Google Trends Analizi',
                height=600,
                showlegend=True,
                template='plotly_white'
            )
            
            # Update axes
            fig.update_xaxes(title_text="Tarih", row=1, col=1)
            fig.update_yaxes(title_text="İlgi Skoru (0-100)", row=1, col=1)
            fig.update_xaxes(title_text="Ay", row=2, col=1)
            fig.update_yaxes(title_text="Ortalama İlgi", row=2, col=1)
            
            # Convert to base64
            img_bytes = fig.to_image(format="png", width=800, height=600)
            img_base64 = base64.b64encode(img_bytes).decode()
            
            return img_base64
            
        except Exception as e:
            print(f"Error generating chart: {e}")
            return None
    
    def get_multiple_keywords_trends(self, keywords: List[str], country: str = "TR") -> Dict[str, GoogleTrendsData]:
        """
        Get trends data for multiple keywords.
        
        Args:
            keywords: List of search keywords
            country: Country code
            
        Returns:
            Dictionary of GoogleTrendsData objects
        """
        results = {}
        for keyword in keywords:
            results[keyword] = self.get_trends_data(keyword, country)
        return results
    
    def analyze_category_trends(self, category: str, country: str = "TR") -> Dict[str, Any]:
        """
        Analyze trends for a product category.
        
        Args:
            category: Product category
            country: Country code
            
        Returns:
            Category trends analysis
        """
        # Common keywords for different categories
        category_keywords = {
            "Electronics": ["elektronik", "teknoloji", "akıllı telefon", "laptop", "tablet"],
            "Fashion": ["moda", "giyim", "ayakkabı", "aksesuar", "takı"],
            "Home & Garden": ["ev", "bahçe", "dekorasyon", "mobilya", "bitki"],
            "Beauty": ["kozmetik", "makyaj", "cilt bakımı", "parfüm", "saç bakımı"],
            "Sports": ["spor", "fitness", "egzersiz", "yoga", "koşu"],
            "Books": ["kitap", "okuma", "e-kitap", "roman", "eğitim"],
            "Toys": ["oyuncak", "çocuk", "eğitici oyuncak", "puzzle", "lego"],
            "Food": ["yemek", "gıda", "organik", "sağlıklı beslenme", "vegan"]
        }
        
        keywords = category_keywords.get(category, [category])
        trends_data = self.get_multiple_keywords_trends(keywords, country)
        
        # Calculate overall category trend
        total_score = sum(data.trend_score for data in trends_data.values())
        avg_score = total_score / len(trends_data) if trends_data else 0
        
        return {
            "category": category,
            "average_trend_score": avg_score,
            "trends_data": trends_data,
            "top_keywords": sorted(trends_data.items(), key=lambda x: x[1].trend_score, reverse=True)[:3]
        } 