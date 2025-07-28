"""
Simple and Fast TrendAgent with LangChain and Gemini AI for product trend analysis.
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from .prompts import TREND_ANALYSIS_PROMPT_EN, TREND_ANALYSIS_PROMPT_TR
from .utils import format_currency_range
from .schemas import TrendRequest, TrendResponse, ProductSuggestion, TrendAnalysis
load_dotenv()

class TrendAgent:
    """Simple and Fast AI agent for generating product trend suggestions."""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # Configure Gemini API
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Initialize LangChain LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=self.api_key,
            temperature=0.7,
            max_tokens=2000
        )
    
    async def generate_suggestion(self, request: TrendRequest) -> TrendResponse:
        """
        Generate product trend suggestions using simple LangChain + Gemini.
        Args:
            request: TrendRequest object containing user parameters
        Returns:
            TrendResponse object with AI-generated analysis
        """
        try:
            # Prompt language selection
            language = request.language or "tr"
            prompt_template = TREND_ANALYSIS_PROMPT_TR if language == "tr" else TREND_ANALYSIS_PROMPT_EN
            prompt = prompt_template.format(
                category=request.category or "",
                target_country=request.target_country,
                budget_range=request.budget_range or "",
                target_audience=request.target_audience or "",
                additional_notes=request.additional_notes or "",
                product_count=request.product_count or 2,
                trends_data=""
            )
            response = await self.llm.ainvoke(prompt)
            try:
                response_data = self._parse_ai_response(response.content)
                if self._validate_response(response_data):
                    products = []
                    for product_data in response_data.get("products", []):
                        product = ProductSuggestion(
                            product_idea=product_data.get("product_idea", ""),
                            description=product_data.get("description", ""),
                            recommended_price_range=product_data.get("recommended_price_range", ""),
                            target_audience=product_data.get("target_audience", ""),
                            competition_score=product_data.get("competition_score", 5),
                            trend_score=product_data.get("trend_score", 5),
                            profit_margin_estimate=product_data.get("profit_margin_estimate", ""),
                            market_opportunity=product_data.get("market_opportunity", ""),
                            risks_and_challenges=product_data.get("risks_and_challenges", ""),
                            marketing_suggestions=product_data.get("marketing_suggestions", ""),
                            ecommerce_platforms=product_data.get("ecommerce_platforms", []),
                            estimated_demand=product_data.get("estimated_demand", "Medium")
                        )
                        products.append(product)
                    trend_analysis = TrendAnalysis(
                        category_analysis=response_data.get("trend_analysis", {}).get("category_analysis", ""),
                        market_trends=response_data.get("trend_analysis", {}).get("market_trends", ""),
                        seasonal_factors=response_data.get("trend_analysis", {}).get("seasonal_factors", ""),
                        competitive_landscape=response_data.get("trend_analysis", {}).get("competitive_landscape", ""),
                        ai_recommendations=response_data.get("trend_analysis", {}).get("ai_recommendations", "")
                    )
                    return TrendResponse(
                        products=products,
                        trends_data=None,
                        trend_analysis=trend_analysis,
                        summary=response_data.get("summary", ""),
                        next_steps=response_data.get("next_steps", []),
                        created_at=datetime.utcnow()
                    )
                else:
                    return self._get_fallback_response(request)
            except Exception as e:
                return self._get_fallback_response(request)
        except Exception as e:
            return self._get_fallback_response(request)
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        try:
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = response[start_idx:end_idx]
                return json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")
        except Exception as e:
            raise ValueError(f"Invalid JSON in AI response: {e}")
    
    def _validate_response(self, response_data: Dict[str, Any]) -> bool:
        required_fields = ["products", "trend_analysis", "summary", "next_steps"]
        for field in required_fields:
            if field not in response_data:
                return False
        if not isinstance(response_data["products"], list):
            return False
        if len(response_data["products"]) == 0:
            return False
        return True
    
    def _get_fallback_response(self, request: TrendRequest) -> TrendResponse:
        fallback_products = [
            ProductSuggestion(
                product_idea="Akıllı Ev Aleti",
                description="Türkiye pazarında popüler olan akıllı ev aletleri",
                recommended_price_range=format_currency_range("200-500", request.target_country),
                target_audience="Teknoloji meraklıları",
                competition_score=6,
                trend_score=8,
                profit_margin_estimate="30-40%",
                market_opportunity="Akıllı ev pazarı hızla büyüyor",
                risks_and_challenges="Rekabet yoğun, kalite önemli",
                marketing_suggestions="Sosyal medya, influencer marketing",
                ecommerce_platforms=["Trendyol", "Hepsiburada", "Amazon"],
                estimated_demand="Yüksek"
            )
        ]
        trend_analysis = TrendAnalysis(
            category_analysis="Elektronik pazarı Türkiye'de sürekli büyüyor",
            market_trends="Akıllı cihazlar ve kablosuz teknolojiler popüler",
            seasonal_factors="Yılbaşı ve öğrenci sezonu satışları artırır",
            competitive_landscape="Çok sayıda marka var, farklılaşma önemli",
            ai_recommendations="Kaliteli ürün + iyi pazarlama stratejisi"
        )
        return TrendResponse(
            products=fallback_products,
            trends_data=None,
            trend_analysis=trend_analysis,
            summary="Türkiye elektronik pazarında fırsatlar mevcut",
            next_steps=["Pazar araştırması yapın", "Rekabet analizi yapın", "Pazarlama stratejisi geliştirin"],
            created_at=datetime.utcnow()
        ) 