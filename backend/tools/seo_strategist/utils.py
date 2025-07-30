import requests
from bs4 import BeautifulSoup
import json
from typing import Dict, Any


def extract_content_from_url(url: str) -> Dict[str, Any]:
    """
    URL'den içerik çeker ve temizler
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Extract reviews and ratings
        reviews = []
        ratings = []
        
        # Common review selectors
        review_selectors = [
            '.review', '.comment', '.rating', '.star', '.feedback',
            '[class*="review"]', '[class*="comment"]', '[class*="rating"]',
            '[data-testid*="review"]', '[data-testid*="rating"]'
        ]
        
        for selector in review_selectors:
            elements = soup.select(selector)
            for element in elements:
                review_text = element.get_text().strip()
                if review_text and len(review_text) > 10:
                    reviews.append(review_text)
        
        # Extract product features and specifications
        features = []
        specs = []
        
        # Common feature selectors
        feature_selectors = [
            '.feature', '.specification', '.detail', '.property',
            '[class*="feature"]', '[class*="spec"]', '[class*="detail"]',
            'li', '.product-info', '.product-details'
        ]
        
        for selector in feature_selectors:
            elements = soup.select(selector)
            for element in elements:
                feature_text = element.get_text().strip()
                if feature_text and len(feature_text) > 5 and len(feature_text) < 200:
                    features.append(feature_text)
        
        # Extract prices
        prices = []
        price_selectors = [
            '.price', '.cost', '.amount', '.value',
            '[class*="price"]', '[class*="cost"]', '[data-price]'
        ]
        
        for selector in price_selectors:
            elements = soup.select(selector)
            for element in elements:
                price_text = element.get_text().strip()
                if price_text and any(char.isdigit() for char in price_text):
                    prices.append(price_text)
        
        # Get text content
        text = soup.get_text()
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        # Combine all content
        all_content = text
        if reviews:
            all_content += "\n\nYorumlar:\n" + "\n".join(reviews[:10])  # Limit to 10 reviews
        if features:
            all_content += "\n\nÖzellikler:\n" + "\n".join(features[:20])  # Limit to 20 features
        if prices:
            all_content += "\n\nFiyatlar:\n" + "\n".join(prices[:5])  # Limit to 5 prices
        
        # Get title
        title = soup.find('title')
        title_text = title.get_text() if title else "Başlık bulunamadı"
        
        # Get meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = ""
        if meta_desc and hasattr(meta_desc, 'get'):
            description = meta_desc.get('content', "")
        
        return {
            'title': title_text,
            'description': description,
            'content': all_content[:8000],  # Increased limit for better analysis
            'url': url,
            'reviews': reviews[:10],
            'features': features[:20],
            'prices': prices[:5]
        }
    except Exception as e:
        return {
            'error': f"URL'den içerik çekilemedi: {str(e)}",
            'url': url
        }


def clean_json_codeblock(text: str) -> str:
    """
    Kod bloğu içindeki JSON'u temizler
    """
    # Remove ```json and ``` markers
    text = text.strip()
    if text.startswith('```json'):
        text = text[7:]  # Remove ```json
    elif text.startswith('```'):
        text = text[3:]  # Remove ```
    
    if text.endswith('```'):
        text = text[:-3]  # Remove trailing ```
    
    return text.strip() 