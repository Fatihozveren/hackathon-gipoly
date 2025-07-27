"""
Service for text analysis including word clouds and n-gram analysis.
"""

import re
import base64
import io
from collections import Counter
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from sqlmodel import Session, select
import nltk
from nltk.corpus import stopwords
from nltk.util import ngrams
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

from ..models.trends import TrendsData, WordCloudData, NgramAnalysis
from ..utils.logging_config import get_logger

logger = get_logger(__name__)


class TextAnalysisService:
    """Service for text analysis and word cloud generation."""
    
    def __init__(self):
        self.stop_words = set()
        self._initialize_nltk()
    
    def _initialize_nltk(self):
        """Initialize NLTK resources."""
        try:
            # Download required NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            
            # Get Turkish stop words
            self.stop_words = set(stopwords.words('turkish'))
            
            # Add custom stop words for e-commerce
            custom_stops = {
                've', 'ile', 'için', 'bu', 'bir', 'da', 'de', 'mi', 'mu', 'mı', 'mü',
                'en', 'çok', 'daha', 'kadar', 'gibi', 'kadar', 'için', 'göre',
                'yeni', 'eski', 'büyük', 'küçük', 'iyi', 'kötü', 'güzel', 'kötü',
                'ucuz', 'pahalı', 'kaliteli', 'kalitesiz', 'marka', 'ürün', 'model',
                'renk', 'boyut', 'fiyat', 'indirim', 'kampanya', 'satış', 'alış'
            }
            self.stop_words.update(custom_stops)
            
        except Exception as e:
            logger.warning(f"Could not initialize NLTK: {e}")
            self.stop_words = {'ve', 'ile', 'için', 'bu', 'bir', 'da', 'de'}
    
    def preprocess_text(self, text: str) -> List[str]:
        """
        Preprocess text for analysis.
        
        Args:
            text: Input text
            
        Returns:
            List of cleaned words
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep Turkish characters
        text = re.sub(r'[^a-zçğıöşü\s]', ' ', text)
        
        # Simple tokenization (split by whitespace)
        words = text.split()
        
        # Remove stop words and short words
        words = [word for word in words if word not in self.stop_words and len(word) > 2]
        
        return words
    
    def generate_ngrams(self, words: List[str], n: int = 2) -> List[Tuple[str, ...]]:
        """
        Generate n-grams from words.
        
        Args:
            words: List of words
            n: N-gram size (2 for bigrams, 3 for trigrams, etc.)
            
        Returns:
            List of n-grams
        """
        return list(ngrams(words, n))
    
    def analyze_text_data(self, db: Session, category: str, country: str = "TR") -> Dict:
        """
        Analyze text data for a category and generate word frequencies and n-grams.
        
        Args:
            db: Database session
            category: Category to analyze
            country: Country code
            
        Returns:
            Dictionary with analysis results
        """
        # Get all trends data for the category
        trends_data = db.exec(
            select(TrendsData)
            .where(TrendsData.country == country)
            .where(TrendsData.updated_at >= datetime.utcnow() - timedelta(hours=24))
        ).all()
        
        if not trends_data:
            logger.warning(f"No trends data found for category: {category}")
            return {}
        
        # Collect all text data
        all_text = []
        
        for trend in trends_data:
            # Add keyword
            all_text.append(trend.keyword)
            
            # Add related queries
            if trend.related_queries:
                for query in trend.related_queries:
                    if isinstance(query, dict) and 'query' in query:
                        all_text.append(query['query'])
            
            # Add related topics
            if trend.related_topics:
                for topic in trend.related_topics:
                    if isinstance(topic, dict) and 'topic' in topic:
                        all_text.append(topic['topic'])
        
        # Combine all text
        combined_text = ' '.join(all_text)
        
        # Preprocess text
        words = self.preprocess_text(combined_text)
        
        # Generate word frequencies
        word_freq = Counter(words)
        
        # Generate n-grams
        bigrams = self.generate_ngrams(words, 2)
        trigrams = self.generate_ngrams(words, 3)
        
        bigram_freq = Counter([' '.join(bigram) for bigram in bigrams])
        trigram_freq = Counter([' '.join(trigram) for trigram in trigrams])
        
        return {
            'word_frequencies': dict(word_freq.most_common(50)),
            'bigram_frequencies': dict(bigram_freq.most_common(30)),
            'trigram_frequencies': dict(trigram_freq.most_common(20)),
            'total_words': len(words),
            'unique_words': len(word_freq),
            'total_bigrams': len(bigram_freq),
            'total_trigrams': len(trigram_freq)
        }
    
    def generate_wordcloud(self, word_frequencies: Dict[str, int], 
                          width: int = 800, height: int = 600) -> str:
        """
        Generate word cloud image from word frequencies.
        
        Args:
            word_frequencies: Dictionary of word: frequency
            width: Image width
            height: Image height
            
        Returns:
            Base64 encoded image
        """
        try:
            # Create word cloud
            wordcloud = WordCloud(
                width=width,
                height=height,
                background_color='white',
                max_words=100,
                colormap='viridis',
                font_path=None,  # Use default font
                prefer_horizontal=0.7,
                relative_scaling=0.5
            )
            
            # Generate word cloud
            wordcloud.generate_from_frequencies(word_frequencies)
            
            # Convert to image
            plt.figure(figsize=(10, 8))
            plt.imshow(wordcloud, interpolation='bilinear')
            plt.axis('off')
            
            # Save to bytes
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', bbox_inches='tight', dpi=150)
            img_buffer.seek(0)
            
            # Convert to base64
            img_base64 = base64.b64encode(img_buffer.getvalue()).decode()
            
            plt.close()
            
            return img_base64
            
        except Exception as e:
            logger.error(f"Error generating word cloud: {e}")
            return None
    
    async def update_wordcloud_data(self, db: Session, category: str, country: str = "TR") -> Dict:
        """
        Update word cloud data for a category.
        
        Args:
            db: Database session
            category: Category to analyze
            country: Country code
            
        Returns:
            Dictionary with update results
        """
        try:
            # Analyze text data
            analysis_result = self.analyze_text_data(db, category, country)
            
            if not analysis_result:
                return {'error': 'No data to analyze'}
            
            # Generate word cloud
            wordcloud_image = self.generate_wordcloud(analysis_result['word_frequencies'])
            
            # Prepare ngram data
            ngram_data = {
                'bigrams': [
                    {'ngram': ngram, 'frequency': freq}
                    for ngram, freq in analysis_result['bigram_frequencies'].items()
                ],
                'trigrams': [
                    {'ngram': ngram, 'frequency': freq}
                    for ngram, freq in analysis_result['trigram_frequencies'].items()
                ]
            }
            
            # Check if wordcloud data already exists
            existing_data = db.exec(
                select(WordCloudData)
                .where(WordCloudData.category == category)
                .where(WordCloudData.country == country)
            ).first()
            
            if existing_data:
                # Update existing data
                existing_data.word_frequencies = analysis_result['word_frequencies']
                existing_data.ngram_data = ngram_data
                existing_data.wordcloud_image = wordcloud_image
                existing_data.total_words = analysis_result['total_words']
                existing_data.unique_words = analysis_result['unique_words']
                existing_data.updated_at = datetime.utcnow()
            else:
                # Create new data
                wordcloud_data = WordCloudData(
                    category=category,
                    country=country,
                    word_frequencies=analysis_result['word_frequencies'],
                    ngram_data=ngram_data,
                    wordcloud_image=wordcloud_image,
                    total_words=analysis_result['total_words'],
                    unique_words=analysis_result['unique_words']
                )
                db.add(wordcloud_data)
            
            # Update ngram analysis
            await self._update_ngram_analysis(db, category, country, analysis_result)
            
            db.commit()
            
            return {
                'category': category,
                'total_words': analysis_result['total_words'],
                'unique_words': analysis_result['unique_words'],
                'wordcloud_generated': wordcloud_image is not None
            }
            
        except Exception as e:
            logger.error(f"Error updating wordcloud data for {category}: {e}")
            db.rollback()
            return {'error': str(e)}
    
    async def _update_ngram_analysis(self, db: Session, category: str, country: str, 
                                   analysis_result: Dict) -> None:
        """Update n-gram analysis data."""
        try:
            # Update bigrams
            bigram_data = db.exec(
                select(NgramAnalysis)
                .where(NgramAnalysis.category == category)
                .where(NgramAnalysis.country == country)
                .where(NgramAnalysis.n_gram_size == 2)
            ).first()
            
            if bigram_data:
                bigram_data.ngram_frequencies = analysis_result['bigram_frequencies']
                bigram_data.top_ngrams = [
                    {'ngram': ngram, 'frequency': freq}
                    for ngram, freq in analysis_result['bigram_frequencies'].items()
                ][:20]
                bigram_data.total_ngrams = analysis_result['total_bigrams']
                bigram_data.updated_at = datetime.utcnow()
            else:
                bigram_analysis = NgramAnalysis(
                    category=category,
                    country=country,
                    n_gram_size=2,
                    ngram_frequencies=analysis_result['bigram_frequencies'],
                    top_ngrams=[
                        {'ngram': ngram, 'frequency': freq}
                        for ngram, freq in analysis_result['bigram_frequencies'].items()
                    ][:20],
                    total_ngrams=analysis_result['total_bigrams']
                )
                db.add(bigram_analysis)
            
            # Update trigrams
            trigram_data = db.exec(
                select(NgramAnalysis)
                .where(NgramAnalysis.category == category)
                .where(NgramAnalysis.country == country)
                .where(NgramAnalysis.n_gram_size == 3)
            ).first()
            
            if trigram_data:
                trigram_data.ngram_frequencies = analysis_result['trigram_frequencies']
                trigram_data.top_ngrams = [
                    {'ngram': ngram, 'frequency': freq}
                    for ngram, freq in analysis_result['trigram_frequencies'].items()
                ][:15]
                trigram_data.total_ngrams = analysis_result['total_trigrams']
                trigram_data.updated_at = datetime.utcnow()
            else:
                trigram_analysis = NgramAnalysis(
                    category=category,
                    country=country,
                    n_gram_size=3,
                    ngram_frequencies=analysis_result['trigram_frequencies'],
                    top_ngrams=[
                        {'ngram': ngram, 'frequency': freq}
                        for ngram, freq in analysis_result['trigram_frequencies'].items()
                    ][:15],
                    total_ngrams=analysis_result['total_trigrams']
                )
                db.add(trigram_analysis)
                
        except Exception as e:
            logger.error(f"Error updating ngram analysis: {e}")
    
    def get_wordcloud_data(self, db: Session, category: str, country: str = "TR") -> Optional[WordCloudData]:
        """Get word cloud data from database."""
        return db.exec(
            select(WordCloudData)
            .where(WordCloudData.category == category)
            .where(WordCloudData.country == country)
        ).first()
    
    def get_ngram_analysis(self, db: Session, category: str, n_gram_size: int = 2, 
                          country: str = "TR") -> Optional[NgramAnalysis]:
        """Get n-gram analysis from database."""
        return db.exec(
            select(NgramAnalysis)
            .where(NgramAnalysis.category == category)
            .where(NgramAnalysis.country == country)
            .where(NgramAnalysis.n_gram_size == n_gram_size)
        ).first()
    
    def get_all_wordcloud_data(self, db: Session, country: str = "TR") -> List[WordCloudData]:
        """Get all word cloud data from database."""
        return db.exec(
            select(WordCloudData)
            .where(WordCloudData.country == country)
            .order_by(WordCloudData.updated_at.desc())
        ).all() 